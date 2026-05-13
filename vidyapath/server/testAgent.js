require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const { processUrlScan, processOpportunity, runCrawler } = require('./aiAgent/index');
const { runCrawlerEngine } = require('./aiAgent/crawlerEngine');

// Connect to DB for the test
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
}

async function runTest() {
  await connectDB();
  
  const testType = process.argv[2] || 'rss'; // 'url' or 'rss'
  
  if (testType === 'url') {
    // Test a specific URL
    const targetUrl = process.argv[3] || 'https://www.buddy4study.com/scholarship/hdfc-bank-parivartan-s-ecss-programme';
    console.log(`\\n🔍 TESTING URL SCAN: ${targetUrl}`);
    console.log('⏳ Running AI Pipeline (Detect -> Classify -> Extract -> Enrich)...\\n');
    
    const result = await processUrlScan(targetUrl, null);
    console.log('\\n📊 RESULTS:');
    console.log(JSON.stringify(result, null, 2));
    
  } else if (testType === 'rss') {
    // Quick test of the RSS crawler (fastest way to see it finding new things)
    console.log('\\n📡 TESTING RSS STRATEGY (Quick Run)');
    console.log('⏳ Searching Google News for opportunities...\\n');
    
    // Run only RSS strategy to keep it quick
    const result = await runCrawlerEngine(null, { strategies: ['rss'] });
    console.log('\\n📊 CRAWL RESULTS:');
    console.log(`Found: ${result.opportunitiesFound}, Created: ${result.opportunitiesCreated}, Duplicates: ${result.duplicatesSkipped}`);
    
  } else if (testType === 'full') {
    // Test the entire Multi-Strategy Crawler
    console.log('\\n🚀 TESTING FULL SYSTEM (Multi-Strategy Crawler)');
    console.log('⏳ Running RSS, Sitemap, DeepLink, and Puppeteer strategies... This will take a few minutes.\\n');
    
    // Run ALL strategies
    const result = await runCrawlerEngine(null, { strategies: ['rss', 'cheerio', 'puppeteer'] });
    console.log('\\n📊 FULL CRAWL RESULTS:');
    console.log(`Sources Scanned: ${result.sourcesScanned}`);
    console.log(`Opportunities Found: ${result.opportunitiesFound}`);
    console.log(`Newly Created: ${result.opportunitiesCreated}`);
    console.log(`Duplicates Skipped: ${result.duplicatesSkipped}`);
    console.log(`Errors: ${result.errorsEncountered}`);
    
  } else if (testType === 'stats') {
    const { getAgentStats } = require('./aiAgent/index');
    const stats = await getAgentStats();
    console.log('\\n📈 AGENT STATS:');
    console.log(stats);
  }
  
  console.log('\\n✅ Test completed. Exiting...');
  process.exit(0);
}

runTest();
