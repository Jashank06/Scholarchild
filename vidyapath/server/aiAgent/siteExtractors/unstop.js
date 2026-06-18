/**
 * 🏆 Unstop — Site-Specific Extractor
 * Competitions, hackathons, quizzes, and more
 */
const cheerio = require('cheerio');

function extract(html, url) {
  const $ = cheerio.load(html);
  const opportunities = [];

  $('script, style, noscript, nav, footer, header, aside').remove();

  const selectors = [
    '.competition-card', '.opportunity-card', '.hackathon-card',
    '.event-card', '[class*="competition"]', '[class*="card"]',
    'article', '.listing-item',
  ];

  for (const selector of selectors) {
    $(selector).each((i, el) => {
      const $el = $(el);
      const title = $el.find('h2, h3, h4, .title, .name, [class*="title"]').first().text().trim();
      const text = $el.text().replace(/\s+/g, ' ').trim();

      if (!title || title.length < 5 || text.length < 50) return;

      const lower = text.toLowerCase();
      if (!/competition|hackathon|challenge|contest|quiz|olympiad|prize/i.test(lower)) return;

      opportunities.push({
        title,
        text: text.substring(0, 5000),
        url: $el.find('a').attr('href') || url,
        sourceType: 'competition_portal',
        organizerName: 'Unstop',
      });
    });
    if (opportunities.length > 0) break;
  }

  if (opportunities.length === 0) {
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    if (bodyText.length > 200 && /competition|hackathon|challenge/i.test(bodyText)) {
      opportunities.push({
        title: $('title').text().trim() || $('h1').first().text().trim() || 'Unstop Competition',
        text: bodyText.substring(0, 5000),
        url,
        sourceType: 'competition_portal',
        organizerName: 'Unstop',
      });
    }
  }

  return opportunities;
}

module.exports = { extract };
