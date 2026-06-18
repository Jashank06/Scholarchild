/**
 * 🏛️ MyScheme.gov.in — Site-Specific Extractor
 * Government of India scheme portal
 */
const cheerio = require('cheerio');

function extract(html, url) {
  const $ = cheerio.load(html);
  const opportunities = [];

  $('script, style, noscript, nav, footer, header, aside').remove();

  // MyScheme uses card/tile layouts with scheme details
  const selectors = [
    '.scheme-card', '.scheme-item', '.card', '.tile',
    '[class*="scheme"]', '[class*="card"]', 'article',
  ];

  for (const selector of selectors) {
    $(selector).each((i, el) => {
      const $el = $(el);
      const title = $el.find('h2, h3, h4, .title, .name, [class*="title"]').first().text().trim();
      const text = $el.text().replace(/\s+/g, ' ').trim();

      if (!title || title.length < 5 || text.length < 50) return;

      const lower = text.toLowerCase();
      if (!/scheme|yojana|योजना|scholarship|welfare|subsidy|benefit/i.test(lower)) return;

      opportunities.push({
        title,
        text: text.substring(0, 5000),
        url: $el.find('a').attr('href') || url,
        sourceType: 'govt_portal',
        organizerName: 'MyScheme Government of India',
      });
    });
    if (opportunities.length > 0) break;
  }

  if (opportunities.length === 0) {
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    if (bodyText.length > 200 && /scheme|yojana|scholarship/i.test(bodyText)) {
      opportunities.push({
        title: $('title').text().trim() || $('h1').first().text().trim() || 'Government Scheme',
        text: bodyText.substring(0, 5000),
        url,
        sourceType: 'govt_portal',
        organizerName: 'MyScheme Government of India',
      });
    }
  }

  return opportunities;
}

module.exports = { extract };
