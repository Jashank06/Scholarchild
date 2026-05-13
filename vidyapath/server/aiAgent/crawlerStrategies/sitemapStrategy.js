/**
 * 🗺️ Sitemap Strategy — Discover pages from sitemap.xml
 * Auto-discovers and filters opportunity-related pages from sitemaps
 */

const axios = require('axios');
const cheerio = require('cheerio');

// URL patterns that likely contain opportunities
const OPPORTUNITY_URL_PATTERNS = [
  /scholar/i, /competition/i, /olympiad/i, /contest/i, /exam/i,
  /scheme/i, /fellowship/i, /internship/i, /camp/i, /workshop/i,
  /award/i, /grant/i, /stipend/i, /apply/i, /registration/i,
  /deadline/i, /eligibility/i, /notification/i, /admission/i,
  /yojana/i, /programme/i, /program/i, /talent/i, /merit/i,
];

// Patterns to SKIP
const SKIP_PATTERNS = [
  /login/i, /signup/i, /cart/i, /checkout/i, /privacy/i,
  /terms/i, /cookie/i, /sitemap/i, /feed/i, /rss/i,
  /\.pdf$/i, /\.jpg$/i, /\.png$/i, /\.css$/i, /\.js$/i,
  /tag\//i, /author\//i, /page\/\d+/i, /wp-content/i,
];

/**
 * Fetch and parse sitemap.xml from a domain
 */
async function fetchSitemap(baseUrl) {
  const urls = [];
  const sitemapUrls = [
    `${baseUrl}/sitemap.xml`,
    `${baseUrl}/sitemap_index.xml`,
    `${baseUrl}/sitemap1.xml`,
  ];

  for (const sitemapUrl of sitemapUrls) {
    try {
      const response = await axios.get(sitemapUrl, {
        timeout: 10000,
        headers: { 'User-Agent': 'Kushaagra-AI-Agent/2.0' },
      });

      const $ = cheerio.load(response.data, { xmlMode: true });

      // Check for sitemap index (contains links to other sitemaps)
      const sitemapLocs = [];
      $('sitemap loc').each((_, el) => sitemapLocs.push($(el).text().trim()));

      if (sitemapLocs.length > 0) {
        // Parse child sitemaps (max 3 to be polite)
        for (const childUrl of sitemapLocs.slice(0, 3)) {
          try {
            const childResp = await axios.get(childUrl, { timeout: 10000, headers: { 'User-Agent': 'Kushaagra-AI-Agent/2.0' } });
            const child$ = cheerio.load(childResp.data, { xmlMode: true });
            child$('url loc').each((_, el) => urls.push(child$(el).text().trim()));
          } catch {}
        }
      }

      // Direct URL entries
      $('url loc').each((_, el) => urls.push($(el).text().trim()));

      if (urls.length > 0) break; // Found valid sitemap
    } catch {
      continue;
    }
  }

  return [...new Set(urls)];
}

/**
 * Filter sitemap URLs to only opportunity-related pages
 */
function filterOpportunityUrls(urls, maxUrls = 30) {
  return urls
    .filter(url => {
      // Skip unwanted patterns
      if (SKIP_PATTERNS.some(p => p.test(url))) return false;
      // Prefer opportunity-related URLs
      return OPPORTUNITY_URL_PATTERNS.some(p => p.test(url));
    })
    .slice(0, maxUrls);
}

/**
 * Run sitemap strategy for a list of sources
 * @param {Array} sources - Sources with url field
 * @param {Function} processCallback - Process each discovered page
 * @param {object} options
 */
async function runSitemapStrategy(sources, processCallback, options = {}) {
  const { delayMs = 1000, maxPagesPerSite = 15 } = options;
  const results = { found: 0, processed: 0, errors: 0, sitesScanned: 0 };

  for (const source of sources) {
    try {
      console.log(`🗺️ Sitemap: Scanning ${source.name || source.url}...`);
      const allUrls = await fetchSitemap(source.url.replace(/\/$/, ''));
      
      if (allUrls.length === 0) {
        console.log(`  → No sitemap found for ${source.url}`);
        continue;
      }

      const opportunityUrls = filterOpportunityUrls(allUrls, maxPagesPerSite);
      console.log(`  → Found ${allUrls.length} URLs, ${opportunityUrls.length} look like opportunities`);
      results.sitesScanned++;

      for (const url of opportunityUrls) {
        results.found++;
        try {
          // Scrape page text using cheerio
          const { scrapePageText } = require('./rssStrategy');
          const text = await scrapePageText(url);
          if (!text || text.length < 100) continue;

          await processCallback({
            title: `${source.name || 'Opportunity'} — ${new URL(url).pathname}`,
            text,
            url,
            sourceType: 'web_scrape',
            organizerName: source.name || new URL(url).hostname,
            strategy: 'sitemap',
            sourceId: source.id,
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

module.exports = { runSitemapStrategy, fetchSitemap, filterOpportunityUrls };
