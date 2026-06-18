/**
 * 🌐 Generic Site Extractors Dispatcher
 * Routes to site-specific extractor or falls back to generic extraction
 */

const SITE_EXTRACTORS = {
  'scholarships.gov.in': require('./nsp').extract,
  'buddy4study.com': require('./buddy4study').extract,
  'unstop.com': require('./unstop').extract,
  'myscheme.gov.in': require('./myscheme').extract,
};

/**
 * Try site-specific extraction, fall back to null if no match
 */
function trySiteExtract(html, url) {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');

    for (const [domain, extractFn] of Object.entries(SITE_EXTRACTORS)) {
      if (hostname.includes(domain)) {
        const results = extractFn(html, url);
        if (results && results.length > 0) {
          console.log(`🎯 Site-specific extractor: ${domain} → ${results.length} items`);
          return results;
        }
      }
    }
  } catch (e) {
    // URL parsing failed, skip
  }
  return null;
}

module.exports = { trySiteExtract, SITE_EXTRACTORS };
