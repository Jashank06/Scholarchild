/**
 * 📡 RSS Strategy v3.0 — Official Government & Scholarship RSS Feeds
 * REMOVED: Google News (was bringing news articles, NOT actual scholarships)
 * NOW: Direct official RSS/Atom feeds from scholarship portals
 */

const Parser = require('rss-parser');
const axios = require('axios');
const cheerio = require('cheerio');

const parser = new Parser({
  headers: {
    'User-Agent': 'Kushaagra-AI-Agent/3.0 (Student Opportunity Finder)',
    'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml',
  },
  timeout: 15000,
});

// ═══ OFFICIAL RSS/ATOM FEEDS (actual scholarship data, NOT news) ═══
// NOTE: Most Indian govt/edu sites don't have WP-style RSS at /feed
// These are the proven working feeds. Buddy4Study etc handled via sitemap+cheerio.
const OFFICIAL_RSS_FEEDS = [
  // ─── Proven Working Feeds ───
  { url: 'https://www.buddy4study.com/blogs/feed', name: 'Buddy4Study Blog', priority: 'high', category: 'scholarship' },
];

/**
 * Fetch articles from a single RSS feed
 */
async function fetchRSSFeed(feedConfig, maxItems = 10) {
  try {
    const feed = await parser.parseURL(feedConfig.url);
    return (feed.items || []).slice(0, maxItems).map(item => ({
      title: item.title || '',
      url: item.link || '',
      snippet: item.contentSnippet || item.content || item.summary || '',
      source: feedConfig.name,
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      category: feedConfig.category,
      priority: feedConfig.priority,
    }));
  } catch (error) {
    console.error(`📡 RSS fetch failed for "${feedConfig.name}":`, error.message);
    return [];
  }
}

/**
 * Scrape full text from a URL using cheerio
 */
async function scrapePageText(url, maxChars = 8000) {
  try {
    const response = await axios.get(url, {
      timeout: 12000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-IN,en;q=0.9,hi;q=0.8',
      },
      maxRedirects: 3,
    });

    // Try site-specific extractors first
    try {
      const { trySiteExtract } = require('../siteExtractors/dispatcher');
      const siteResults = trySiteExtract(response.data, url);
      if (siteResults && siteResults.length > 0) {
        // Return formatted text from site-specific extractor
        return siteResults.map(r => `${r.title}\n\n${r.text}`).join('\n\n---\n\n').substring(0, maxChars);
      }
    } catch { /* fall through to generic extraction */ }

    const $ = cheerio.load(response.data);
    $('script, style, nav, footer, header, iframe, noscript, .ad, .advertisement, .sidebar, .menu, .cookie, .popup, .modal').remove();

    const paragraphs = [];
    $('p, h1, h2, h3, h4, li, td, th, dd, dt, blockquote, .content, .description, article, .scheme-details, .scholarship-info').each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 25) paragraphs.push(text);
    });

    return paragraphs.join('\n\n').substring(0, maxChars);
  } catch (error) {
    return null;
  }
}

/**
 * Filter: is this URL likely to be an actual scholarship/competition page?
 * Rejects generic news articles, opinion pieces, etc.
 */
function isLikelyScholarshipPage(item) {
  const url = (item.url || '').toLowerCase();
  const title = (item.title || '').toLowerCase();

  // Reject generic news URLs
  const newsPatterns = [
    /\/opinion\//i, /\/editorial\//i, /\/blog\//i, /\/video\//i,
    /\/podcast\//i, /\/gallery\//i, /\/live-updates\//i,
    /twitter\.com/i, /youtube\.com/i, /facebook\.com/i,
  ];
  if (newsPatterns.some(p => p.test(url))) return false;

  // Must have scholarship-related keywords in title
  const scholarshipKeywords = [
    'scholarship', 'competition', 'olympiad', 'scheme', 'yojana',
    'exam', 'fellowship', 'internship', 'apply', 'registration',
    'deadline', 'eligibility', 'award', 'stipend', 'grant',
    'छात्रवृत्ति', 'योजना', 'प्रतियोगिता', 'परीक्षा',
  ];
  return scholarshipKeywords.some(kw => title.includes(kw));
}

/**
 * Run RSS strategy across official feeds
 * @param {Array} feeds - Array of feed configs (or uses OFFICIAL_RSS_FEEDS)
 * @param {Function} processCallback - Callback for each discovered item
 * @param {object} options - { maxPerFeed, delayMs }
 */
async function runRSSStrategy(feeds, processCallback, options = {}) {
  // If old-style search queries are passed, use official feeds instead
  const feedsToUse = Array.isArray(feeds) && feeds[0]?.url
    ? feeds
    : OFFICIAL_RSS_FEEDS;

  const { maxPerFeed = 10, delayMs = 800 } = options;
  const processedUrls = new Set();
  const results = { found: 0, processed: 0, errors: 0, skippedNews: 0 };

  // Sort by priority: critical first
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const sortedFeeds = [...feedsToUse].sort(
    (a, b) => (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4)
  );

  for (const feed of sortedFeeds) {
    try {
      console.log(`📡 RSS: Fetching "${feed.name}"...`);
      const items = await fetchRSSFeed(feed, maxPerFeed);

      for (const item of items) {
        if (!item.url || processedUrls.has(item.url)) continue;
        processedUrls.add(item.url);

        // Filter out generic news articles
        if (!isLikelyScholarshipPage(item)) {
          results.skippedNews++;
          continue;
        }

        results.found++;

        try {
          // Try to get full page text
          let fullText = await scrapePageText(item.url);
          if (!fullText || fullText.length < 100) {
            fullText = `${item.title} ${item.snippet}`;
          }
          if (fullText.length < 50) continue;

          await processCallback({
            title: item.title,
            text: fullText,
            url: item.url,
            sourceType: 'official_rss',
            organizerName: item.source,
            strategy: 'rss',
            category: item.category,
          });
          results.processed++;
        } catch (error) {
          results.errors++;
        }

        await new Promise(r => setTimeout(r, delayMs));
      }
    } catch (error) {
      results.errors++;
    }
  }

  console.log(`📡 RSS Summary: Found ${results.found}, Processed ${results.processed}, Skipped News ${results.skippedNews}`);
  return results;
}

module.exports = { runRSSStrategy, fetchRSSFeed, scrapePageText, OFFICIAL_RSS_FEEDS };
