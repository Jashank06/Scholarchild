const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });
const { processOpportunity } = require('../aiAgent/index');
const AgentScanLog = require('../models/AgentScanLog');
const TARGET_URLS = require('../aiAgent/targetUrls');

async function runVisualCrawler() {
  console.log('🚀 Starting Visual AI Crawler...');
  
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const scanLog = await AgentScanLog.create({
    scanType: 'bulk_sources',
    source: 'Visual Crawler (Developer Mode)',
    startedAt: new Date(),
    status: 'running',
  });

  // Launch Puppeteer in non-headless mode
  const browser = await puppeteer.launch({
    headless: false, // This makes the Chrome window visible
    defaultViewport: null,
    args: ['--start-maximized']
  });

  const page = await browser.newPage();
  let totalFound = 0, totalErrors = 0, totalCreated = 0;

  for (const url of TARGET_URLS) {
    try {
      console.log(`\\n🤖 Navigating to: ${url}`);
      // Go to URL and wait until the network is idle
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Extract page title
      const pageTitle = await page.title();
      console.log(`📄 Reading: ${pageTitle}`);

      // Extract all meaningful text
      const extractedText = await page.evaluate(() => {
        // Remove noise
        const elementsToRemove = document.querySelectorAll('script, style, nav, footer, iframe, noscript, .ad');
        elementsToRemove.forEach(el => el.remove());

        const paragraphs = [];
        const headingsAndParagraphs = document.querySelectorAll('h1, h2, h3, p, li');
        headingsAndParagraphs.forEach(el => {
          const text = el.innerText.trim();
          if (text.length > 30) {
            paragraphs.push(text);
          }
        });
        return paragraphs.join('\\n\\n').substring(0, 10000);
      });

      if (!extractedText || extractedText.length < 100) {
        console.log(`⚠️ Skipped: Not enough text found on ${url}`);
        totalErrors++;
        continue;
      }

      totalFound++;
      console.log(`🧠 Passing ${extractedText.length} characters to AI Pipeline...`);

      // Feed into AI pipeline
      const result = await processOpportunity({
        title: pageTitle || `Opportunity from ${new URL(url).hostname}`,
        text: extractedText,
        url: url,
        sourceType: 'web_scrape',
        organizerName: new URL(url).hostname,
      });

      if (result.success && !result.agentOpportunity?.duplicateCheck?.isDuplicate) {
        console.log(`✅ Created new opportunity!`);
        totalCreated++;
      } else if (result.success && result.agentOpportunity?.duplicateCheck?.isDuplicate) {
        console.log(`🔁 Skipped: Duplicate detected`);
      } else {
        console.log(`❌ Rejected by AI: ${result.reason}`);
        totalErrors++;
      }

      // Wait a bit to simulate human reading and prevent bans
      await new Promise(r => setTimeout(r, 2000));

    } catch (error) {
      console.error(`❌ Error scraping ${url}:`, error.message);
      totalErrors++;
    }
  }

  console.log('\\n🏁 Visual Crawl Complete!');
  await browser.close();

  scanLog.status = 'completed';
  scanLog.completedAt = new Date();
  scanLog.durationMs = Date.now() - scanLog.startedAt.getTime();
  scanLog.opportunitiesFound = totalFound;
  scanLog.opportunitiesCreated = totalCreated;
  scanLog.errorsEncountered = totalErrors;
  scanLog.summary = `Visual Crawler finished. Scanned ${TARGET_URLS.length} URLs. Found: ${totalFound}, Created: ${totalCreated}, Errors: ${totalErrors}`;
  await scanLog.save();

  console.log(scanLog.summary);
  process.exit(0);
}

runVisualCrawler();
