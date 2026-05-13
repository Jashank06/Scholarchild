/**
 * 🤖 AI Agent Master Pipeline v2.0
 * Orchestrates: Detect → Classify → Extract → Validate → Deduplicate → Enrich → Prioritize → Save
 * NOW WITH: Gemini AI, Multi-Strategy Crawler, Feedback Loop, Auto-Approve
 */

const AgentOpportunity = require('../models/AgentOpportunity');
const AgentScanLog = require('../models/AgentScanLog');
const Opportunity = require('../models/Opportunity');
const { detect } = require('./detector');
const { classify } = require('./classifier');
const { extract } = require('./extractor');
const { validate } = require('./validator');
const { checkDuplicate } = require('./deduplicator');
const { calculatePriorityScore } = require('./prioritizer');
const { enrich } = require('./enricher');
const { parseExcelRow } = require('./sources');
const { runCrawlerEngine } = require('./crawlerEngine');
const { shouldAutoApprove, recordFeedback } = require('./feedbackLoop');
const { getAIStats } = require('./geminiClient');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Process a single opportunity through the full AI pipeline
 * @param {object} rawData - { title, text, url, sourceType, rawRow }
 * @returns {object} { success, agentOpportunity, skipped, reason }
 */
async function processOpportunity(rawData) {
  try {
    const { title, text, url, sourceType, rawRow } = rawData;
    const combinedText = `${title || ''} ${text || ''}`;

    // 1. DETECT — is this actually an opportunity? (Dual: keyword + AI)
    const detection = await detect(combinedText, { url });
    if (!detection.isOpportunity && !title) {
      return { success: false, skipped: true, reason: 'Not detected as opportunity' };
    }

    // 2. CLASSIFY — what type, category, level? (AI-powered)
    const classification = await classify(combinedText);

    // 3. EXTRACT — pull structured data (AI-powered)
    const extracted = await extract(combinedText, { title, url });

    // 4. Build opportunity object
    const oppData = {
      title: extracted.title || title || 'Untitled Opportunity',
      type: classification.type,
      category: classification.category,
      description: extracted.description || text || title || '',
      organizer: {
        name: extracted.organizer || rawData.organizerName || 'Unknown',
        type: extracted.organizerType || rawData.organizerType || 'unknown',
        level: classification.level,
        website: url || '',
      },
      eligibility: {
        grades: extracted.eligibility?.grades?.length > 0 ? extracted.eligibility.grades : (extracted.grades || []),
        minAge: extracted.eligibility?.minAge || undefined,
        maxAge: extracted.eligibility?.maxAge || undefined,
        gender: extracted.eligibility?.gender || extracted.gender || 'all',
        states: extracted.eligibility?.states?.length > 0 ? extracted.eligibility.states : (classification.states || []),
        categories: extracted.eligibility?.categories || [],
        maxFamilyIncome: extracted.eligibility?.maxFamilyIncome || undefined,
        minPercentage: extracted.eligibility?.minPercentage || undefined,
        boards: extracted.eligibility?.boards || [],
        otherCriteria: extracted.eligibility?.otherCriteria || '',
      },
      rewards: {
        type: (extracted.rewards?.cashAmount || (extracted.amounts && extracted.amounts[0])) ? 'cash' : (extracted.rewards?.type || 'other'),
        cashAmount: extracted.rewards?.cashAmount || (extracted.amounts && extracted.amounts[0]) || 0,
        description: extracted.rewards?.description || '',
      },
      dates: {
        applicationDeadline: extracted.dates?.[0] || undefined,
      },
      application: {
        mode: 'external',
        externalLink: extracted.applicationLink || url || (extracted.urls && extracted.urls[0]) || '',
        isFree: extracted.isFree !== undefined ? extracted.isFree : true,
        applicationFee: extracted.applicationFee || 0,
        requiredDocuments: extracted.documents || [],
      },
      syllabus: extracted.syllabus || '',
      preparationTips: extracted.preparationTips || '',
      tags: [],
      source: {
        type: sourceType || 'manual',
        url: url || '',
        domain: url ? extractDomain(url) : '',
        rawData: JSON.stringify(rawRow || rawData).substring(0, 1000),
        scrapedAt: new Date(),
      },
    };

    // Handle AI-extracted dates properly
    if (extracted.dates && typeof extracted.dates === 'object' && !Array.isArray(extracted.dates)) {
      if (extracted.dates.applicationDeadline) oppData.dates.applicationDeadline = new Date(extracted.dates.applicationDeadline);
      if (extracted.dates.applicationStart) oppData.dates.applicationStart = new Date(extracted.dates.applicationStart);
      if (extracted.dates.examDate) oppData.dates.examDate = new Date(extracted.dates.examDate);
      if (extracted.dates.resultDate) oppData.dates.resultDate = new Date(extracted.dates.resultDate);
    }

    // 5. VALIDATE — trust & fraud scoring
    const validation = validate(oppData, { url });
    oppData.aiMetadata = {
      detectionConfidence: detection.confidence,
      classificationConfidence: classification.confidence,
      overallConfidence: validation.confidence,
      trustLevel: validation.trustLevel,
      trustScore: validation.trustScore,
      classificationReasoning: Array.isArray(classification.reasoning) ? classification.reasoning.join('. ') : (classification.reasoning || ''),
      detectedKeywords: detection.keywords || [],
      inferredFields: [],
    };

    // 6. DEDUPLICATE — check against existing
    const existingOpps = await Opportunity.find({}).select('title organizer.name').lean();
    const existingAgentOpps = await AgentOpportunity.find({ agentStatus: { $ne: 'rejected' } }).select('title organizer.name').lean();
    const allExisting = [...existingOpps, ...existingAgentOpps];

    const dupCheck = checkDuplicate(oppData, allExisting);
    oppData.duplicateCheck = {
      isDuplicate: dupCheck.isDuplicate,
      similarityScore: dupCheck.similarityScore,
      matchedOpportunityId: dupCheck.matchedId && existingOpps.find(o => o._id.toString() === dupCheck.matchedId?.toString()) ? dupCheck.matchedId : undefined,
      matchedAgentOpportunityId: dupCheck.matchedId && existingAgentOpps.find(o => o._id.toString() === dupCheck.matchedId?.toString()) ? dupCheck.matchedId : undefined,
      matchDetails: dupCheck.matchDetails,
    };

    if (dupCheck.isDuplicate) {
      oppData.agentStatus = 'duplicate';
    }

    // 7. ENRICH — fill missing fields, auto-tag (AI-powered)
    const enrichment = await enrich(oppData, combinedText);
    oppData.tags = enrichment.opportunity.tags;
    oppData.shortDescription = enrichment.opportunity.shortDescription;
    oppData.organizer.type = enrichment.opportunity.organizer.type;
    oppData.category = enrichment.opportunity.category;
    oppData.enrichmentLog = enrichment.enrichmentLog;
    oppData.aiMetadata.inferredFields = enrichment.enrichmentLog.map(l => l.field);
    if (enrichment.opportunity.preparationTips) oppData.preparationTips = enrichment.opportunity.preparationTips;

    // 8. PRIORITIZE — score the opportunity
    oppData.priorityScore = calculatePriorityScore(oppData);

    // 9. AUTO-APPROVE CHECK
    if (!dupCheck.isDuplicate) {
      const autoApproveResult = shouldAutoApprove(oppData);
      if (autoApproveResult.shouldAutoApprove) {
        oppData.agentStatus = 'approved';
        oppData.aiMetadata.autoApproved = true;
        oppData.aiMetadata.autoApproveReasoning = autoApproveResult.reasoning;
      }
    }

    // 10. SAVE to staging collection
    const agentOpp = await AgentOpportunity.create(oppData);

    return { success: true, agentOpportunity: agentOpp, skipped: false };
  } catch (error) {
    console.error('🤖 Pipeline error:', error.message);
    return { success: false, skipped: false, reason: error.message };
  }
}

/**
 * Process Excel import
 */
async function processExcelImport(rows, fileName, userId) {
  const scanLog = await AgentScanLog.create({
    scanType: 'excel_import',
    source: fileName,
    triggeredBy: userId,
    startedAt: new Date(),
    status: 'running',
  });

  let created = 0, duplicates = 0, errors = 0;
  const findings = [];

  for (const row of rows) {
    try {
      const parsed = parseExcelRow(row);
      if (!parsed) { errors++; continue; }

      const result = await processOpportunity({
        title: parsed.title,
        text: `${parsed.title} - ${parsed.subjectArea} - ${parsed.levelRaw} - ${parsed.organizerRaw}`,
        url: parsed.websiteRaw,
        sourceType: 'excel_import',
        organizerName: parsed.organizerRaw,
        rawRow: row,
      });

      if (result.success) {
        if (result.agentOpportunity?.duplicateCheck?.isDuplicate) {
          duplicates++;
          findings.push({ title: parsed.title, status: 'duplicate', agentOpportunityId: result.agentOpportunity._id });
        } else {
          created++;
          findings.push({ title: parsed.title, status: 'created', agentOpportunityId: result.agentOpportunity._id });
        }
      } else {
        errors++;
        findings.push({ title: parsed.title || 'Unknown', status: 'error', error: result.reason });
      }
    } catch (err) {
      errors++;
      findings.push({ title: 'Parse error', status: 'error', error: err.message });
    }
  }

  scanLog.status = 'completed';
  scanLog.completedAt = new Date();
  scanLog.durationMs = Date.now() - scanLog.startedAt.getTime();
  scanLog.opportunitiesFound = rows.length;
  scanLog.opportunitiesCreated = created;
  scanLog.duplicatesSkipped = duplicates;
  scanLog.errorsEncountered = errors;
  scanLog.findings = findings;
  scanLog.summary = `Processed ${rows.length} rows: ${created} created, ${duplicates} duplicates, ${errors} errors`;
  await scanLog.save();

  return scanLog;
}

/**
 * Process Local Excel file
 */
async function processLocalExcel(userId) {
  const filePath = path.join(__dirname, '../data/scholarship competitions.xlsx');
  if (!fs.existsSync(filePath)) {
    throw new Error('Local dataset not found. Please ensure the file is in server/data/');
  }

  let XLSX;
  try { XLSX = require('xlsx'); } catch {
    throw new Error('xlsx package not installed. Run: npm install xlsx');
  }

  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  return await processExcelImport(rows, 'Internal Dataset', userId);
}

/**
 * Process URL scan
 */
async function processUrlScan(url, userId) {
  const scanLog = await AgentScanLog.create({
    scanType: 'url_scan',
    source: url,
    triggeredBy: userId,
    startedAt: new Date(),
    status: 'running',
  });

  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });

    const $ = cheerio.load(response.data);
    const pageTitle = $('title').text().trim() || `Opportunity from ${extractDomain(url)}`;
    $('script, style, nav, footer, header, iframe, noscript, .ad, .advertisement').remove();
    const paragraphs = [];
    $('p, h1, h2, h3, h4, li').each((_, el) => {
      const txt = $(el).text().trim();
      if (txt.length > 30) paragraphs.push(txt);
    });
    const fullText = paragraphs.join('\n\n').substring(0, 10000);

    const result = await processOpportunity({
      title: pageTitle,
      text: fullText,
      url,
      sourceType: 'url_scan',
    });

    scanLog.status = 'completed';
    scanLog.completedAt = new Date();
    scanLog.durationMs = Date.now() - scanLog.startedAt.getTime();
    scanLog.opportunitiesFound = result.success ? 1 : 0;
    scanLog.opportunitiesCreated = result.success && !result.skipped ? 1 : 0;
    scanLog.summary = result.success ? 'URL scanned successfully' : `Scan failed: ${result.reason}`;
    await scanLog.save();

    return scanLog;
  } catch (error) {
    scanLog.status = 'failed';
    scanLog.completedAt = new Date();
    scanLog.durationMs = Date.now() - scanLog.startedAt.getTime();
    scanLog.errorsEncountered = 1;
    scanLog.scanErrors = [{ message: error.message }];
    scanLog.summary = `Failed: ${error.message}`;
    await scanLog.save();
    return scanLog;
  }
}

/**
 * Get agent dashboard stats — ENHANCED
 */
async function getAgentStats() {
  const [pending, approved, rejected, duplicate, total, todayStart] = await Promise.all([
    AgentOpportunity.countDocuments({ agentStatus: 'pending' }),
    AgentOpportunity.countDocuments({ agentStatus: 'approved' }),
    AgentOpportunity.countDocuments({ agentStatus: 'rejected' }),
    AgentOpportunity.countDocuments({ agentStatus: 'duplicate' }),
    AgentOpportunity.countDocuments(),
    (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })(),
  ]);

  const todayCount = await AgentOpportunity.countDocuments({ createdAt: { $gte: todayStart } });
  const recentScans = await AgentScanLog.find().sort({ createdAt: -1 }).limit(10).lean();
  const avgConfidence = await AgentOpportunity.aggregate([
    { $match: { agentStatus: 'pending' } },
    { $group: { _id: null, avg: { $avg: '$aiMetadata.overallConfidence' } } },
  ]);

  const autoApproved = await AgentOpportunity.countDocuments({ 'aiMetadata.autoApproved': true });
  const aiStats = getAIStats();

  return {
    pending, approved, rejected, duplicate, total,
    todayCount, autoApproved,
    avgConfidence: Math.round(avgConfidence[0]?.avg || 0),
    recentScans,
    aiStats,
  };
}

function extractDomain(url) {
  try { return new URL(url).hostname; } catch { return ''; }
}

/**
 * Run the new multi-strategy crawler
 */
async function runCrawler(userId = null) {
  return await runCrawlerEngine(userId);
}

module.exports = {
  processOpportunity,
  processExcelImport,
  processLocalExcel,
  processUrlScan,
  getAgentStats,
  runCrawler,
};
