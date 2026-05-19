const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);

(async () => {
  console.log('Testing src.udiseplus.gov.in...');
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://src.udiseplus.gov.in/', { waitUntil: 'networkidle' });
    const html = await page.content();
    console.log('--- HTML Start ---');
    console.log(html.substring(0, 1500));
    console.log('--- HTML End ---');
    
    // Attempt to extract typical dropdown options if it's the SRC portal
    const selectOptions = await page.evaluate(() => {
      const selects = Array.from(document.querySelectorAll('select'));
      return selects.map(s => ({
        id: s.id,
        name: s.name,
        options: Array.from(s.options).map(o => o.text).slice(0, 5) // first 5
      }));
    });
    console.log('Selects found:', selectOptions);
    
  } catch (err) {
    console.error('Scraping error:', err);
  } finally {
    if (browser) await browser.close();
  }
})();
