/**
 * 📋 AI Data Extractor v2.0
 * Gemini-powered structured extraction with regex fallback
 */

const { callAI, PROMPTS } = require('./geminiClient');

// ─── Regex Extractors (Fallback) ───
function extractAmounts(text) {
  const amounts = [];
  const patterns = [
    /(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d+)?)\s*(?:lakh|lac)?/gi,
    /([\d,]+(?:\.\d+)?)\s*(?:₹|rs|rupees|inr)/gi,
    /([\d,]+)\s*(?:lakh|lac)s?/gi,
    /([\d,]+)\s*(?:crore|cr)s?/gi,
  ];
  for (const p of patterns) {
    let m; while ((m = p.exec(text || '')) !== null) {
      let val = parseFloat(m[1].replace(/,/g, ''));
      if (/lakh|lac/i.test(m[0])) val *= 100000;
      if (/crore|cr/i.test(m[0])) val *= 10000000;
      if (val > 0 && val < 100000000) amounts.push(val);
    }
  }
  return [...new Set(amounts)].sort((a, b) => b - a);
}

function extractDates(text) {
  const dates = [];
  const patterns = [
    /(\d{1,2})[\/\-.]\s*(\d{1,2})[\/\-.]\s*(\d{4})/g,
    /(\d{4})[\/\-.]\s*(\d{1,2})[\/\-.]\s*(\d{1,2})/g,
    /(\d{1,2})\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})/gi,
  ];
  for (const p of patterns) {
    let m; while ((m = p.exec(text || '')) !== null) {
      try { const d = new Date(m[0]); if (!isNaN(d.getTime())) dates.push(d); } catch {}
    }
  }
  return dates;
}

function extractGrades(text) {
  const grades = new Set();
  const classPattern = /(?:class|grade|कक्षा)\s*([\d,\s\-to]+)/gi;
  let m; while ((m = classPattern.exec(text || '')) !== null) {
    const part = m[1];
    const rangeMatch = part.match(/(\d+)\s*[-–to]+\s*(\d+)/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1]), end = parseInt(rangeMatch[2]);
      for (let i = start; i <= Math.min(end, 12); i++) grades.add(i);
    } else {
      part.split(/[,\s]+/).forEach(n => { const v = parseInt(n); if (v >= 1 && v <= 12) grades.add(v); });
    }
  }
  return [...grades].sort((a, b) => a - b);
}

function extractUrls(text) {
  const urlPattern = /https?:\/\/[^\s,;)]+/gi;
  const matches = (text || '').match(urlPattern) || [];
  return [...new Set(matches)].map(u => u.replace(/[.,;]+$/, ''));
}

function extractDocuments(text) {
  const docKeywords = ['aadhar', 'aadhaar', 'pan card', 'income certificate', 'caste certificate', 'domicile', 'birth certificate', 'marksheet', 'bank passbook', 'photograph', 'passport', 'bonafide', 'transfer certificate', 'ration card', 'bpl card', 'disability certificate', 'recommendation letter'];
  const norm = (text || '').toLowerCase();
  return docKeywords.filter(d => norm.includes(d));
}

/**
 * Regex-only extraction (fast fallback)
 */
function regexExtract(text, metadata = {}) {
  const norm = (text || '').toLowerCase();
  const result = {
    title: metadata.title || '',
    description: text || '',
    amounts: extractAmounts(text),
    dates: extractDates(text),
    grades: extractGrades(text),
    urls: extractUrls(text),
    documents: extractDocuments(text),
    gender: 'all',
    isFree: true,
  };

  if (/(?:girls?\s+only|female\s+only|women|mahila|beti|बेटी)/i.test(text || '')) result.gender = 'female';
  else if (/(?:boys?\s+only|male\s+only)/i.test(text || '')) result.gender = 'male';
  if (/(?:registration\s+fee|entry\s+fee|application\s+fee|exam\s+fee|fee\s+required|paid)/i.test(text || '')) result.isFree = false;

  return result;
}

/**
 * AI-powered extraction using Gemini
 */
async function extract(text, metadata = {}) {
  // Always do regex extraction first (fast, reliable for amounts/dates)
  const regexResult = regexExtract(text, metadata);

  // Try AI extraction for richer data
  try {
    const prompt = PROMPTS.extract(text, metadata.url || '');
    const aiResult = await callAI(prompt, { cacheKey: `extract:${text.substring(0, 200)}` });

    if (aiResult) {
      // Merge AI results with regex results (AI wins but regex fills gaps)
      return {
        title: aiResult.title || regexResult.title,
        description: aiResult.description || regexResult.description,
        amounts: aiResult.rewards?.cashAmount ? [aiResult.rewards.cashAmount] : regexResult.amounts,
        dates: parseDatesFromAI(aiResult.dates) || regexResult.dates,
        grades: aiResult.eligibility?.grades?.length > 0 ? aiResult.eligibility.grades : regexResult.grades,
        urls: regexResult.urls,
        documents: aiResult.documents?.length > 0 ? aiResult.documents : regexResult.documents,
        gender: aiResult.eligibility?.gender || regexResult.gender,
        isFree: aiResult.isFree !== undefined ? aiResult.isFree : regexResult.isFree,
        // AI-only fields
        organizer: aiResult.organizer || '',
        organizerType: aiResult.organizerType || 'unknown',
        eligibility: aiResult.eligibility || {},
        rewards: aiResult.rewards || {},
        applicationLink: aiResult.applicationLink || '',
        applicationFee: aiResult.applicationFee || 0,
        syllabus: aiResult.syllabus || '',
        preparationTips: aiResult.preparationTips || '',
        aiPowered: true,
      };
    }
  } catch (error) {
    console.warn('AI extraction failed, using regex fallback');
  }

  return regexResult;
}

function parseDatesFromAI(dates) {
  if (!dates) return [];
  const parsed = [];
  for (const [key, val] of Object.entries(dates)) {
    if (val) {
      try {
        const d = new Date(val);
        if (!isNaN(d.getTime())) parsed.push(d);
      } catch {}
    }
  }
  return parsed.length > 0 ? parsed : null;
}

module.exports = { extract, regexExtract, extractAmounts, extractDates, extractGrades, extractUrls };
