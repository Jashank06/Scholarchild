/**
 * 🔍 AI Opportunity Detector v2.0
 * DUAL MODE: Fast keyword pre-filter + Gemini AI for ambiguous cases
 */

const { callAI, PROMPTS } = require('./geminiClient');

// ─── Keyword Dictionaries (English + Hindi) ───
const OPPORTUNITY_KEYWORDS = {
  high: [
    'scholarship', 'स्कॉलरशिप', 'छात्रवृत्ति',
    'competition', 'प्रतियोगिता', 'olympiad', 'ओलंपियाड',
    'fellowship', 'फेलोशिप', 'internship', 'इंटर्नशिप',
    'yojana', 'योजना', 'scheme', 'स्कीम',
    'exam', 'परीक्षा', 'talent search', 'प्रतिभा खोज',
    'award', 'पुरस्कार', 'grant', 'अनुदान',
    'hackathon', 'हैकाथॉन', 'camp', 'शिविर',
    'workshop', 'कार्यशाला',
  ],
  medium: [
    'apply', 'application', 'आवेदन',
    'eligibility', 'पात्रता', 'eligible', 'पात्र',
    'deadline', 'last date', 'अंतिम तिथि',
    'class', 'grade', 'कक्षा',
    'student', 'विद्यार्थी', 'छात्र',
    'school', 'college', 'विद्यालय',
    'merit', 'मेरिट', 'rank', 'रैंक',
    'selection', 'चयन', 'register', 'पंजीकरण',
    'enrollment', 'नामांकन',
  ],
  low: [
    'education', 'शिक्षा', 'learn', 'सीखें',
    'india', 'भारत', 'national', 'राष्ट्रीय',
    'state', 'राज्य', 'district', 'जिला',
    'government', 'सरकार', 'ministry', 'मंत्रालय',
    'certificate', 'प्रमाणपत्र', 'reward', 'इनाम',
    'free', 'मुफ्त', 'benefit', 'लाभ',
  ],
};

const NEGATIVE_KEYWORDS = [
  'login', 'password', 'forgot', 'cookie', 'privacy policy',
  'terms of service', 'copyright', 'advertisement', 'ad',
  'buy now', 'purchase', 'cart', 'checkout', 'subscription',
  'unsubscribe', 'spam', 'click here',
];

const STRUCTURAL_PATTERNS = [
  /(?:last\s+date|deadline)\s*[:\-]\s*\d/i,
  /(?:eligibility|eligible)\s*[:\-]/i,
  /(?:class|grade)\s*[:\-]?\s*\d/i,
  /(?:apply|application)\s+(?:now|online|here|before)/i,
  /(?:₹|rs\.?|inr)\s*[\d,]+/i,
  /(?:scholarship|fellowship)\s+(?:amount|value|worth)/i,
  /(?:age\s+limit|age\s+group)\s*[:\-]/i,
  /(?:selection\s+process|how\s+to\s+apply)/i,
  /(?:official\s+website|apply\s+at)/i,
  /(?:\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
];

/**
 * Fast keyword-based detection (pre-filter)
 */
function keywordDetect(text, metadata = {}) {
  if (!text || typeof text !== 'string' || text.trim().length < 10) {
    return { isOpportunity: false, confidence: 0, score: 0, keywords: [], reasoning: 'Input too short' };
  }

  const normalizedText = text.toLowerCase().trim();
  let score = 0;
  const matchedKeywords = [];

  // High-weight keywords (3 points)
  for (const kw of OPPORTUNITY_KEYWORDS.high) {
    if (normalizedText.includes(kw.toLowerCase())) { score += 3; matchedKeywords.push(kw); }
  }

  // Medium-weight keywords (2 points)
  for (const kw of OPPORTUNITY_KEYWORDS.medium) {
    if (normalizedText.includes(kw.toLowerCase())) { score += 2; matchedKeywords.push(kw); }
  }

  // Low-weight keywords (1 point)
  for (const kw of OPPORTUNITY_KEYWORDS.low) {
    if (normalizedText.includes(kw.toLowerCase())) { score += 1; matchedKeywords.push(kw); }
  }

  // Structural patterns (4 points)
  let structuralMatches = 0;
  for (const pattern of STRUCTURAL_PATTERNS) {
    if (pattern.test(normalizedText)) { score += 4; structuralMatches++; }
  }

  // Negative penalty (-3 each)
  for (const kw of NEGATIVE_KEYWORDS) {
    if (normalizedText.includes(kw.toLowerCase())) score -= 3;
  }

  // URL domain bonus
  if (metadata.url) {
    const url = metadata.url.toLowerCase();
    if (url.includes('.gov.in') || url.includes('.nic.in')) score += 10;
    else if (url.includes('.ac.in') || url.includes('.edu')) score += 7;
    else if (url.includes('.org')) score += 4;
  }

  if (normalizedText.length > 200) score += 2;
  if (normalizedText.length > 500) score += 3;

  const confidence = Math.min(100, Math.round((Math.max(0, score) / 60) * 100));

  return {
    isOpportunity: score >= 8,
    confidence,
    score,
    keywords: [...new Set(matchedKeywords)],
    reasoning: `Keyword score: ${score}`,
    zone: score >= 20 ? 'high' : score >= 5 ? 'ambiguous' : 'low',
  };
}

/**
 * AI-powered detection using Gemini (for ambiguous cases)
 */
async function aiDetect(text, metadata = {}) {
  try {
    const prompt = PROMPTS.detect(text, metadata.url);
    const result = await callAI(prompt, { cacheKey: `detect:${text.substring(0, 200)}` });
    
    if (result) {
      return {
        isOpportunity: result.isOpportunity === true,
        confidence: result.confidence || 50,
        type: result.type || 'other',
        keywords: result.keywords || [],
        reasoning: result.reasoning || 'AI detection',
        aiPowered: true,
      };
    }
  } catch (error) {
    console.warn('AI detection failed, using keyword fallback:', error.message);
  }
  return null;
}

/**
 * DUAL-MODE DETECT: Keyword pre-filter → AI for ambiguous cases
 * @param {string} text - Raw text to analyze
 * @param {object} metadata - { url, source }
 * @returns {object} Detection result
 */
async function detect(text, metadata = {}) {
  // Step 1: Fast keyword detection
  const keywordResult = keywordDetect(text, metadata);

  // HIGH confidence → definitely an opportunity (skip AI)
  if (keywordResult.zone === 'high') {
    return keywordResult;
  }

  // LOW confidence → definitely not (skip AI)
  if (keywordResult.zone === 'low' && keywordResult.score < 3) {
    return keywordResult;
  }

  // AMBIGUOUS zone → ask Gemini AI
  const aiResult = await aiDetect(text, metadata);
  if (aiResult) {
    // Merge results — AI overrides but keyword data is preserved
    return {
      isOpportunity: aiResult.isOpportunity,
      confidence: Math.round((aiResult.confidence * 0.7 + keywordResult.confidence * 0.3)),
      score: keywordResult.score,
      keywords: [...new Set([...keywordResult.keywords, ...(aiResult.keywords || [])])],
      reasoning: `${aiResult.reasoning} | Keyword: ${keywordResult.reasoning}`,
      aiPowered: true,
    };
  }

  // AI failed — fall back to keyword result
  return keywordResult;
}

module.exports = { detect, keywordDetect, OPPORTUNITY_KEYWORDS };
