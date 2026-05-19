/**
 * 🐂 BullMQ Worker Setup
 * Processes URLs and URLs from the scrapeQueue and runs them through the AI pipeline
 */

const { Worker } = require('bullmq');
const { connection } = require('./queue');
const { processOpportunity } = require('./index');

console.log('👷 BullMQ Worker starting...');

const scrapeWorker = new Worker(
  'ScrapeOpportunity',
  async (job) => {
    try {
      const { title, text, url, sourceType, organizerName, rawRow } = job.data;
      
      console.log(`[Worker] 🔄 Processing job ${job.id}: ${url || title}`);
      
      const result = await processOpportunity({
        title, text, url, sourceType, organizerName, rawRow
      });

      if (!result.success) {
        throw new Error(result.reason || 'Unknown error during processing');
      }

      return {
        success: true,
        agentOpportunityId: result.agentOpportunity?._id,
        skipped: result.skipped,
      };
    } catch (error) {
      console.error(`[Worker] ❌ Error in job ${job.id}:`, error.message);
      throw error;
    }
  },
  {
    connection,
    concurrency: 10, // Process 10 URLs in parallel! (10x throughput upgrade)
    limiter: {
      max: 50,
      duration: 60000, // Max 50 per minute to avoid getting rate limited by AI/Target
    },
  }
);

scrapeWorker.on('completed', (job, returnvalue) => {
  if (returnvalue.skipped) {
    console.log(`[Worker] ⏭️ Job ${job.id} skipped (duplicate/irrelevant)`);
  } else {
    console.log(`[Worker] ✅ Job ${job.id} completed. Opp ID: ${returnvalue.agentOpportunityId}`);
  }
});

scrapeWorker.on('failed', (job, err) => {
  console.log(`[Worker] ❌ Job ${job.id} failed with error: ${err.message}`);
});

module.exports = { scrapeWorker };
