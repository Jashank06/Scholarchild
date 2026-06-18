/**
 * 🕷️ Crawler Engine — Master orchestrator for all crawling strategies
 * Coordinates RSS, Sitemap, DeepLink, and Puppeteer strategies
 */

const AgentScanLog = require('../models/AgentScanLog');
const AgentOpportunity = require('../models/AgentOpportunity');
const { SOURCES, getSourcesByStrategy, getAllEnabledSources } = require('./sourceRegistry');
const { runRSSStrategy, OFFICIAL_RSS_FEEDS, scrapePageText } = require('./crawlerStrategies/rssStrategy');
const { runSitemapStrategy } = require('./crawlerStrategies/sitemapStrategy');
const { runDeepLinkStrategy } = require('./crawlerStrategies/deepLinkStrategy');
const { runPlaywrightStrategy } = require('./crawlerStrategies/playwrightStrategy');
const { trySiteExtract } = require('./siteExtractors/dispatcher');

// ═══ Blocked News Domains — prevents news articles from entering the pipeline ═══
const BLOCKED_DOMAINS = [
  'ndtv.com', 'indianexpress.com', 'timesofindia', 'hindustantimes',
  'thehindu.com', 'economictimes', 'news18.com', 'bhaskar.com',
  'amarujala.com', 'indiatoday.in', 'google.com/news',
];

/**
 * Check if URL was already processed recently
 */
async function isUrlProcessed(url) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7); // 7 day window
  const baseUrl = url.split('?')[0].split('#')[0];
  const existing = await AgentOpportunity.findOne({
    'source.url': { $regex: baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') },
    createdAt: { $gte: cutoff },
  });
  return !!existing;
}

/**
 * Run the full multi-strategy crawler
 * @param {string|null} userId - Admin ID or null for scheduled
 * @param {object} options - { strategies: ['rss','sitemap','deeplink','puppeteer'], maxConcurrent }
 */
async function runCrawlerEngine(userId = null, options = {}) {
  const { strategies = ['rss', 'cheerio', 'playwright'], scanId = null } = options;

  const scanLog = scanId ? await AgentScanLog.findById(scanId) : await AgentScanLog.create({
    scanType: 'bulk_sources',
    source: `Multi-Strategy Crawler (${strategies.join(', ')})`,
    triggeredBy: userId,
    startedAt: new Date(),
    status: 'running',
  });

  const totals = { found: 0, created: 0, duplicates: 0, errors: 0, sourcesScanned: 0 };
  const findings = [];
  const processedUrls = new Set();

  // Process callback — feeds into AI pipeline
  const processItem = async (item) => {
    if (processedUrls.has(item.url)) return;
    processedUrls.add(item.url);

    try {
      // Block known news domains
      try {
        const hostname = new URL(item.url).hostname;
        if (BLOCKED_DOMAINS.some(d => hostname.includes(d))) {
          return; // skip news articles silently
        }
      } catch {}

      if (await isUrlProcessed(item.url)) {
        // Skip URL dedup for site-specific evaluators — cards are fresh extractions
        if (!item.skipUrlDedup) {
          totals.duplicates++;
          return;
        }
      }

      const { processOpportunity } = require('./index');
      const result = await processOpportunity({
        title: item.title,
        text: item.text,
        url: item.url,
        sourceType: item.sourceType || 'web_scrape',
        organizerName: item.organizerName,
        applyLink: item.applyLink || '',
      });

      if (result.success) {
        if (result.agentOpportunity?.duplicateCheck?.isDuplicate) {
          totals.duplicates++;
          findings.push({ title: item.title, status: 'duplicate', agentOpportunityId: result.agentOpportunity._id });
        } else {
          totals.created++;
          findings.push({ title: item.title, status: 'created', agentOpportunityId: result.agentOpportunity._id });
        }
      } else {
        if (!result.skipped) totals.errors++;
      }
    } catch (error) {
      totals.errors++;
    }
  };

  // ═══ PHASE 1: RSS Strategy ═══
  if (strategies.includes('rss')) {
    try {
      console.log('\n🤖 ═══ PHASE 1: RSS Strategy ═══');
      const rssResults = await runRSSStrategy(OFFICIAL_RSS_FEEDS, processItem, { maxPerFeed: 15, delayMs: 800 });
      totals.found += rssResults.found;
      totals.sourcesScanned += OFFICIAL_RSS_FEEDS.length;
      console.log(`📡 RSS: Found ${rssResults.found}, Processed ${rssResults.processed}`);
    } catch (error) {
      console.error('RSS Strategy failed:', error.message);
    }
  }

  // ═══ PHASE 2: Cheerio Sources (fast, no JS) ═══
  if (strategies.includes('cheerio')) {
    try {
      console.log('\n🤖 ═══ PHASE 2: Direct Cheerio Sources ═══');
      const cheerioSources = getSourcesByStrategy('cheerio');
      
      // Sort by priority: critical → high → medium → low
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const sortedCheerio = [...cheerioSources].sort((a, b) => (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4));
      
      // Use sitemap strategy for cheerio sources (increased from 35 to 60)
      const sitemapResults = await runSitemapStrategy(sortedCheerio.slice(0, 60), processItem, { delayMs: 1000, maxPagesPerSite: 8 });
      totals.found += sitemapResults.found;
      totals.sourcesScanned += sitemapResults.sitesScanned;
      console.log(`🗺️ Sitemap: Scanned ${sitemapResults.sitesScanned} sites, Found ${sitemapResults.found}`);

      // Also do deep link discovery on high-priority cheerio sources (increased from 15 to 25)
      const highPrioritySources = cheerioSources.filter(s => s.priority === 'critical' || s.priority === 'high').slice(0, 25);
      const deepResults = await runDeepLinkStrategy(highPrioritySources, processItem, { maxDepth: 1, maxPagesPerSite: 5, delayMs: 1000 });
      totals.found += deepResults.found;
      console.log(`🕸️ DeepLink: Found ${deepResults.found}, Processed ${deepResults.processed}`);
    } catch (error) {
      console.error('Cheerio Strategy failed:', error.message);
    }
  }

  // ═══ PHASE 3: Playwright Sources (JS-heavy) ═══
  if (strategies.includes('playwright') || strategies.includes('puppeteer')) {
    try {
      console.log('\n🤖 ═══ PHASE 3: Playwright Sources ═══');
      // Still fetch sources marked as 'puppeteer' in the registry
      const playwrightSources = getSourcesByStrategy('puppeteer')
        .filter(s => s.priority === 'critical' || s.priority === 'high' || s.priority === 'medium')
        .sort((a, b) => (a.priority === 'critical' ? -1 : a.priority === 'high' ? 0 : 1) - (b.priority === 'critical' ? -1 : b.priority === 'high' ? 0 : 1))
        .slice(0, 40);
      
      const playwrightResults = await runPlaywrightStrategy(playwrightSources, processItem, { delayMs: 2000 });
      totals.found += playwrightResults.found;
      totals.sourcesScanned += playwrightSources.length;
      console.log(`🖥️ Playwright: Found ${playwrightResults.found}, Processed ${playwrightResults.processed}`);
    } catch (error) {
      console.error('Playwright Strategy failed:', error.message);
    }
  }

  // ═══ PHASE 4: District Portals (bulk scan of all district .nic.in sites) ═══
  if (strategies.includes('cheerio')) {
    try {
      console.log('\n🤖 ═══ PHASE 4: District Portals ═══');
      const districtSources = getAllEnabledSources().filter(s => s.id.startsWith('dist-'));
      let districtFound = 0, districtProcessed = 0;
      for (const source of districtSources) {
        try {
          const pageText = await scrapePageText(source.url, 5000);
          if (pageText && pageText.length > 100) {
            districtFound++;
            await processItem({
              title: source.name + ' — Latest Updates',
              text: pageText.substring(0, 4000),
              url: source.url,
              sourceType: 'district_portal',
              organizerName: source.name,
            });
            districtProcessed++;
          }
          await new Promise(r => setTimeout(r, 500));
        } catch (e) {
          totals.errors++;
        }
      }
      totals.found += districtFound;
      totals.sourcesScanned += districtSources.length;
      console.log(`🏛️ District: Scanned ${districtSources.length} portals, Found ${districtFound}, Processed ${districtProcessed}`);
    } catch (error) {
      console.error('District Portal phase failed:', error.message);
    }
  }

  // ═══ Finalize ═══
  scanLog.status = 'completed';
  scanLog.completedAt = new Date();
  scanLog.durationMs = Date.now() - scanLog.startedAt.getTime();
  scanLog.opportunitiesFound = totals.found;
  scanLog.opportunitiesCreated = totals.created;
  scanLog.duplicatesSkipped = totals.duplicates;
  scanLog.errorsEncountered = totals.errors;
  scanLog.findings = findings.slice(0, 100); // Cap at 100
  scanLog.summary = `🤖 Multi-Strategy Crawl Complete | Sources: ${totals.sourcesScanned} | Found: ${totals.found} | Created: ${totals.created} | Duplicates: ${totals.duplicates} | Errors: ${totals.errors}`;
  await scanLog.save();

  console.log(`\n${scanLog.summary}`);
  return scanLog;
}

module.exports = { runCrawlerEngine };
