/**
 * 🕷️ Crawler Engine — Master orchestrator for all crawling strategies
 * Coordinates RSS, Sitemap, DeepLink, and Puppeteer strategies
 */

const AgentScanLog = require('../models/AgentScanLog');
const AgentOpportunity = require('../models/AgentOpportunity');
const { SOURCES, SEARCH_QUERIES, getSourcesByStrategy, getAllEnabledSources } = require('./sourceRegistry');
const { runRSSStrategy } = require('./crawlerStrategies/rssStrategy');
const { runSitemapStrategy } = require('./crawlerStrategies/sitemapStrategy');
const { runDeepLinkStrategy } = require('./crawlerStrategies/deepLinkStrategy');
const { runPuppeteerStrategy } = require('./crawlerStrategies/puppeteerStrategy');

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
  const { strategies = ['rss', 'cheerio', 'puppeteer'], scanId = null } = options;

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
      if (await isUrlProcessed(item.url)) {
        totals.duplicates++;
        return;
      }

      const { processOpportunity } = require('./index');
      const result = await processOpportunity({
        title: item.title,
        text: item.text,
        url: item.url,
        sourceType: item.sourceType || 'web_scrape',
        organizerName: item.organizerName,
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
      const rssResults = await runRSSStrategy(SEARCH_QUERIES, processItem, { maxPerQuery: 5, delayMs: 800 });
      totals.found += rssResults.found;
      totals.sourcesScanned += SEARCH_QUERIES.length;
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
      
      // Use sitemap strategy for cheerio sources
      const sitemapResults = await runSitemapStrategy(cheerioSources.slice(0, 15), processItem, { delayMs: 1000, maxPagesPerSite: 8 });
      totals.found += sitemapResults.found;
      totals.sourcesScanned += sitemapResults.sitesScanned;
      console.log(`🗺️ Sitemap: Scanned ${sitemapResults.sitesScanned} sites, Found ${sitemapResults.found}`);

      // Also do deep link discovery on high-priority cheerio sources
      const highPrioritySources = cheerioSources.filter(s => s.priority === 'critical' || s.priority === 'high').slice(0, 10);
      const deepResults = await runDeepLinkStrategy(highPrioritySources, processItem, { maxDepth: 1, maxPagesPerSite: 5, delayMs: 1000 });
      totals.found += deepResults.found;
      console.log(`🕸️ DeepLink: Found ${deepResults.found}, Processed ${deepResults.processed}`);
    } catch (error) {
      console.error('Cheerio Strategy failed:', error.message);
    }
  }

  // ═══ PHASE 3: Puppeteer Sources (JS-heavy) ═══
  if (strategies.includes('puppeteer')) {
    try {
      console.log('\n🤖 ═══ PHASE 3: Puppeteer Sources ═══');
      const puppeteerSources = getSourcesByStrategy('puppeteer')
        .filter(s => s.priority === 'critical' || s.priority === 'high')
        .slice(0, 10); // Limit to prevent long runs
      
      const puppeteerResults = await runPuppeteerStrategy(puppeteerSources, processItem, { delayMs: 2000 });
      totals.found += puppeteerResults.found;
      totals.sourcesScanned += puppeteerSources.length;
      console.log(`🖥️ Puppeteer: Found ${puppeteerResults.found}, Processed ${puppeteerResults.processed}`);
    } catch (error) {
      console.error('Puppeteer Strategy failed:', error.message);
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
