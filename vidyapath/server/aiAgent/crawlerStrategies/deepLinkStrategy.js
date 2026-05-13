/**
 * 🕸️ Deep Link Strategy — Spider crawling from seed pages
 * Discovers opportunity pages by following internal links up to 2 levels deep
 */

const axios = require('axios');
const cheerio = require('cheerio');

const OPPORTUNITY_LINK_PATTERNS = [
  /scholar/i, /competition/i, /olympiad/i, /scheme/i, /exam/i,
  /apply/i, /register/i, /deadline/i, /notification/i, /award/i,
  /fellowship/i, /internship/i, /talent/i, /camp/i, /admission/i,
  /yojana/i, /programme/i, /grant/i, /stipend/i, /contest/i,
];

const SKIP_LINK_PATTERNS = [
  /login/i, /signup/i, /cart/i, /mailto/i, /javascript/i,
  /\.pdf$/i, /\.jpg$/i, /\.png$/i, /\.css$/i, /\.js$/i,
  /#$/i, /tel:/i, /whatsapp/i,
];

/**
 * Extract all internal links from a page
 */
async function extractLinks(baseUrl, maxLinks = 50) {
  try {
    const response = await axios.get(baseUrl, {
      timeout: 12000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
      maxRedirects: 3,
    });

    const $ = cheerio.load(response.data);
    const baseHost = new URL(baseUrl).hostname;
    const links = new Set();

    $('a[href]').each((_, el) => {
      try {
        let href = $(el).attr('href');
        if (!href) return;
        
        // Resolve relative URLs
        if (href.startsWith('/')) href = `${new URL(baseUrl).origin}${href}`;
        else if (!href.startsWith('http')) return;

        const linkHost = new URL(href).hostname;
        if (linkHost !== baseHost) return; // Internal links only
        if (SKIP_LINK_PATTERNS.some(p => p.test(href))) return;

        links.add(href.split('#')[0].split('?')[0]); // Remove fragments and params
      } catch {}
    });

    return [...links].slice(0, maxLinks);
  } catch (error) {
    return [];
  }
}

/**
 * Score a URL for opportunity relevance
 */
function scoreUrl(url, linkText = '') {
  let score = 0;
  const combined = `${url} ${linkText}`.toLowerCase();
  for (const pattern of OPPORTUNITY_LINK_PATTERNS) {
    if (pattern.test(combined)) score += 10;
  }
  // Bonus for specific URL depth (not homepage)
  const path = new URL(url).pathname;
  if (path.split('/').filter(Boolean).length >= 2) score += 5;
  return score;
}

/**
 * Run deep link discovery from seed pages
 * @param {Array} sources - Sources with url field
 * @param {Function} processCallback - Process each discovered page
 * @param {object} options
 */
async function runDeepLinkStrategy(sources, processCallback, options = {}) {
  const { maxDepth = 2, maxPagesPerSite = 10, delayMs = 1000 } = options;
  const results = { found: 0, processed: 0, errors: 0 };
  const globalVisited = new Set();

  for (const source of sources) {
    const visited = new Set();
    const toVisit = [{ url: source.url, depth: 0 }];

    console.log(`🕸️ DeepLink: Crawling ${source.name || source.url}...`);
    let pagesProcessed = 0;

    while (toVisit.length > 0 && pagesProcessed < maxPagesPerSite) {
      const { url, depth } = toVisit.shift();
      if (visited.has(url) || globalVisited.has(url)) continue;
      visited.add(url);
      globalVisited.add(url);

      try {
        // Extract links for further crawling (if not max depth)
        if (depth < maxDepth) {
          const links = await extractLinks(url, 30);
          // Score and prioritize links
          const scoredLinks = links
            .filter(l => !visited.has(l))
            .map(l => ({ url: l, depth: depth + 1, score: scoreUrl(l) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 15);
          toVisit.push(...scoredLinks);
        }

        // Only process pages that score well (skip generic pages)
        if (depth > 0 && scoreUrl(url) < 5) continue;

        const { scrapePageText } = require('./rssStrategy');
        const text = await scrapePageText(url);
        if (!text || text.length < 100) continue;

        results.found++;
        await processCallback({
          title: `${source.name || 'Opportunity'} — Discovery`,
          text,
          url,
          sourceType: 'web_scrape',
          organizerName: source.name || new URL(url).hostname,
          strategy: 'deeplink',
          sourceId: source.id,
        });
        results.processed++;
        pagesProcessed++;

        await new Promise(r => setTimeout(r, delayMs));
      } catch (error) {
        results.errors++;
      }
    }
  }

  return results;
}

module.exports = { runDeepLinkStrategy, extractLinks, scoreUrl };
