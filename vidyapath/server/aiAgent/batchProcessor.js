/**
 * 📦 OpenAI Batch API Processor
 * For massive scale processing at 50% token cost (24h SLA)
 * Perfect for backlogs of scraped URLs that aren't time sensitive
 */

const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');
const { PROMPTS, SCHEMAS } = require('./geminiClient');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const BATCH_DIR = path.join(__dirname, '../../data/batches');

// Ensure directory exists
if (!fs.existsSync(BATCH_DIR)) fs.mkdirSync(BATCH_DIR, { recursive: true });

/**
 * 1. Create a .jsonl file for a batch of opportunities
 * @param {Array} opportunities - List of { id, text, type }
 * @param {string} taskType - 'detect', 'classify', 'extract', 'enrich'
 */
async function createBatchFile(opportunities, taskType) {
  const filename = `batch_${taskType}_${Date.now()}.jsonl`;
  const filepath = path.join(BATCH_DIR, filename);
  
  const schema = SCHEMAS[taskType];
  const stream = fs.createWriteStream(filepath);

  for (const opp of opportunities) {
    const prompt = PROMPTS[taskType](opp.text);
    
    const request = {
      custom_id: `${taskType}_${opp.id}`,
      method: 'POST',
      url: '/v1/chat/completions',
      body: {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert data analyst.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        response_format: schema ? {
          type: 'json_schema',
          json_schema: { name: taskType, strict: true, schema }
        } : { type: 'json_object' }
      }
    };
    
    stream.write(JSON.stringify(request) + '\n');
  }

  return new Promise((resolve, reject) => {
    stream.end(() => resolve(filepath));
    stream.on('error', reject);
  });
}

/**
 * 2. Upload the file and start the Batch on OpenAI
 */
async function startBatch(filepath) {
  try {
    // Upload file
    const file = await openai.files.create({
      file: fs.createReadStream(filepath),
      purpose: 'batch'
    });

    // Start batch
    const batch = await openai.batches.create({
      input_file_id: file.id,
      endpoint: '/v1/chat/completions',
      completion_window: '24h',
      metadata: { description: path.basename(filepath) }
    });

    return { fileId: file.id, batchId: batch.id, status: batch.status };
  } catch (error) {
    console.error('📦 Batch creation failed:', error.message);
    throw error;
  }
}

/**
 * 3. Check status of a batch
 */
async function checkBatchStatus(batchId) {
  const batch = await openai.batches.retrieve(batchId);
  return {
    id: batch.id,
    status: batch.status,
    completed: batch.request_counts?.completed || 0,
    failed: batch.request_counts?.failed || 0,
    total: batch.request_counts?.total || 0,
    outputFileId: batch.output_file_id
  };
}

/**
 * 4. Download and parse completed batch results
 */
async function downloadBatchResults(outputFileId) {
  const response = await openai.files.content(outputFileId);
  const text = await response.text();
  
  const results = [];
  const lines = text.split('\n').filter(l => l.trim() !== '');
  
  for (const line of lines) {
    try {
      const data = JSON.parse(line);
      const customId = data.custom_id;
      const content = data.response?.body?.choices?.[0]?.message?.content;
      
      let parsedContent;
      try { parsedContent = JSON.parse(content); } catch { parsedContent = null; }
      
      results.push({ customId, data: parsedContent, raw: content });
    } catch (e) {
      console.warn('Failed to parse batch result line', e.message);
    }
  }
  
  return results;
}

module.exports = {
  createBatchFile,
  startBatch,
  checkBatchStatus,
  downloadBatchResults
};
