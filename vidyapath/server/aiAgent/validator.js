/**
 * 🛡️ AI Trust & Fraud Validator
 * Evaluates opportunity credibility and assigns trust scores.
 */

const TRUSTED_DOMAINS = {
  '.gov.in': 95, '.nic.in': 95, '.ac.in': 85, '.edu.in': 85, '.edu': 85,
  '.res.in': 90, '.org.in': 70, '.org': 65, '.ngo': 65,
  'ncert.nic.in': 98, 'mhrd.gov.in': 98, 'scholarships.gov.in': 98,
  'hbcse.tifr.res.in': 95, 'dst.gov.in': 95, 'aim.gov.in': 95,
  'sofworld.org': 80, 'cbseacademic.nic.in': 95, 'maharashtra.gov.in': 90,
  'inspireawards-dst.gov.in': 95,
};

const REQUIRED_FIELDS = ['title', 'type', 'category'];
const RECOMMENDED_FIELDS = ['description', 'organizer.name', 'eligibility', 'dates.applicationDeadline', 'application.externalLink'];

function getDomainTrustScore(url) {
  if (!url) return 30;
  const lower = url.toLowerCase();
  for (const [domain, score] of Object.entries(TRUSTED_DOMAINS)) {
    if (lower.includes(domain)) return score;
  }
  if (lower.includes('.com')) return 45;
  return 35;
}

function getCompletenesScore(data) {
  let filled = 0, total = 0;
  const checks = [
    data.title, data.description, data.organizer?.name, data.category,
    data.eligibility?.grades?.length > 0, data.dates?.applicationDeadline,
    data.application?.externalLink, data.rewards?.description || data.rewards?.cashAmount,
    data.tags?.length > 0, data.eligibility?.states?.length >= 0,
  ];
  for (const c of checks) { total++; if (c) filled++; }
  return Math.round((filled / total) * 100);
}

/**
 * Validate and score an opportunity
 * @param {object} opportunity - The opportunity data
 * @param {object} metadata - Source metadata (url, etc.)
 * @returns {object} { trustLevel, trustScore, confidence, issues, reasoning }
 */
function validate(opportunity, metadata = {}) {
  const issues = [];
  const reasoning = [];
  let trustScore = 50;

  // 1. Domain trust
  const url = opportunity.application?.externalLink || metadata.url || '';
  const domainScore = getDomainTrustScore(url);
  trustScore = Math.round(trustScore * 0.4 + domainScore * 0.6);
  reasoning.push(`Domain trust: ${domainScore}/100`);

  // 2. Completeness
  const completeness = getCompletenesScore(opportunity);
  trustScore = Math.round(trustScore * 0.7 + completeness * 0.3);
  reasoning.push(`Data completeness: ${completeness}%`);

  // 3. Required fields check
  if (!opportunity.title) { issues.push('Missing title'); trustScore -= 20; }
  if (!opportunity.description || opportunity.description.length < 10) { issues.push('Missing/short description'); trustScore -= 5; }
  if (!opportunity.organizer?.name || opportunity.organizer.name === 'Unknown') { issues.push('Unknown organizer'); trustScore -= 10; }
  if (!url) { issues.push('No official link'); trustScore -= 15; }

  // 4. Suspicious patterns
  if (/guaranteed|100%\s*selection|no\s*exam/i.test(opportunity.description || '')) {
    issues.push('Suspicious claims detected'); trustScore -= 20;
  }
  if (/whatsapp|telegram\s*group|join\s*now/i.test(opportunity.description || '')) {
    issues.push('Social media promotion detected'); trustScore -= 10;
  }

  // 5. Known organizer bonus
  const knownOrgs = ['ncert', 'hbcse', 'cbse', 'dst', 'ministry', 'government', 'sof', 'atal innovation'];
  const orgName = (opportunity.organizer?.name || '').toLowerCase();
  if (knownOrgs.some(o => orgName.includes(o))) { trustScore += 10; reasoning.push('Known organizer bonus +10'); }

  // Clamp
  trustScore = Math.max(0, Math.min(100, trustScore));

  // Assign level
  let trustLevel = 'unverified';
  if (trustScore >= 75) trustLevel = 'verified';
  else if (trustScore >= 45) trustLevel = 'suspicious';

  // Overall confidence
  const confidence = Math.round((trustScore * 0.6 + completeness * 0.4));

  return { trustLevel, trustScore, confidence: Math.min(100, confidence), issues, reasoning: reasoning.join('. '), completeness };
}

module.exports = { validate, getDomainTrustScore };
