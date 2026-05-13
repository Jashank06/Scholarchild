/**
 * 🧠 AI Client (OpenAI API v3.0)
 * Replaced Gemini with OpenAI GPT-4o-mini as the primary intelligence engine.
 */

const { OpenAI } = require('openai');
const crypto = require('crypto');
const axios = require('axios');

const {
  OPENAI_API_KEY,
  CEREBRAS_KEY,
  GROQ_KEY,
  OPENROUTER_KEY,
  AGENT_MAX_RPM = 50
} = process.env;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const PRIMARY_MODEL = 'gpt-4o-mini';
const MAX_CACHE_SIZE = 500;

// ─── Rate Limiter ───
class RateLimiter {
  constructor(maxPerMinute) {
    this.maxPerMinute = maxPerMinute;
    this.queue = [];
    this.tokens = maxPerMinute;
    this.lastRefill = Date.now();
    this.processing = false;
  }

  _refill() {
    const now = Date.now();
    const passed = now - this.lastRefill;
    if (passed > 60000) {
      this.tokens = this.maxPerMinute;
      this.lastRefill = now;
    }
  }

  async _processQueue() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      this._refill();
      if (this.tokens > 0) {
        this.tokens--;
        const resolve = this.queue.shift();
        resolve();
      } else {
        const waitMs = Math.ceil(60000 / this.maxPerMinute);
        await new Promise(r => setTimeout(r, waitMs));
      }
    }
    this.processing = false;
  }

  async waitForToken() {
    return new Promise((resolve) => {
      this.queue.push(resolve);
      this._processQueue();
    });
  }
}

// ─── Initialize ───
const tokenBucket = new RateLimiter(parseInt(AGENT_MAX_RPM));
const responseCache = new Map();
let stats = { openaiCalls: 0, fallbackCalls: 0, cacheHits: 0, errors: 0, cacheSize: 0, rateLimitTokens: AGENT_MAX_RPM };

if (OPENAI_API_KEY) {
  console.log(`🧠 OpenAI Brain initialized (${PRIMARY_MODEL})`);
} else {
  console.error('❌ OpenAI API Key missing!');
}

// ─── Fallback Providers ───
async function callGroq(prompt, systemInstruction) {
  if (!GROQ_KEY) return null;
  try {
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.1-70b-versatile',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    }, {
      headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
      timeout: 10000,
    });
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(`Groq fallback failed: ${error.response?.status || error.message}`);
    return null;
  }
}

async function callCerebras(prompt, systemInstruction) {
  if (!CEREBRAS_KEY) return null;
  try {
    const response = await axios.post('https://api.cerebras.ai/v1/chat/completions', {
      model: 'llama3.1-8b',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 2048,
    }, {
      headers: { 'Authorization': `Bearer ${CEREBRAS_KEY}`, 'Content-Type': 'application/json' },
      timeout: 15000,
    });
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(`Cerebras fallback failed: ${error.response?.status || error.message}`);
    return null;
  }
}

async function callOpenRouter(prompt, systemInstruction) {
  if (!OPENROUTER_KEY) return null;
  try {
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 2048,
    }, {
      headers: { 
        'Authorization': `Bearer ${OPENROUTER_KEY}`, 
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://vidyapath.in',
        'X-Title': 'VidyaPath AI Agent',
      },
      timeout: 20000,
    });
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(`OpenRouter fallback failed: ${error.response?.status || error.message}`);
    return null;
  }
}

// ─── Main AI Call Function ───
async function callAI(prompt, options = {}) {
  const { cacheKey: customCacheKey, systemInstruction = 'You are an expert data analyst.' } = options;
  const cacheKey = customCacheKey || crypto.createHash('md5').update(prompt).digest('hex');
  if (responseCache.has(cacheKey)) {
    stats.cacheHits++;
    return responseCache.get(cacheKey);
  }

  await tokenBucket.waitForToken();

  try {
    stats.openaiCalls++;
    const completion = await openai.chat.completions.create({
      model: PRIMARY_MODEL,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });
    
    const textResponse = completion.choices[0].message.content;
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(textResponse.replace(/```json/g, '').replace(/```/g, '').trim());
    } catch (e) {
      jsonResponse = JSON.parse(textResponse);
    }
    
    // Cache successful response
    if (responseCache.size >= MAX_CACHE_SIZE) {
      const firstKey = responseCache.keys().next().value;
      responseCache.delete(firstKey);
    }
    responseCache.set(cacheKey, jsonResponse);
    stats.cacheSize = responseCache.size;
    
    return jsonResponse;
    
  } catch (error) {
    stats.errors++;
    console.warn(`🧠 OpenAI attempt failed:`, error.message);
    
    // Fallback Cascade
    console.log('🔄 Switching to fallback providers...');
    
    for (const provider of [
      { name: 'Cerebras', call: () => callCerebras(prompt, systemInstruction) },
      { name: 'Groq', call: () => callGroq(prompt, systemInstruction) },
      { name: 'OpenRouter', call: () => callOpenRouter(prompt, systemInstruction) }
    ]) {
      const fallbackResponse = await provider.call();
      if (fallbackResponse) {
        stats.fallbackCalls++;
        try {
          const parsedFallback = typeof fallbackResponse === 'string' ? JSON.parse(fallbackResponse.replace(/```json/g, '').replace(/```/g, '').trim()) : fallbackResponse;
          responseCache.set(cacheKey, parsedFallback);
          return parsedFallback;
        } catch (e) {
          console.error(`${provider.name} returned invalid JSON`);
        }
      }
    }

    console.error('❌ All AI providers failed');
    return null;
  }
}

// Define the prompts object for the pipeline to use
const PROMPTS = {
  detect: (text, url) => `Analyze this text and detect if it is an educational opportunity. Return ONLY valid JSON: {"isOpportunity": boolean, "confidence": number(0-100), "keywords": [string], "reasoning": string}\n\nText:\n${text}`,
  classify: (text) => `Categorize the opportunity. Return ONLY JSON: {"type": "scholarship"|"competition"|"scheme"|"fellowship"|"internship"|"camp"|"workshop"|"other", "category": "academic"|"arts"|"science"|"olympiad"|"general", "level": "national"|"state"|"international", "states": [string], "confidence": number, "reasoning": string}\n\nText:\n${text}`,
  extract: (text, options) => `Extract structured details. Return ONLY JSON: {"title": string, "description": string, "organizer": string, "eligibility": {"grades": [number] (use 1-12 for school classes, empty array if college/other), "states": [string], "minAge": number|null, "maxAge": number|null, "gender": "all"|"male"|"female"}, "rewards": {"type": "cash"|"certificate"|"recognition"|"mixed"|"prize"|"other", "cashAmount": number|null, "description": string}, "dates": {"applicationDeadline": string(ISO)|null}}\n\nText:\n${text}`,
  enrich: (text) => `Enrich the opportunity data. Return ONLY JSON: {"tags": [string], "shortDescription": string, "preparationTips": string}\n\nText:\n${text}`
};

function getAIStats() {
  return stats;
}

module.exports = { callAI, PROMPTS, getAIStats };
