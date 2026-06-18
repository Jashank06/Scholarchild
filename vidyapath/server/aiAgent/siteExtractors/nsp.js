/**
 * 🏛️ NSP (scholarships.gov.in) — Site-Specific Extractor
 * National Scholarship Portal — India's primary govt scholarship platform
 */
const cheerio = require('cheerio');

function extract(html, url) {
  const $ = cheerio.load(html);
  const opportunities = [];

  // Remove script/style tags
  $('script, style, noscript, nav, footer, header').remove();

  // Try table rows — NSP lists schemes in tables
  $('table tr').each((i, row) => {
    const cells = $(row).find('td, th');
    const text = cells.map((_, el) => $(el).text().trim()).get().join(' | ');
    if (text.length < 15) return;

    const title = cells.first().text().trim();
    if (!title || title.length < 5) return;

    // Check for scholarship-related keywords
    const lower = text.toLowerCase();
    if (!/scholarship|scheme|fellowship|yojana|छात्रवृत्ति|योजना/i.test(lower)) return;

    opportunities.push({
      title,
      text,
      url: url,
      sourceType: 'govt_portal',
      organizerName: 'National Scholarship Portal',
    });
  });

  // Fallback: scan all text blocks
  if (opportunities.length === 0) {
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    if (bodyText.length > 100 && /scholarship|scheme|yojana/i.test(bodyText)) {
      opportunities.push({
        title: $('title').text().trim() || 'NSP Scheme',
        text: bodyText.substring(0, 5000),
        url,
        sourceType: 'govt_portal',
        organizerName: 'National Scholarship Portal',
      });
    }
  }

  return opportunities;
}

module.exports = { extract };
