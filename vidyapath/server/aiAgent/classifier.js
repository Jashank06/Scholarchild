/**
 * 🧠 AI Opportunity Classifier v2.0
 * Gemini-powered classification with keyword fallback
 */

const { callAI, PROMPTS } = require('./geminiClient');

const TYPE_RULES = {
  scholarship: { keywords: ['scholarship', 'छात्रवृत्ति', 'merit scholarship', 'financial aid', 'stipend', 'grant', 'bursary', 'post-matric', 'pre-matric'] },
  competition: { keywords: ['competition', 'olympiad', 'contest', 'quiz', 'challenge', 'tournament', 'championship', 'science fair', 'spelling bee', 'elocution', 'debate', 'painting competition', 'essay competition', 'hackathon'] },
  scheme: { keywords: ['scheme', 'योजना', 'yojana', 'govt scheme', 'welfare', 'subsidy', 'financial support'] },
  fellowship: { keywords: ['fellowship', 'research fellowship', 'doctoral'] },
  internship: { keywords: ['internship', 'intern', 'apprentice', 'training program'] },
  camp: { keywords: ['camp', 'summer camp', 'winter camp', 'training camp', 'science camp', 'talent camp', 'boot camp'] },
  workshop: { keywords: ['workshop', 'seminar', 'webinar', 'conference', 'symposium', 'masterclass'] },
};

const CATEGORY_RULES = {
  academic: ['academic', 'merit', 'talent search', 'ntse', 'kvpy', 'inspire', 'education', 'exam'],
  science: ['science', 'physics', 'chemistry', 'biology', 'astronomy', 'neuroscience', 'stem', 'engineering', 'robotics'],
  arts: ['arts', 'art', 'drawing', 'painting', 'photography', 'music', 'dance', 'drama', 'creative writing', 'poetry'],
  quiz: ['quiz', 'trivia', 'general knowledge', 'gk'],
  olympiad: ['olympiad', 'imo', 'ipho', 'icho', 'ibo', 'ioi', 'ijso', 'inmo', 'rmo', 'hbcse'],
  coding: ['coding', 'programming', 'computer science', 'informatics', 'software', 'cyber', 'algorithmic'],
  writing: ['writing', 'essay', 'story', 'journalism', 'language', 'english', 'spelling'],
  debate: ['debate', 'mun', 'public speaking', 'oratory'],
  sports: ['sports', 'athletics', 'football', 'cricket', 'basketball', 'chess'],
  general: ['general', 'miscellaneous'],
};

const LEVEL_PATTERNS = {
  international: ['international', 'global', 'world', 'asia pacific', 'apmo', 'imo', 'ipho'],
  national: ['national', 'india', 'all india', 'ntse', 'kvpy', 'cbse', 'ncert', 'hbcse', 'inspire'],
  state: ['state', 'maharashtra', 'karnataka', 'rajasthan', 'tamil nadu', 'uttar pradesh', 'bihar', 'punjab', 'gujarat', 'kerala'],
  district: ['district', 'zilla parishad', 'zilla'],
  taluka: ['taluka', 'tehsil', 'block'],
};

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
];

/**
 * Fast keyword-based classification
 */
function keywordClassify(text) {
  const norm = (text || '').toLowerCase();
  const result = { type: 'other', category: 'general', level: 'national', states: [], subjectArea: '', confidence: 0, reasoning: [] };

  // Type scoring
  const typeScores = {};
  for (const [type, { keywords }] of Object.entries(TYPE_RULES)) {
    typeScores[type] = keywords.filter(kw => norm.includes(kw.toLowerCase())).length;
  }
  const bestType = Object.entries(typeScores).sort((a, b) => b[1] - a[1])[0];
  if (bestType?.[1] > 0) { result.type = bestType[0]; result.reasoning.push(`Type: ${bestType[0]} (${bestType[1]})`); }

  // Category scoring
  const catScores = {};
  for (const [cat, keywords] of Object.entries(CATEGORY_RULES)) {
    catScores[cat] = keywords.filter(kw => norm.includes(kw)).length;
  }
  const bestCat = Object.entries(catScores).sort((a, b) => b[1] - a[1])[0];
  if (bestCat?.[1] > 0) { result.category = bestCat[0]; result.reasoning.push(`Category: ${bestCat[0]} (${bestCat[1]})`); }

  // Level
  const levelScores = {};
  for (const [level, keywords] of Object.entries(LEVEL_PATTERNS)) {
    levelScores[level] = keywords.filter(kw => norm.includes(kw)).length;
  }
  const bestLevel = Object.entries(levelScores).sort((a, b) => b[1] - a[1])[0];
  if (bestLevel?.[1] > 0) { result.level = bestLevel[0]; }

  // States
  for (const state of INDIAN_STATES) { if (norm.includes(state.toLowerCase())) result.states.push(state); }

  const total = Object.values(typeScores).reduce((a, b) => a + b, 0) + Object.values(catScores).reduce((a, b) => a + b, 0);
  result.confidence = Math.min(100, Math.round((total / 15) * 100));

  return result;
}

/**
 * AI-powered classification using Gemini
 */
async function classify(text, existingData = {}) {
  // Always do keyword classification first (fast)
  const keywordResult = keywordClassify(text);

  // If keyword confidence is very high, skip AI
  if (keywordResult.confidence >= 60) {
    return keywordResult;
  }

  // Use AI for better classification
  try {
    const prompt = PROMPTS.classify(text);
    const aiResult = await callAI(prompt, { cacheKey: `classify:${text.substring(0, 200)}`, schemaName: 'classify' });

    if (aiResult) {
      return {
        type: aiResult.type || keywordResult.type,
        category: aiResult.category || keywordResult.category,
        level: aiResult.level || keywordResult.level,
        subjectArea: aiResult.subjectArea || '',
        states: aiResult.states?.length > 0 ? aiResult.states : keywordResult.states,
        confidence: aiResult.confidence || 70,
        reasoning: [aiResult.reasoning || 'AI classified', ...keywordResult.reasoning],
        aiPowered: true,
      };
    }
  } catch (error) {
    console.warn('AI classification failed, using keyword fallback');
  }

  return keywordResult;
}

module.exports = { classify, keywordClassify, INDIAN_STATES, CATEGORY_RULES, TYPE_RULES };
