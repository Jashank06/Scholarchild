/**
 * ⚡ AI Enricher v2.0
 * OpenAI-powered enrichment with auto-tagging, organizer URL discovery, and Hindi summary
 */

const { callAI, PROMPTS } = require('./geminiClient');
const axios = require('axios');
const cheerio = require('cheerio');

const SKIP_DOMAINS = ['buddy4study', 'scholarshipportal', 'careers360', 'collegedekho', 
  'shiksha', 'jagranjosh', 'scholarsbox', 'edumithra', 'vidyasaarathi', 'medhavi',
  'facebook.com', 'twitter.com', 'youtube.com', 'instagram.com', 'linkedin.com',
  'wikipedia.org', 'quora.com', 'reddit.com', 'medium.com'];

function isValidOfficialUrl(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (SKIP_DOMAINS.some(d => hostname.includes(d))) return false;
    return url.startsWith('https://') || url.startsWith('http://');
  } catch { return false; }
}

/**
 * 🌐 Tier 1: DuckDuckGo Lite (free, fast)
 */
async function searchDuckDuckGo(query) {
  try {
    const response = await axios.get('https://lite.duckduckgo.com/lite/', {
      params: { q: query },
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html' },
      timeout: 8000,
    });
    const $ = cheerio.load(response.data);
    const results = [];
    $('a[rel="nofollow"]').each((i, el) => {
      const href = $(el).attr('href');
      const uddgMatch = href?.match(/uddg=(https?%3A%2F%2F[^&]+)/);
      if (uddgMatch) results.push(decodeURIComponent(uddgMatch[1]));
    });
    $('a[class="result-link"]').each((i, el) => {
      const href = $(el).attr('href');
      if (href?.startsWith('http')) results.push(href);
    });
    for (const url of results) {
      if (isValidOfficialUrl(url)) return url;
    }
  } catch {}
  return null;
}

/**
 * 🌐 Tier 2: Google scrape (free, no API key)
 */
async function searchGoogle(query) {
  try {
    const response = await axios.get('https://www.google.com/search', {
      params: { q: query, num: 10, hl: 'en' },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 10000,
    });
    const $ = cheerio.load(response.data);
    const results = [];
    // Google search result links
    $('a[href^="http"]').each((i, el) => {
      const href = $(el).attr('href');
      // Google wraps URLs like /url?q=https://example.com&...
      const urlMatch = href?.match(/[?&]q=(https?%3A%2F%2F[^&]+)/);
      if (urlMatch) results.push(decodeURIComponent(urlMatch[1]));
      else if (href?.startsWith('https://') && !href.includes('google.com')) results.push(href);
    });
    for (const url of results) {
      if (isValidOfficialUrl(url)) return url;
    }
  } catch {}
  return null;
}

/**
 * 🔗 Smart: 3-tier URL discovery — DDG → Google → OpenAI
 */
async function discoverOfficialWebsite(opportunity) {
  const name = opportunity.title || '';
  const organizer = opportunity.organizer?.name || '';
  
  const currentLink = opportunity.application?.externalLink || '';
  if (currentLink && !currentLink.includes('buddy4study.com') && currentLink.startsWith('http')) {
    return null;
  }

  const query = `${name} ${organizer} apply official website`;

  // Tier 1: DuckDuckGo search
  console.log(`  🔍 DDG: ${name.substring(0, 50)}...`);
  let url = await searchDuckDuckGo(query);
  if (url) {
    console.log(`  ✅ DDG found: ${url}`);
    return url;
  }

  // Tier 2: Google search
  console.log(`  🔍 Google: ${name.substring(0, 50)}...`);
  url = await searchGoogle(query);
  if (url) {
    console.log(`  ✅ Google found: ${url}`);
    return url;
  }

  // Tier 3: OpenAI API knowledge
  console.log(`  🧠 AI inferring...`);
  try {
    const prompt = `Find the OFFICIAL website URL for this scholarship/opportunity. Use your knowledge of real organizations.

Name: "${name}"
Organizer: "${organizer}"

Return the EXACT official website URL. If unknown, return empty string.
For govt schemes → .gov.in portal. For corporate → company website. For intl → program's official page.
NEVER return buddy4study.com, careers360.com, or any aggregator URL.`;

    const result = await callAI(prompt, { 
      cacheKey: `official-url:${name}`, 
      schemaName: 'discoverOfficialWebsite' 
    });
    if (result?.url && isValidOfficialUrl(result.url)) {
      console.log(`  ✅ AI found: ${result.url}`);
      return result.url;
    }
  } catch {}

  return null;
}

const TAG_RULES = [
  { pattern: /(?:low.?income|bpl|below poverty|ews|economically weaker)/i, tag: 'low-income' },
  { pattern: /(?:girls?|female|women|mahila|beti)/i, tag: 'girls' },
  { pattern: /(?:sc|st|obc|dalit|tribal|scheduled)/i, tag: 'reserved-category' },
  { pattern: /(?:stem|science|tech|engineering|math)/i, tag: 'STEM' },
  { pattern: /(?:rural|village|gramin|panchayat)/i, tag: 'rural' },
  { pattern: /(?:disabled|handicapped|divyang|pwbd)/i, tag: 'disability' },
  { pattern: /(?:merit|topper|rank|top\s*\d)/i, tag: 'merit-based' },
  { pattern: /(?:minority|muslim|christian|sikh|buddhist|jain|parsi)/i, tag: 'minority' },
  { pattern: /(?:sports|athlete|physical|khel)/i, tag: 'sports' },
  { pattern: /(?:coding|programming|hackathon|software)/i, tag: 'coding' },
  { pattern: /(?:art|painting|drawing|creative|craft)/i, tag: 'arts' },
  { pattern: /(?:national|rashtriya)/i, tag: 'national' },
  { pattern: /(?:international|global|world)/i, tag: 'international' },
  { pattern: /(?:free|no\s*fee|muft)/i, tag: 'free' },
  { pattern: /(?:government|sarkari|govt)/i, tag: 'government' },
  { pattern: /(?:olympiad|imo|ipho|icho|ioi)/i, tag: 'olympiad' },
];

function generateTags(text, existingTags = []) {
  const tags = new Set(existingTags.map(t => t.toLowerCase().trim()).filter(Boolean));
  const combined = (text || '').toLowerCase();
  for (const { pattern, tag } of TAG_RULES) {
    if (pattern.test(combined)) tags.add(tag);
  }
  return [...tags];
}

function generateShortDescription(description, maxLen = 250) {
  if (!description) return '';
  if (description.length <= maxLen) return description;
  const truncated = description.substring(0, maxLen);
  const lastSentence = truncated.lastIndexOf('.');
  if (lastSentence > maxLen * 0.5) return truncated.substring(0, lastSentence + 1);
  return truncated.substring(0, truncated.lastIndexOf(' ')) + '...';
}

function normalizeOrganizerType(name, website) {
  const n = (name || '').toLowerCase();
  const w = (website || '').toLowerCase();
  if (/(?:ministry|govt|government|sarkari|department|parishad|council|board)/.test(n) || w.includes('.gov.in') || w.includes('.nic.in')) return 'government';
  if (/(?:ngo|foundation|trust|charitable|welfare|society)/.test(n) || w.includes('.org')) return 'ngo';
  if (/(?:university|college|school|institute|vidyalaya|iit|nit|iisc)/.test(n) || w.includes('.ac.in') || w.includes('.edu')) return 'institution';
  if (/(?:corp|company|ltd|inc|tech|google|microsoft|infosys|tata|reliance)/.test(n)) return 'corporate';
  return 'unknown';
}

/**
 * Enrich opportunity with AI + rule-based inference
 */
async function enrich(opportunity, rawText = '') {
  const log = [];
  const combined = `${opportunity.title || ''} ${opportunity.description || ''} ${rawText}`;

  // 1. Auto-generate tags (fast, rule-based)
  const oldTags = opportunity.tags || [];
  const newTags = generateTags(combined, oldTags);
  if (newTags.length > oldTags.length) {
    const added = newTags.filter(t => !oldTags.includes(t));
    log.push({ field: 'tags', action: 'generated', originalValue: oldTags.join(', '), newValue: newTags.join(', '), reasoning: `Auto-generated: ${added.join(', ')}` });
  }
  opportunity.tags = newTags;

  // 2. Short description
  if (!opportunity.shortDescription && opportunity.description) {
    opportunity.shortDescription = generateShortDescription(opportunity.description);
    log.push({ field: 'shortDescription', action: 'generated', originalValue: '', newValue: opportunity.shortDescription, reasoning: 'Auto-generated' });
  }

  // 3. Organizer type inference
  if (!opportunity.organizer) opportunity.organizer = {};
  if (!opportunity.organizer.type || opportunity.organizer.type === 'unknown') {
    const inferred = normalizeOrganizerType(opportunity.organizer.name, opportunity.application?.externalLink);
    if (inferred !== 'unknown') {
      log.push({ field: 'organizer.type', action: 'inferred', originalValue: 'unknown', newValue: inferred, reasoning: 'From name/URL' });
      opportunity.organizer.type = inferred;
    }
  }

  // 4. Category default
  if (!opportunity.category || opportunity.category === 'other') {
    if (newTags.includes('STEM') || newTags.includes('coding')) opportunity.category = 'science';
    else if (newTags.includes('olympiad')) opportunity.category = 'olympiad';
    else if (newTags.includes('arts')) opportunity.category = 'arts';
    else if (newTags.includes('sports')) opportunity.category = 'sports';
    else opportunity.category = 'general';
    log.push({ field: 'category', action: 'inferred', originalValue: 'other', newValue: opportunity.category, reasoning: 'From tags' });
  }

  // 5. Rewards description
  if (opportunity.rewards?.cashAmount && !opportunity.rewards?.description) {
    opportunity.rewards.description = `₹${opportunity.rewards.cashAmount.toLocaleString('en-IN')}`;
    log.push({ field: 'rewards.description', action: 'generated', originalValue: '', newValue: opportunity.rewards.description, reasoning: 'From amount' });
  }

  // 6. AI Enrichment (only for high-value opportunities)
  if (opportunity.priorityScore?.overall > 50 || !opportunity.shortDescription) {
    try {
      const prompt = PROMPTS.enrich(JSON.stringify(opportunity));
      const aiResult = await callAI(prompt, { cacheKey: `enrich:${opportunity.title}`, schemaName: 'enrich' });
      
      if (aiResult) {
        if (aiResult.shortDescription && !opportunity.shortDescription) {
          opportunity.shortDescription = aiResult.shortDescription;
          log.push({ field: 'shortDescription', action: 'ai_generated', originalValue: '', newValue: aiResult.shortDescription, reasoning: 'Gemini AI' });
        }
        if (aiResult.tags?.length > 0) {
          const aiTags = aiResult.tags.filter(t => !opportunity.tags.includes(t));
          opportunity.tags = [...new Set([...opportunity.tags, ...aiTags])].slice(0, 12);
        }
        if (aiResult.preparationTips) opportunity.preparationTips = aiResult.preparationTips;
        if (aiResult.studentFriendlySummary) opportunity.studentFriendlySummary = aiResult.studentFriendlySummary;
        if (aiResult.hindiSummary) opportunity.hindiSummary = aiResult.hindiSummary;
      }
    } catch {}
  }

  return { opportunity, enrichmentLog: log };
}

module.exports = { enrich, discoverOfficialWebsite, generateTags, generateShortDescription, normalizeOrganizerType };
