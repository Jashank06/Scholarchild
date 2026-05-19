/**
 * 🎭 Playwright Stealth Crawler Strategy
 * Replaces basic Puppeteer for JS-heavy or bot-protected portals (NSP, MahaDBT)
 */

const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();

// Add stealth plugin to Playwright
chromium.use(stealth);

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
    
    // Block unnecessary resources to speed up
    await page.route('**/*', (route) => {
      const type = route.request().resourceType();
      if (['image', 'media', 'font', 'stylesheet'].includes(type)) {
        route.abort();
      } else {
        route.continue();
      }
    });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
    
    // Wait for the main content to render (helps with SPAs like MahaDBT)
    if (waitSelector) {
      await page.waitForSelector(waitSelector, { state: 'attached', timeout: 10000 }).catch(() => {});
    }
    
    // Extra wait for any internal API calls to finish rendering
    await page.waitForTimeout(2000);

    const title = await page.title();
    
    // Extract text specifically targeting content areas, skipping navs/footers
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
      if (data && data.text.length > 100) {
        results.found++;
        
        // Pass to processCallback (or bullmq queue)
        await processCallback({
          title: data.title,
          text: data.text,
          url: source.url,
          sourceType: 'playwright_scrape',
          organizerName: source.name,
          strategy: 'playwright'
        });
        
        results.processed++;
      }
    } catch (error) {
      results.errors++;
    }
    
    // Be nice to the servers
    await new Promise(r => setTimeout(r, delayMs));
  }

  return results;
}

module.exports = {
  scrapeWithPlaywright,
  runPlaywrightStrategy
};
