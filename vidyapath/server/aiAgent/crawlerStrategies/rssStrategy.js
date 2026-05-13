/**
 * 📡 RSS Strategy — Enhanced Google News + Custom RSS feeds
 * Searches 25+ queries in English, Hindi, Marathi
 */

const Parser = require('rss-parser');
const axios = require('axios');
const cheerio = require('cheerio');

const parser = new Parser({
  headers: {
    'User-Agent': 'VidyaPath-AI-Agent/2.0 (Student Opportunity Finder)',
    'Accept': 'application/rss+xml, application/xml, text/xml',
  },
  timeout: 15000,
});

function getGoogleNewsUrl(query) {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`;
}

/**
 * Fetch articles from a single RSS query
 */
async function fetchRSSFeed(query, maxItems = 8) {
  try {
    const feedUrl = getGoogleNewsUrl(query);
    const feed = await parser.parseURL(feedUrl);
    return (feed.items || []).slice(0, maxItems).map(item => ({
      title: item.title || '',
      url: item.link || '',
      snippet: item.contentSnippet || item.content || item.summary || '',
      source: item.creator || item.source || 'Google News',
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
    }));
  } catch (error) {
    console.error(`RSS fetch failed for "${query}":`, error.message);
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
    
    const $ = cheerio.load(response.data);
    $('script, style, nav, footer, header, iframe, noscript, .ad, .advertisement, .sidebar, .menu, .cookie').remove();
    
    const paragraphs = [];
    $('p, h1, h2, h3, h4, li, td, th, dd, dt, blockquote, .content, .description, article').each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 25) paragraphs.push(text);
    });
    
    return paragraphs.join('\n\n').substring(0, maxChars);
  } catch (error) {
    return null;
  }
}

/**
 * Run RSS strategy across all queries
 * @param {string[]} queries - Search queries
 * @param {Function} processCallback - Callback for each discovered item
 * @param {object} options - { maxPerQuery, delayMs }
 */
async function runRSSStrategy(queries, processCallback, options = {}) {
  const { maxPerQuery = 8, delayMs = 800 } = options;
  const processedUrls = new Set();
  const results = { found: 0, processed: 0, errors: 0 };

  for (const query of queries) {
    try {
      console.log(`📡 RSS: Searching "${query.substring(0, 40)}..."...`);
      const items = await fetchRSSFeed(query, maxPerQuery);
      
      for (const item of items) {
        if (!item.url || processedUrls.has(item.url)) continue;
        processedUrls.add(item.url);
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
            sourceType: 'web_scrape',
            organizerName: item.source,
            strategy: 'rss',
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

  return results;
}

module.exports = { runRSSStrategy, fetchRSSFeed, scrapePageText };
