/**
 * 📚 Buddy4Study — Site-Specific Extractor
 * India's largest scholarship aggregator with card-based listings
 */
const cheerio = require('cheerio');

function extract(html, url) {
  const $ = cheerio.load(html);
  const opportunities = [];

  $('script, style, noscript, nav, footer, header, aside').remove();

  // Buddy4Study uses card-based layouts for scholarship listings
  // Try multiple known CSS selector patterns
  const selectors = [
    '.scholarship-card', '.scholarship-item', '.listing-card',
    '.card', 'article', '.post', '.entry',
    '[class*="scholarship"]', '[class*="card"]',
  ];

  for (const selector of selectors) {
    $(selector).each((i, el) => {
      const $el = $(el);
      const title = $el.find('h2, h3, h4, .title, .name, [class*="title"]').first().text().trim();
      const text = $el.text().replace(/\s+/g, ' ').trim();

      if (!title || title.length < 5 || text.length < 50) return;

      // Must mention scholarship/fellowship/etc
      const lower = text.toLowerCase();
      if (!/scholarship|fellowship|grant|stipend|financial aid|छात्रवृत्ति/i.test(lower)) return;

      opportunities.push({
        title,
        text: text.substring(0, 5000),
        url: $el.find('a').attr('href') || url,
        sourceType: 'scholarship_aggregator',
        organizerName: 'Buddy4Study',
      });
    });
    if (opportunities.length > 0) break;
  }

  // Fallback: full page text
  if (opportunities.length === 0) {
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    if (bodyText.length > 200 && /scholarship|fellowship/i.test(bodyText)) {
      opportunities.push({
        title: $('title').text().trim() || $('h1').first().text().trim() || 'Buddy4Study Scholarship',
        text: bodyText.substring(0, 5000),
        url,
        sourceType: 'scholarship_aggregator',
        organizerName: 'Buddy4Study',
      });
    }
  }

  return opportunities;
}

module.exports = { extract };
