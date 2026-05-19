/**
 * 🐂 BullMQ Queue Setup
 * Handles background job scheduling and parallel processing of URLs
 */

const { Queue, Worker, QueueEvents } = require('bullmq');
const IORedis = require('ioredis');
require('dotenv').config();

const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null,
});

// Create Queues
const scrapeQueue = new Queue('ScrapeOpportunity', { connection });
const enrichQueue = new Queue('EnrichOpportunity', { connection });

// Queue Events for monitoring
const scrapeQueueEvents = new QueueEvents('ScrapeOpportunity', { connection });

scrapeQueueEvents.on('completed', ({ jobId }) => {
  console.log(`[Queue] ✅ Job ${jobId} completed`);
});

scrapeQueueEvents.on('failed', ({ jobId, failedReason }) => {
  console.log(`[Queue] ❌ Job ${jobId} failed:`, failedReason);
});

module.exports = {
  connection,
  scrapeQueue,
  enrichQueue,
};
