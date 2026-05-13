/**
 * 🖥️ Puppeteer Strategy — Headless rendering for JS-heavy sites
 * Used for government portals and dynamic sites that need JavaScript
 */

const { scrapePageText } = require('./rssStrategy');

let puppeteer = null;

function getPuppeteer() {
  if (!puppeteer) {
    try { puppeteer = require('puppeteer'); } catch { return null; }
  }
  return puppeteer;
}

/**
 * Scrape a page using Puppeteer (headless Chrome)
 * Falls back to cheerio if Puppeteer not available
 */
async function scrapeWithPuppeteer(url, options = {}) {
  const { waitForSelector = null, timeout = 20000 } = options;
  const ppt = getPuppeteer();
  
  // Fallback to cheerio if Puppeteer unavailable
  if (!ppt) {
    console.log(`🖥️ Puppeteer not available, using cheerio for ${url}`);
    return await scrapePageText(url);
  }

  let browser = null;
  try {
    browser = await ppt.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
      timeout: 30000,
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1280, height: 900 });

    // Block unnecessary resources for speed
    await page.setRequestInterception(true);
    page.on('request', req => {
      const type = req.resourceType();
      if (['image', 'media', 'font', 'stylesheet'].includes(type)) req.abort();
      else req.continue();
    });

    await page.goto(url, { waitUntil: 'networkidle2', timeout });
    if (waitForSelector) {
      try { await page.waitForSelector(waitForSelector, { timeout: 5000 }); } catch {}
    }

    // Wait a bit for any dynamic content
    await new Promise(r => setTimeout(r, 2000));

    // Extract page content
    const content = await page.evaluate(() => {
      // Remove noise
      document.querySelectorAll('script, style, nav, footer, header, iframe, noscript, .ad, .advertisement, .sidebar, .menu').forEach(el => el.remove());
      
      const paragraphs = [];
      document.querySelectorAll('h1, h2, h3, h4, p, li, td, th, dd, .content, article, .description, .scheme-name, .scholarship-list').forEach(el => {
        const text = el.innerText?.trim();
        if (text && text.length > 25) paragraphs.push(text);
      });
      return paragraphs.join('\n\n').substring(0, 10000);
    });

    const pageTitle = await page.title();
    return { text: content, title: pageTitle };
  } catch (error) {
    console.error(`🖥️ Puppeteer error for ${url}:`, error.message);
    // Fallback to cheerio
    const fallbackText = await scrapePageText(url);
    return fallbackText ? { text: fallbackText, title: '' } : null;
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

/**
 * Run Puppeteer strategy for JS-heavy sources
 * @param {Array} sources - Sources that need JS rendering
 * @param {Function} processCallback
 * @param {object} options
 */
async function runPuppeteerStrategy(sources, processCallback, options = {}) {
  const { delayMs = 2000 } = options;
  const results = { found: 0, processed: 0, errors: 0 };

  for (const source of sources) {
    try {
      console.log(`🖥️ Puppeteer: Rendering ${source.name || source.url}...`);
      const result = await scrapeWithPuppeteer(source.url, { waitForSelector: source.selectors?.listContainer });

      if (!result) { results.errors++; continue; }

      const text = typeof result === 'string' ? result : result.text;
      const title = typeof result === 'string' ? '' : result.title;
      
      if (!text || text.length < 100) {
        console.log(`  → Not enough content from ${source.url}`);
        results.errors++;
        continue;
      }

      results.found++;
      await processCallback({
        title: title || source.name || `Opportunity from ${new URL(source.url).hostname}`,
        text,
        url: source.url,
        sourceType: 'web_scrape',
        organizerName: source.name || new URL(source.url).hostname,
        strategy: 'puppeteer',
        sourceId: source.id,
      });
      results.processed++;

      await new Promise(r => setTimeout(r, delayMs));
    } catch (error) {
      console.error(`Puppeteer strategy error for ${source.name}:`, error.message);
      results.errors++;
    }
  }

  return results;
}

module.exports = { runPuppeteerStrategy, scrapeWithPuppeteer };
