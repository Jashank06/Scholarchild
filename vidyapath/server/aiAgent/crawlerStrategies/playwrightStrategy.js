/**
 * 🎭 Playwright Stealth Crawler Strategy
 * Replaces basic Puppeteer for JS-heavy or bot-protected portals (NSP, MahaDBT)
 * v2.0 — Site-specific extractors for Buddy4Study, Unstop, etc.
 */

const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();

// Add stealth plugin to Playwright
chromium.use(stealth);

// ═══ Site-Specific Evaluators ═══
const SITE_EVALUATORS = {
  'buddy4study.com': async (page, url) => {
    // Extract scholarship cards from listing page (text-based parser — proven in tests)
    await page.waitForTimeout(8000);
    
    // Scroll to trigger lazy loading
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);

    const cards = await page.evaluate(() => {
      const results = [];
      const seen = new Set();
      const allText = document.body.innerText;
      const lines = allText.split('\n').map(l => l.trim()).filter(Boolean);

      let i = 0;
      while (i < lines.length) {
        const line = lines[i];

        if (/^(Featured|\d+\s+(days?|hours?)\s+to\s+go|Last\s+day\s+to\s+go)$/i.test(line)) {
          const cardLines = [];
          while (i < lines.length) {
            const cl = lines[i];
            if (cardLines.length > 0 && /^(Featured|\d+\s+(days?|hours?)\s+to\s+go|Last\s+day\s+to\s+go|Deadline|Filters|Search|Select Class)$/i.test(cl)) break;
            cardLines.push(cl);
            i++;
          }
          if (cardLines.length >= 3) {
            const cardText = cardLines.join('\n');
            let title = '';
            for (const l of cardLines) {
              if (!/^(Featured|deadline|award|eligibility|last updated|filters|\d+\s+(days?|hours?))/i.test(l) && l.length > 10) {
                title = l; break;
              }
            }
            if (title && !seen.has(title)) {
              seen.add(title);
              results.push({ title, text: cardText, link: '', deadline: null, applyLink: '' });
            }
          }
        } else if (/^Deadline$/i.test(line) && i + 1 < lines.length) {
          const cardLines = [lines[i], lines[i + 1] || ''];
          let j = i + 2;
          while (j < lines.length && !/^(Featured|Deadline|\d+\s+(days?|hours?)\s+to\s+go|Filters)/i.test(lines[j])) {
            cardLines.push(lines[j]); j++;
          }
          i = j;
          if (cardLines.length >= 3) {
            const cardText = cardLines.join('\n');
            const title = lines[i - (j - i)] || cardLines[1] || '';
            if (title && !seen.has(title) && title.length > 5) {
              seen.add(title);
              results.push({ title, text: cardText, link: '', deadline: null, applyLink: '' });
            }
          }
        } else {
          i++;
        }
      }
      return results;
    });

    return cards;
  },

  'unstop.com': async (page, url) => {
    await page.waitForTimeout(3000);
    const cards = await page.evaluate(() => {
      const results = [];
      document.querySelectorAll('[class*="card"], [class*="competition"], [class*="opportunity"], article').forEach(el => {
        const title = el.querySelector('h2, h3, h4, [class*="title"]')?.innerText?.trim();
        if (!title || title.length < 5) return;
        const link = el.querySelector('a')?.href || '';
        results.push({ title, text: el.innerText.substring(0, 3000), link });
      });
      if (results.length === 0) results.push({ title: document.title, text: document.body.innerText.substring(0, 5000), link: window.location.href });
      return results;
    });
    return cards;
  },
};

/**
 * Scrape a URL using Playwright with stealth evasions
 */
async function scrapeWithPlaywright(url, options = {}) {
  const { timeout = 30000, waitSelector = 'body' } = options;
  
  let browser = null;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();
    
    // Check if site-specific evaluator exists BEFORE blocking resources
    const hostname = new URL(url).hostname.replace('www.', '');
    const hasEvaluator = Object.keys(SITE_EVALUATORS).some(d => hostname.includes(d));

    if (!hasEvaluator) {
      // Block unnecessary resources to speed up (only for generic pages)
      await page.route('**/*', (route) => {
        const type = route.request().resourceType();
        if (['image', 'media', 'font'].includes(type)) {
          route.abort();
        } else {
          route.continue();
        }
      });
    }

    await page.goto(url, { waitUntil: hasEvaluator ? 'load' : 'domcontentloaded', timeout });
    
    if (waitSelector) {
      await page.waitForSelector(waitSelector, { state: 'attached', timeout: 10000 }).catch(() => {});
    }
    
    await page.waitForTimeout(2000);

    const title = await page.title();

    // Use site-specific evaluator if available
    if (hasEvaluator) {
      const evaluatorEntry = Object.entries(SITE_EVALUATORS).find(([domain]) => hostname.includes(domain));
      console.log(`🎯 Site-specific evaluator: ${evaluatorEntry[0]}`);
      const cards = await evaluatorEntry[1](page, url);
      await browser.close();
      return { title, cards, url, siteSpecific: true };
    }

    // Generic text extraction
    const text = await page.evaluate(() => {
      const unwanted = document.querySelectorAll('script, style, nav, footer, header, iframe, noscript');
      unwanted.forEach(el => el.remove());
      
      const paragraphs = [];
      document.querySelectorAll('p, h1, h2, h3, h4, li, td, th').forEach(el => {
        const t = el.innerText.trim();
        if (t.length > 20) paragraphs.push(t);
      });
      return paragraphs.join('\n\n');
    });

    return { title, text, url };
  } catch (error) {
    console.error(`🎭 Playwright Error for ${url}:`, error.message);
    return null;
  } finally {
    if (browser) await browser.close();
  }
}

/**
 * Run Playwright Strategy for multiple sources
 */
async function runPlaywrightStrategy(sources, processCallback, options = {}) {
  const { delayMs = 2000 } = options;
  const results = { found: 0, processed: 0, errors: 0 };

  for (const source of sources) {
    console.log(`🎭 Playwright: Scanning ${source.name}...`);
    try {
      const data = await scrapeWithPlaywright(source.url);
      if (!data) { results.errors++; continue; }

      // Site-specific: multiple cards returned
      if (data.siteSpecific && data.cards && data.cards.length > 0) {
        results.found += data.cards.length;
        for (const card of data.cards) {
          if (card.text && card.text.length > 100) {
            await processCallback({
              title: card.title,
              text: card.text,
              url: card.link || source.url,
              sourceType: 'playwright_scrape',
              organizerName: source.name,
              strategy: 'playwright',
              deadline: card.deadline,
              applyLink: card.applyLink || '',
              skipUrlDedup: true,
            });
            results.processed++;
          }
        }
      } else if (data.text && data.text.length > 100) {
        results.found++;
        await processCallback({
          title: data.title,
          text: data.text,
          url: source.url,
          sourceType: 'playwright_scrape',
          organizerName: source.name,
          strategy: 'playwright',
        });
        results.processed++;
      }
    } catch (error) {
      results.errors++;
    }
    
    await new Promise(r => setTimeout(r, delayMs));
  }

  return results;
}

module.exports = {
  scrapeWithPlaywright,
  runPlaywrightStrategy
};
