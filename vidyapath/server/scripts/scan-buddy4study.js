/**
 * 🧪 Buddy4Study Test Scanner v3 — full browser render, no blocking
 */
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);

async function scan() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected.\n');

  const { processOpportunity } = require('../aiAgent/index');

  console.log('🎭 Launching Playwright (full render)...');
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  // DON'T block anything - the SPA needs all resources
  console.log('📋 Loading Buddy4Study (full render, ~15s wait)...');
  await page.goto('https://www.buddy4study.com/scholarships', { 
    waitUntil: 'domcontentloaded', 
    timeout: 30000 
  });
  
  console.log('  Waiting for scholarship cards to render...');
  await page.waitForTimeout(10000);
  
  // Scroll to trigger lazy loading
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(3000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(2000);

  // Check what's actually on the page
  const debugInfo = await page.evaluate(() => ({
    title: document.title,
    bodyTextLen: document.body.innerText.length,
    allLinks: document.querySelectorAll('a').length,
    h2Count: document.querySelectorAll('h2').length,
    h3Count: document.querySelectorAll('h3').length,
    // Check for specific Buddy4Study patterns
    hasScholarshipLinks: document.querySelectorAll('a[href*="scholarship"]').length,
    hasCards: document.querySelectorAll('[class*="card"]').length,
    // Sample text
    bodySnippet: document.body.innerText.substring(0, 300),
  }));
  console.log('  Page info:', JSON.stringify(debugInfo, null, 2));

  // Extract scholarship cards from rendered page
  console.log('\n🔍 Extracting individual scholarship cards...');
  const cards = await page.evaluate(() => {
    const results = [];
    const seen = new Set();

    // Buddy4Study cards: look for blocks with Deadline + Award + Eligibility pattern
    const allText = document.body.innerText;
    const lines = allText.split('\n').map(l => l.trim()).filter(Boolean);

    // Scan for "Featured" + scholarship name blocks
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];

      // Card starts with "Featured" or "X days to go" or "Last day to go"
      if (/^(Featured|\d+\s+(days?|hours?)\s+to\s+go|Last\s+day\s+to\s+go)$/i.test(line)) {
        const cardLines = [];
        
        // Collect lines until we hit the next card marker or end
        while (i < lines.length) {
          const currentLine = lines[i];
          // Stop at next card marker
          if (cardLines.length > 0 && /^(Featured|\d+\s+(days?|hours?)\s+to\s+go|Last\s+day\s+to\s+go|Deadline|Filters|Search|Select Class)$/i.test(currentLine)) {
            break;
          }
          cardLines.push(currentLine);
          i++;
        }

        if (cardLines.length >= 3) {
          const cardText = cardLines.join('\n');
          // Title is usually the first non-marker line that's a proper name
          let title = '';
          for (const l of cardLines) {
            if (!/^(Featured|deadline|award|eligibility|last updated|filters|\d+\s+(days?|hours?))/i.test(l) && l.length > 10) {
              title = l;
              break;
            }
          }

          if (title && !seen.has(title)) {
            seen.add(title);
            results.push({ title, text: cardText, link: '' });
          }
        }
      } else if (/^Deadline$/i.test(line) && i + 1 < lines.length) {
        // Cards starting with "Deadline" marker
        const cardLines = [lines[i], lines[i + 1] || ''];
        let j = i + 2;
        while (j < lines.length) {
          if (/^(Featured|Deadline|\d+\s+(days?|hours?)\s+to\s+go|Filters)/i.test(lines[j])) break;
          cardLines.push(lines[j]);
          j++;
        }
        i = j;

        if (cardLines.length >= 3) {
          const cardText = cardLines.join('\n');
          const title = lines[i + 1] || cardLines[1] || '';
          if (title && !seen.has(title) && title.length > 5) {
            seen.add(title);
            results.push({ title, text: cardText, link: '' });
          }
        }
      } else {
        i++;
      }
    }

    // Fallback: if no structured cards, use the page title
    if (results.length === 0) {
      results.push({ title: document.title, text: allText.substring(0, 8000), link: window.location.href });
    }

    return results;
  });

  console.log(`  ✅ Extracted ${cards.length} individual cards`);
  await browser.close();

  if (cards.length === 0 || (cards.length === 1 && cards[0].text.length < 200)) {
    console.log('❌ Page did not render scholarship data.');
    await mongoose.disconnect();
    return;
  }

  console.log('═'.repeat(60));

  let created = 0, skipped = 0;
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    console.log(`\n📋 Processing text block (${card.text.length} chars)...`);

    try {
      const result = await processOpportunity({
        title: card.title,
        text: card.text,
        url: card.link,
        sourceType: 'web_scrape',
        organizerName: 'Buddy4Study',
      });

      if (result.success && !result.skipped) {
        created++;
        console.log(`  ✅ CREATED`);
      } else {
        skipped++;
        console.log(`  ⏭️ SKIPPED: ${result.reason?.substring(0, 100)}`);
      }
    } catch (e) {
      console.log(`  ❌ ${e.message}`);
    }
  }

  console.log(`\n📊 Created=${created} | Skipped=${skipped}`);
  await mongoose.disconnect();
}

scan().catch(e => { console.error(e); process.exit(1); });
