const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);

(async () => {
  console.log('Testing dashboard.udiseplus.gov.in...');
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto('https://dashboard.udiseplus.gov.in/', { waitUntil: 'networkidle' });
    const title = await page.title();
    console.log(`Dashboard Title: ${title}`);
    
    // Attempt to extract dashboard options/tabs
    const dashboardText = await page.evaluate(() => document.body.innerText.substring(0, 1000));
    console.log(`Dashboard Content Snippet:\n${dashboardText}\n`);
    
    console.log('Testing School Directory Management...');
    await page.goto('https://udiseplus.gov.in/ud/#/en/page/ud', { waitUntil: 'networkidle' });
    const udText = await page.evaluate(() => document.body.innerText.substring(0, 1000));
    console.log(`SDM Content Snippet:\n${udText}\n`);

  } catch (err) {
    console.error('Scraping error:', err);
  } finally {
    if (browser) await browser.close();
  }
})();
