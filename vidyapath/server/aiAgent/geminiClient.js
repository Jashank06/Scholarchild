/**
 * 🧠 AI Client (OpenAI API v3.0) — With Structured Outputs
 * Replaced Gemini with OpenAI GPT-4o-mini as the primary intelligence engine.
 * Upgraded to use STRICT JSON Schema (Structured Outputs) for zero parse failures.
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
  console.log(`🧠 OpenAI Brain initialized (${PRIMARY_MODEL}) with Structured Outputs`);
} else {
  console.error('❌ OpenAI API Key missing!');
}

// ─── JSON Schemas for Structured Outputs ───
const SCHEMAS = {
  detect: {
    type: 'object',
    properties: {
      isOpportunity: { type: 'boolean', description: 'True if the text describes a scholarship, scheme, or competition.' },
      confidence: { type: 'number', description: 'Confidence score from 0 to 100.' },
      keywords: { type: 'array', items: { type: 'string' }, description: 'Key terms found.' },
      reasoning: { type: 'string', description: 'Why this is or isn\'t an opportunity.' }
    },
    required: ['isOpportunity', 'confidence', 'keywords', 'reasoning'],
    additionalProperties: false
  },
  classify: {
    type: 'object',
    properties: {
      type: { type: 'string', enum: ['scholarship', 'competition', 'scheme', 'fellowship', 'internship', 'camp', 'workshop', 'other'] },
      category: { type: 'string', enum: ['academic', 'arts', 'science', 'quiz', 'olympiad', 'coding', 'writing', 'debate', 'general'] },
      level: { type: 'string', enum: ['national', 'state', 'international', 'district'] },
      states: { type: 'array', items: { type: 'string' }, description: 'States this applies to. Empty if national.' },
      confidence: { type: 'number', description: 'Confidence from 0 to 100.' },
      reasoning: { type: 'string' }
    },
    required: ['type', 'category', 'level', 'states', 'confidence', 'reasoning'],
    additionalProperties: false
  },
  extract: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      organizer: { type: 'string' },
      eligibility: {
        type: 'object',
        properties: {
          grades: { type: 'array', items: { type: 'number' }, description: 'Classes 1 to 12. Empty if for college or others.' },
          states: { type: 'array', items: { type: 'string' } },
          minAge: { type: ['number', 'null'] },
          maxAge: { type: ['number', 'null'] },
          gender: { type: 'string', enum: ['all', 'male', 'female'] }
        },
        required: ['grades', 'states', 'minAge', 'maxAge', 'gender'],
        additionalProperties: false
      },
      rewards: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['cash', 'certificate', 'recognition', 'mixed', 'prize', 'other'] },
          cashAmount: { type: ['number', 'null'] },
          description: { type: 'string' }
        },
        required: ['type', 'cashAmount', 'description'],
        additionalProperties: false
      },
      dates: {
        type: 'object',
        properties: {
          applicationDeadline: { type: ['string', 'null'], description: 'ISO format date string, or null.' }
        },
        required: ['applicationDeadline'],
        additionalProperties: false
      }
    },
    required: ['title', 'description', 'organizer', 'eligibility', 'rewards', 'dates'],
    additionalProperties: false
  },
  enrich: {
    type: 'object',
    properties: {
      tags: { type: 'array', items: { type: 'string' } },
      shortDescription: { type: 'string', description: 'Max 250 chars.' },
      preparationTips: { type: 'string' }
    },
    required: ['tags', 'shortDescription', 'preparationTips'],
    additionalProperties: false
  },
  discoverOfficialWebsite: {
    type: 'object',
    properties: {
      url: { type: 'string', description: 'The most likely official website URL, or empty string if unknown.' }
    },
    required: ['url'],
    additionalProperties: false
  }
};

// ─── Fallback Providers ───
// Fallbacks still use generic JSON object mode as they don't uniformly support Strict JSON Schema yet
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
        'HTTP-Referer': 'https://kushaagra.in',
        'X-Title': 'Kushaagra AI Agent',
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
  const { cacheKey: customCacheKey, systemInstruction = 'You are an expert data analyst.', schemaName } = options;
  const cacheKey = customCacheKey || crypto.createHash('md5').update(prompt + (schemaName || '')).digest('hex');
  if (responseCache.has(cacheKey)) {
    stats.cacheHits++;
    return responseCache.get(cacheKey);
  }

  await tokenBucket.waitForToken();

  try {
    stats.openaiCalls++;
    
    // Configure response format for Structured Outputs
    const responseFormat = schemaName && SCHEMAS[schemaName] ? {
      type: 'json_schema',
      json_schema: {
        name: schemaName,
        strict: true,
        schema: SCHEMAS[schemaName]
      }
    } : { type: 'json_object' };

    const completion = await openai.chat.completions.create({
      model: PRIMARY_MODEL,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ],
      response_format: responseFormat,
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
  detect: (text, url) => `You are an AI trained to identify REAL educational opportunities for Indian students.

Analyze this web page text and determine if it describes an actual scholarship, scheme, competition, olympiad, fellowship, internship, workshop, hackathon, or camp that a student can APPLY for.

A REAL opportunity MUST have:
✅ Specific award amount, prize money, OR clear benefit description (not just "scholarships available")
✅ Eligibility criteria (grade/age/income/category/region)
✅ Deadline or application dates (can be a date range)
✅ How to apply (apply link, registration URL, application process)

REJECT if it is:
❌ News article about education (has journalist name, "read more", no apply link)
❌ Blog post, opinion, or editorial content
❌ General informational page (no specific opportunity with deadline)
❌ Login page, homepage, category overview, or navigation page
❌ Past/expired opportunity (deadline older than 6 months from today)
❌ Advertisement or sponsored content
❌ Political news or policy announcement (not an actual scheme application)

CRITICAL DISTINCTION: A news article titled "New Scholarship for SC Students" is NOT an opportunity. An actual scholarship listing with "Apply before June 30, 2026 at scholarships.gov.in" IS an opportunity.

Current date: ${new Date().toISOString().split('T')[0]}

Source URL: ${url || 'Unknown'}

Text:
${text}`,

  classify: (text) => `Classify this educational opportunity for Indian students.

Determine:
1. Type (must be one of): scholarship, competition, scheme, fellowship, internship, camp, workshop, olympiad
2. Category: academic, science, arts, quiz, coding, writing, debate, sports, music, general
3. Level: school, college, national, state, international, district
4. Mode: online, offline, hybrid
5. Organizer type: government, private, ngo, corporate, educational_institution

SCHOLARSHIP = financial aid/stipend for education
SCHEME = government welfare/support program
COMPETITION = contest with prizes/awards
OLYMPIAD = academic competition (math, science, etc.)
FELLOWSHIP = research/academic fellowship
INTERNSHIP = work experience program
CAMP = summer/winter/training camp
WORKSHOP = hands-on learning event

Text:
${text}`,

  extract: (text, options) => `Extract ALL structured details from this opportunity listing for Indian students.

Extract EXACTLY what is mentioned (don't make up information):

1. title: The exact name of the scholarship/competition/scheme
2. description: 2-3 sentence summary of what this is
3. amounts: List of monetary amounts (convert lakh/crore to full numbers). Include prizes, stipends, grants.
4. deadlines: ALL dates mentioned (application, exam, result, award dates)
5. grades: Classes/grades eligible (e.g., "9-12", "UG", "PG")
6. ageLimit: Age range if specified
7. eligibility: Full eligibility criteria (income, category, region, gender, etc.)
8. rewards: What winners get (cash, certificate, trophy, recognition, laptop, etc.)
9. organizer: Name of organizing body
10. applicationLink: URL to apply (if found in text)
11. officialWebsite: Main website of the organizer
12. syllabus: Topics covered (especially for competitions/olympiads)
13. states: Indian states where applicable
14. gender: male, female, all
15. category: SC/ST/OBC/General/Minority if caste-based

Source title: ${options?.title || 'Unknown'}
Source URL: ${options?.url || 'Unknown'}

Text:
${text}`,

  enrich: (text) => `Enrich this opportunity with additional context for Indian students.

Add:
1. shortDescription: One-line summary (max 150 chars)
2. tags: 3-5 relevant tags (low-income, merit-based, girl-child, rural, STEM, sports, arts, coding, medical, engineering, etc.)
3. relevanceScore: 0-100 how relevant for Indian students
4. benefitScore: 0-100 how beneficial (higher money = higher score)
5. urgencyScore: 0-100 based on deadline proximity
6. audienceScore: 0-100 based on how many could apply
7. keyHighlights: 3 bullet points of most attractive features
8. suggestedGrade: Most suitable grade range

Text:
${text}`
};

function getAIStats() {
  return stats;
}

module.exports = { callAI, PROMPTS, getAIStats, SCHEMAS };
