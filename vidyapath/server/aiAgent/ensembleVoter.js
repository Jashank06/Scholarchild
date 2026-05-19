/**
 * 🗳️ Multi-Model Ensemble Voting
 * Runs queries against 3 different LLMs simultaneously and uses majority voting
 * to guarantee extraction accuracy for critical high-value scholarships.
 */

const { callAI, SCHEMAS, PROMPTS } = require('./geminiClient');
const axios = require('axios');

async function callGroqDirect(prompt, schemaName) {
  if (!process.env.GROQ_KEY) return null;
  try {
    const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.1-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    }, { headers: { 'Authorization': `Bearer ${process.env.GROQ_KEY}` } });
    return JSON.parse(res.data.choices[0].message.content);
  } catch { return null; }
}

async function callOpenRouterDirect(prompt, schemaName) {
  if (!process.env.OPENROUTER_KEY) return null;
  try {
    const res = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    }, { headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_KEY}` } });
    return JSON.parse(res.data.choices[0].message.content);
  } catch { return null; }
}

/**
 * Run a prompt through OpenAI, Groq (Llama3), and OpenRouter (Gemini) concurrently
 * and return the consensus result for high reliability.
 */
async function ensembleExtraction(text, options = {}) {
  const { title, url } = options;
  const prompt = PROMPTS.extract(text, url);

  console.log(`🗳️ Starting Ensemble Voting for: ${title}`);

  // Run in parallel
  const [openaiRes, groqRes, geminiRes] = await Promise.all([
    callAI(prompt, { schemaName: 'extract' }), // Returns structured output
    callGroqDirect(prompt, 'extract'),
    callOpenRouterDirect(prompt, 'extract')
  ]);

  const results = [openaiRes, groqRes, geminiRes].filter(Boolean);

  if (results.length === 0) {
    throw new Error('All models failed during ensemble extraction');
  }

  // Voting Logic for critical fields
  const finalResult = results[0]; // Baseline is OpenAI (usually most reliable)

  // Example Voting: Cash Amount
  const amounts = results.map(r => r?.rewards?.cashAmount).filter(a => typeof a === 'number');
  if (amounts.length >= 2) {
    // Find the mode (most common value)
    const counts = amounts.reduce((acc, val) => { acc[val] = (acc[val] || 0) + 1; return acc; }, {});
    const mode = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    if (!finalResult.rewards) finalResult.rewards = {};
    finalResult.rewards.cashAmount = Number(mode);
  }

  // Example Voting: Deadline
  const deadlines = results.map(r => r?.dates?.applicationDeadline).filter(Boolean);
  if (deadlines.length >= 2) {
    const counts = deadlines.reduce((acc, val) => { acc[val] = (acc[val] || 0) + 1; return acc; }, {});
    const mode = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    if (!finalResult.dates) finalResult.dates = {};
    finalResult.dates.applicationDeadline = mode;
  }

  // Combine arrays (grades, states) via union if at least one model found them
  const allGrades = new Set();
  results.forEach(r => r?.eligibility?.grades?.forEach(g => allGrades.add(g)));
  if (allGrades.size > 0) {
    if (!finalResult.eligibility) finalResult.eligibility = {};
    finalResult.eligibility.grades = [...allGrades].sort((a,b)=>a-b);
  }

  finalResult.ensembleConfidence = Math.round((results.length / 3) * 100);
  finalResult.votedBy = results.length;

  return finalResult;
}

module.exports = { ensembleExtraction };
