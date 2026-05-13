/**
 * 🕷️ AI Web Crawler
 * Autonomously hunts for student opportunities via RSS feeds and news sites.
 */

const Parser = require('rss-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const AgentScanLog = require('../models/AgentScanLog');
const AgentOpportunity = require('../models/AgentOpportunity');
const TARGET_URLS = require('./targetUrls');

const parser = new Parser({
  headers: {
    'User-Agent': 'VidyaPath-AI-Agent/1.0',
    'Accept': 'application/rss+xml, application/xml, application/atom+xml, text/xml',
  }
});

// Search queries for Google News RSS
const SEARCH_QUERIES = [
  'scholarships for students India',
  'school student competitions India',
  'government scheme for students India',
  'internships for school students India',
  'olympiad exam for students',
];

/**
 * Get Google News RSS URL for a specific query
 */
function getGoogleNewsUrl(query) {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`;
}

/**
 * Fetch and extract text from a webpage using cheerio
 */
async function scrapeWebpage(url) {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // Remove unwanted elements
    $('script, style, nav, footer, header, iframe, noscript, .ad, .advertisement').remove();
    
    // Extract main text (focus on paragraphs and headings)
    const paragraphs = [];
    $('p, h1, h2, h3, h4, li').each((i, el) => {
      const text = $(el).text().trim();
      if (text.length > 30) { // Ignore short generic links
        paragraphs.push(text);
      }
    });
    
    return paragraphs.join('\\n\\n').substring(0, 5000); // Limit length
  } catch (error) {
    console.error(`Crawler error scraping ${url}:`, error.message);
    return null;
  }
}

/**
 * Check if we've already processed this URL recently
 */
async function isUrlProcessed(url) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30); // Check last 30 days
  
  const existing = await AgentOpportunity.findOne({ 
    'source.url': { $regex: url.split('?')[0] }, // Match base URL without query params
    createdAt: { $gte: cutoff } 
  });
  
  return !!existing;
}

/**
 * Run the crawler on all RSS feeds
 * @param {string} userId - Admin ID triggering the scan (null if scheduled)
 */
async function runCrawler(userId = null) {
  const scanLog = await AgentScanLog.create({
    scanType: 'bulk_sources',
    source: 'Google News RSS Aggregator',
    triggeredBy: userId,
    startedAt: new Date(),
    status: 'running',
  });

  let totalFound = 0, totalCreated = 0, totalErrors = 0, duplicatesSkipped = 0;
  const findings = [];
  const processedUrls = new Set();

  for (const query of SEARCH_QUERIES) {
    try {
      console.log(`🤖 Crawler: Fetching RSS for "${query}"...`);
      const feedUrl = getGoogleNewsUrl(query);
      const feed = await parser.parseURL(feedUrl);
      
      // Process top 5 items per query to avoid rate limits/overload
      const items = feed.items.slice(0, 5);
      
      for (const item of items) {
        try {
          const rawUrl = item.link;
          if (processedUrls.has(rawUrl)) continue;
          processedUrls.add(rawUrl);
          totalFound++;

          // Skip if already in DB
          if (await isUrlProcessed(rawUrl)) {
            duplicatesSkipped++;
            continue;
          }

          // 1. We have title and snippet from RSS. Now scrape full text.
          console.log(`🤖 Crawler: Scraping content from ${item.title.substring(0, 50)}...`);
          let fullText = await scrapeWebpage(rawUrl);
          
          // Fallback to RSS snippet if scraping fails or yields too little text
          if (!fullText || fullText.length < 100) {
            fullText = item.contentSnippet || item.content || item.summary || '';
          }

          if (!fullText || fullText.length < 50) {
            totalErrors++;
            findings.push({ title: item.title, status: 'error', error: 'Could not extract sufficient text even from RSS' });
            continue;
          }

          // 2. Feed into Agent Pipeline
          const { processOpportunity } = require('./index');
          const result = await processOpportunity({
            title: item.title,
            text: fullText,
            url: rawUrl,
            sourceType: 'web_scrape',
            organizerName: item.source || 'News Source',
          });

          if (result.success) {
            if (result.agentOpportunity?.duplicateCheck?.isDuplicate) {
              duplicatesSkipped++;
              findings.push({ title: item.title, status: 'duplicate', agentOpportunityId: result.agentOpportunity._id });
            } else {
              totalCreated++;
              findings.push({ title: item.title, status: 'created', agentOpportunityId: result.agentOpportunity._id });
            }
          } else {
            totalErrors++;
            findings.push({ title: item.title, status: 'error', error: result.reason || 'Pipeline rejected' });
          }
          
          // Be nice to servers
          await new Promise(r => setTimeout(r, 1000));
        } catch (itemErr) {
          totalErrors++;
          console.error(`Error processing item ${item.title}:`, itemErr.message);
        }
      }
    } catch (feedErr) {
      console.error(`Error fetching feed for ${query}:`, feedErr.message);
    }
  }

  // Phase 2: Crawl direct TARGET_URLS
  console.log(`🤖 Crawler: Moving to Phase 2 (Direct URLs)...`);
  for (const url of TARGET_URLS) {
    try {
      if (processedUrls.has(url)) continue;
      processedUrls.add(url);

      if (await isUrlProcessed(url)) {
        duplicatesSkipped++;
        continue;
      }

      console.log(`🤖 Crawler: Scraping content from ${url}...`);
      const fullText = await scrapeWebpage(url);

      if (!fullText || fullText.length < 50) {
        totalErrors++;
        findings.push({ title: url, status: 'error', error: 'Could not extract sufficient text from URL' });
        continue;
      }

      const { processOpportunity } = require('./index');
      const result = await processOpportunity({
        title: `Opportunity from ${new URL(url).hostname}`,
        text: fullText,
        url: url,
        sourceType: 'web_scrape',
        organizerName: new URL(url).hostname,
      });

      if (result.success) {
        if (result.agentOpportunity?.duplicateCheck?.isDuplicate) {
          duplicatesSkipped++;
          findings.push({ title: url, status: 'duplicate', agentOpportunityId: result.agentOpportunity._id });
        } else {
          totalCreated++;
          findings.push({ title: url, status: 'created', agentOpportunityId: result.agentOpportunity._id });
        }
      } else {
        totalErrors++;
        findings.push({ title: url, status: 'error', error: result.reason || 'Pipeline rejected' });
      }
      
      // Be nice to servers
      await new Promise(r => setTimeout(r, 1500));
    } catch (urlErr) {
      totalErrors++;
      console.error(`Error processing URL ${url}:`, urlErr.message);
    }
  }

  // Finalize scan log
  scanLog.status = 'completed';
  scanLog.completedAt = new Date();
  scanLog.durationMs = Date.now() - scanLog.startedAt.getTime();
  scanLog.opportunitiesFound = totalFound;
  scanLog.opportunitiesCreated = totalCreated;
  scanLog.duplicatesSkipped = duplicatesSkipped;
  scanLog.errorsEncountered = totalErrors;
  scanLog.findings = findings;
  scanLog.summary = `Crawler finished. Found: ${totalFound}, Created: ${totalCreated}, Skipped: ${duplicatesSkipped}, Errors: ${totalErrors}`;
  await scanLog.save();

  console.log(`🤖 Crawler Complete: ${scanLog.summary}`);
  return scanLog;
}

module.exports = { runCrawler };
