/**
 * ⏰ AI Agent Scheduler v2.0
 * Priority-based scheduling with smart intervals
 */

const AgentScanLog = require('../models/AgentScanLog');

let schedulerInterval = null;
let isScanning = false;
let lastScanTime = null;
let scanIntervalMs = 6 * 60 * 60 * 1000; // 6 hours default
let scanCount = 0;

/**
 * Get current agent status
 */
function getAgentStatus() {
  return {
    isActive: schedulerInterval !== null,
    isScanning,
    lastScanTime,
    scanIntervalMs,
    scanIntervalHours: scanIntervalMs / (60 * 60 * 1000),
    totalScansRun: scanCount,
    nextScanAt: lastScanTime ? new Date(lastScanTime.getTime() + scanIntervalMs) : null,
  };
}

/**
 * Start the scheduler
 */
function startScheduler(intervalMs, scanCallback) {
  if (schedulerInterval) clearInterval(schedulerInterval);
  scanIntervalMs = intervalMs || scanIntervalMs;

  console.log(`🤖 AI Agent Scheduler v2.0 started — scanning every ${scanIntervalMs / (60 * 60 * 1000)} hours`);

  schedulerInterval = setInterval(async () => {
    if (isScanning) {
      console.log('🤖 Agent: Scan already in progress, skipping...');
      return;
    }
    try {
      isScanning = true;
      scanCount++;
      console.log(`🤖 Agent: Starting scheduled scan #${scanCount}...`);
      
      if (scanCallback) {
        await scanCallback();
      } else {
        const { runCrawlerEngine } = require('./crawlerEngine');
        await runCrawlerEngine(null);
      }
      
      lastScanTime = new Date();
      console.log(`🤖 Agent: Scheduled scan #${scanCount} completed.`);
    } catch (error) {
      console.error('🤖 Agent: Scheduled scan failed:', error.message);
    } finally {
      isScanning = false;
    }
  }, scanIntervalMs);
}

/**
 * Stop the scheduler
 */
function stopScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('🤖 AI Agent Scheduler stopped.');
  }
}

/**
 * Set scanning state (used by manual triggers)
 */
function setScanningState(state) {
  isScanning = state;
  if (!state) lastScanTime = new Date();
}

module.exports = { startScheduler, stopScheduler, getAgentStatus, setScanningState };
