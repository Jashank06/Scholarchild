/**
 * 🤖 AI Agent API Routes v2.0
 * Admin-only endpoints for the AI Opportunity Intelligence Agent.
 * NOW WITH: Feedback loop, recommendations, learning stats
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AgentOpportunity = require('../models/AgentOpportunity');
const AgentScanLog = require('../models/AgentScanLog');
const Opportunity = require('../models/Opportunity');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');
const { processExcelImport, processUrlScan, processLocalExcel, getAgentStats, runCrawler } = require('../aiAgent/index');
const { getAgentStatus } = require('../aiAgent/scheduler');
const { recordFeedback, getLearningStats } = require('../aiAgent/feedbackLoop');
const { getRecommendations, getDeadlineSoon } = require('../aiAgent/matchEngine');
const { getAIStats } = require('../aiAgent/geminiClient');
const { getAllEnabledSources } = require('../aiAgent/sourceRegistry');

const upload = multer({ dest: path.join(__dirname, '../uploads/agent') });

// ─── Helper: Match students to an opportunity ───
async function findMatchingStudents(opportunity) {
  const filter = { role: 'student' };
  const elig = opportunity.eligibility || {};

  if (elig.grades && elig.grades.length > 0) {
    filter['profile.grade'] = { $in: elig.grades };
  }
  if (elig.states && elig.states.length > 0) {
    filter['$or'] = [
      { 'profile.address.state': { $in: elig.states } },
      { 'profile.address.state': { $exists: false } },
    ];
  }
  if (elig.categories && elig.categories.length > 0) {
    // Don't filter by category if 'General' is included (open to all)
    if (!elig.categories.includes('General')) {
      filter['profile.category'] = { $in: elig.categories };
    }
  }
  if (elig.gender && elig.gender !== 'all') {
    filter['profile.gender'] = elig.gender;
  }

  return User.find(filter).select('_id profile.firstName email').lean();
}

// ─── Helper: Notify matched students ───
async function notifyMatchedStudents(opportunity, matchedStudents) {
  if (!matchedStudents || matchedStudents.length === 0) return 0;

  const typeLabels = {
    scholarship: '🎓 New Scholarship',
    competition: '🏆 New Competition',
    scheme: '🏛️ New Govt. Scheme',
    fellowship: '📚 New Fellowship',
    internship: '💼 New Internship',
    camp: '🏕️ New Camp',
    workshop: '🔧 New Workshop',
    other: '🌟 New Opportunity',
  };

  const notifications = matchedStudents.map(student => ({
    userId: student._id,
    type: 'new_opportunity',
    title: typeLabels[opportunity.type] || '🌟 New Opportunity',
    message: `"${opportunity.title}" matches your profile! ${opportunity.rewards?.cashAmount ? `Award: ₹${opportunity.rewards.cashAmount.toLocaleString()}` : 'Check it out!'}`,
    link: `/dashboard/${opportunity.type === 'scholarship' ? 'scholarships' : opportunity.type === 'competition' ? 'competitions' : 'schemes'}`,
    icon: typeLabels[opportunity.type]?.split(' ')[0] || '🌟',
  }));

  await Notification.insertMany(notifications);
  return notifications.length;
}

// ═══════════════════════════════════════
// 📊 DASHBOARD & STATS
// ═══════════════════════════════════════

// @GET /api/agent/dashboard — Full dashboard data
router.get('/dashboard', protect, adminOnly, async (req, res) => {
  try {
    const stats = await getAgentStats();
    const agentStatus = getAgentStatus();

    // Type distribution
    const typeDistribution = await AgentOpportunity.aggregate([
      { $match: { agentStatus: 'pending' } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    // Trust distribution
    const trustDistribution = await AgentOpportunity.aggregate([
      { $match: { agentStatus: 'pending' } },
      { $group: { _id: '$aiMetadata.trustLevel', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: { ...stats, agentStatus, typeDistribution, trustDistribution },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/agent/stats — Quick stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const stats = await getAgentStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════
// 📋 PENDING QUEUE
// ═══════════════════════════════════════

// @GET /api/agent/pending — Get pending opportunities
router.get('/pending', protect, adminOnly, async (req, res) => {
  try {
    const { status = 'pending', type, sort = 'priority', page = 1, limit = 30 } = req.query;
    const filter = {};

    if (status === 'all') {
      // Show all except rejected
    } else {
      filter.agentStatus = status;
    }
    if (type) filter.type = type;

    let sortObj = { 'priorityScore.overall': -1, createdAt: -1 };
    if (sort === 'newest') sortObj = { createdAt: -1 };
    if (sort === 'confidence') sortObj = { 'aiMetadata.overallConfidence': -1 };
    if (sort === 'trust') sortObj = { 'aiMetadata.trustScore': -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await AgentOpportunity.countDocuments(filter);
    const opportunities = await AgentOpportunity.find(filter)
      .sort(sortObj).skip(skip).limit(parseInt(limit)).lean();

    res.json({
      success: true,
      data: opportunities,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/agent/pending/:id — Single pending opportunity
router.get('/pending/:id', protect, adminOnly, async (req, res) => {
  try {
    const opp = await AgentOpportunity.findById(req.params.id);
    if (!opp) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: opp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════
// ✅ APPROVAL WORKFLOW
// ═══════════════════════════════════════

// @PUT /api/agent/approve/:id — Approve and publish
router.put('/approve/:id', protect, adminOnly, async (req, res) => {
  try {
    const agentOpp = await AgentOpportunity.findById(req.params.id);
    if (!agentOpp) return res.status(404).json({ success: false, message: 'Not found' });
    if (agentOpp.agentStatus === 'approved') return res.status(400).json({ success: false, message: 'Already approved' });

    // Create live Opportunity from agent data
    const liveOpp = await Opportunity.create({
      type: ['scholarship', 'competition', 'scheme', 'fellowship', 'internship', 'camp', 'workshop', 'other'].includes(agentOpp.type) ? agentOpp.type : 'scholarship',
      status: 'active',
      title: agentOpp.title,
      description: agentOpp.description,
      shortDescription: agentOpp.shortDescription ? agentOpp.shortDescription.substring(0, 248) : '',
      organizer: agentOpp.organizer,
      category: ['academic', 'arts', 'science', 'quiz', 'olympiad', 'coding', 'writing', 'debate', 'general', 'sports', 'music', 'other'].includes(agentOpp.category) ? agentOpp.category : 'general',
      tags: agentOpp.tags,
      eligibility: agentOpp.eligibility,
      rewards: agentOpp.rewards,
      dates: agentOpp.dates,
      application: agentOpp.application,
      syllabus: agentOpp.syllabus,
      preparationTips: agentOpp.preparationTips,
      createdBy: req.user._id,
      verifiedBy: req.user._id,
      isVerified: true,
    });

    // Update agent opportunity
    agentOpp.agentStatus = 'approved';
    agentOpp.reviewedBy = req.user._id;
    agentOpp.reviewedAt = new Date();
    agentOpp.approvedOpportunityId = liveOpp._id;
    await agentOpp.save();

    // 🔄 Record feedback for learning
    await recordFeedback({
      agentOpportunityId: agentOpp._id,
      action: 'approved',
      adminId: req.user._id,
      originalConfidence: agentOpp.aiMetadata?.overallConfidence || 0,
      sourceUrl: agentOpp.source?.url || '',
      sourceDomain: agentOpp.source?.domain || '',
      opportunityType: agentOpp.type,
    });

    // Find & notify matching students
    const matchedStudents = await findMatchingStudents(liveOpp);
    const notifiedCount = await notifyMatchedStudents(liveOpp, matchedStudents);

    res.json({
      success: true,
      message: `✅ Approved! Published to ${notifiedCount} matching students.`,
      data: { opportunity: liveOpp, notifiedStudents: notifiedCount },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @PUT /api/agent/reject/:id — Reject opportunity
router.put('/reject/:id', protect, adminOnly, async (req, res) => {
  try {
    const agentOpp = await AgentOpportunity.findById(req.params.id);
    if (!agentOpp) return res.status(404).json({ success: false, message: 'Not found' });

    agentOpp.agentStatus = 'rejected';
    agentOpp.reviewedBy = req.user._id;
    agentOpp.reviewedAt = new Date();
    agentOpp.rejectionReason = req.body.reason || 'Rejected by admin';
    await agentOpp.save();

    // 🔄 Record feedback for learning
    await recordFeedback({
      agentOpportunityId: agentOpp._id,
      action: 'rejected',
      adminId: req.user._id,
      originalConfidence: agentOpp.aiMetadata?.overallConfidence || 0,
      rejectionReason: req.body.reason || 'Rejected by admin',
      sourceUrl: agentOpp.source?.url || '',
      sourceDomain: agentOpp.source?.domain || '',
      opportunityType: agentOpp.type,
    });

    res.json({ success: true, message: 'Opportunity rejected.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @PUT /api/agent/edit/:id — Edit before approving
router.put('/edit/:id', protect, adminOnly, async (req, res) => {
  try {
    const agentOpp = await AgentOpportunity.findByIdAndUpdate(
      req.params.id, { ...req.body, agentStatus: 'pending' }, { new: true, runValidators: true }
    );
    if (!agentOpp) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: agentOpp, message: 'Updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/agent/bulk-approve — Approve multiple
router.post('/bulk-approve', protect, adminOnly, async (req, res) => {
  try {
    const { ids, all, filter } = req.body;
    let targetIds = [];

    if (all) {
      const query = { agentStatus: 'pending' };
      if (filter && filter.type) {
        query.type = filter.type;
      }
      const pendingOpps = await AgentOpportunity.find(query).select('_id');
      targetIds = pendingOpps.map(o => o._id);
    } else {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ success: false, message: 'No IDs provided' });
      }
      targetIds = ids;
    }

    if (targetIds.length === 0) {
      return res.json({ success: true, message: 'No opportunities found to approve.' });
    }

    let approved = 0;
    for (const id of targetIds) {
      try {
        const agentOpp = await AgentOpportunity.findById(id);
        if (!agentOpp || agentOpp.agentStatus === 'approved') continue;

        const liveOpp = await Opportunity.create({
          type: ['scholarship', 'competition', 'scheme', 'fellowship', 'internship', 'camp', 'workshop', 'other'].includes(agentOpp.type) ? agentOpp.type : 'scholarship',
          status: 'active',
          title: agentOpp.title,
          description: agentOpp.description,
          shortDescription: agentOpp.shortDescription ? agentOpp.shortDescription.substring(0, 248) : '',
          organizer: agentOpp.organizer,
          category: ['academic', 'arts', 'science', 'quiz', 'olympiad', 'coding', 'writing', 'debate', 'general', 'sports', 'music', 'other'].includes(agentOpp.category) ? agentOpp.category : 'general',
          tags: agentOpp.tags,
          eligibility: agentOpp.eligibility,
          rewards: agentOpp.rewards,
          dates: agentOpp.dates,
          application: agentOpp.application,
          createdBy: req.user._id,
          verifiedBy: req.user._id,
          isVerified: true,
        });

        agentOpp.agentStatus = 'approved';
        agentOpp.reviewedBy = req.user._id;
        agentOpp.reviewedAt = new Date();
        agentOpp.approvedOpportunityId = liveOpp._id;
        await agentOpp.save();
        approved++;

        // Defer matching & notifications asynchronously to prevent blocking/timeouts
        setImmediate(async () => {
          try {
            const students = await findMatchingStudents(liveOpp);
            await notifyMatchedStudents(liveOpp, students);
          } catch (e) {
            console.error('Async notification error for liveOpp', liveOpp._id, e.message);
          }
        });

      } catch (e) {
        console.error('Bulk approve error for', id, e.message);
      }
    }

    res.json({ 
      success: true, 
      message: `✅ ${approved} opportunities approved! Student notifications are being processed in the background.` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════
// 🔍 SCANNING
// ═══════════════════════════════════════

// @POST /api/agent/scan-excel — Import from Excel/CSV
router.post('/scan-excel', protect, adminOnly, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    let rows = [];

    // Parse based on file type
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // Dynamic import xlsx
      let XLSX;
      try { XLSX = require('xlsx'); } catch {
        // Cleanup and inform
        fs.unlinkSync(filePath);
        return res.status(400).json({ success: false, message: 'xlsx package not installed. Run: npm install xlsx' });
      }
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } else if (fileName.endsWith('.csv')) {
      const csv = require('csv-parser');
      rows = await new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', data => results.push(data))
          .on('end', () => resolve(results))
          .on('error', reject);
      });
    } else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ success: false, message: 'Unsupported file type. Use .xlsx, .xls, or .csv' });
    }

    // Process through AI pipeline
    const scanLog = await processExcelImport(rows, fileName, req.user._id);

    // Cleanup
    try { fs.unlinkSync(filePath); } catch {}

    res.json({
      success: true,
      message: scanLog.summary,
      data: {
        scanLogId: scanLog._id,
        created: scanLog.opportunitiesCreated,
        duplicates: scanLog.duplicatesSkipped,
        errors: scanLog.errorsEncountered,
        total: rows.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/agent/scan-local — Scan internal dataset
router.post('/scan-local', protect, adminOnly, async (req, res) => {
  try {
    const scanLog = await processLocalExcel(req.user._id);
    res.json({
      success: true,
      message: scanLog.summary,
      data: { scanLogId: scanLog._id }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/agent/scan-crawler — Run web crawler
router.post('/scan-crawler', protect, adminOnly, async (req, res) => {
  try {
    const scanLog = await runCrawler(req.user._id);
    res.json({
      success: true,
      message: scanLog.summary,
      data: { scanLogId: scanLog._id }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/agent/scan-url — Scan a URL
router.post('/scan-url', protect, adminOnly, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, message: 'URL is required' });

    const scanLog = await processUrlScan(url, req.user._id);
    res.json({ success: true, message: scanLog.summary, data: scanLog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════
// 📜 SCAN LOGS
// ═══════════════════════════════════════

// @GET /api/agent/scan-logs — View scan history
router.get('/scan-logs', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await AgentScanLog.countDocuments();
    const logs = await AgentScanLog.find()
      .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit))
      .populate('triggeredBy', 'profile.firstName profile.lastName').lean();

    res.json({
      success: true,
      data: logs,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════
// 🧠 AI INTELLIGENCE
// ═══════════════════════════════════════

// @GET /api/agent/ai-stats — AI provider stats
router.get('/ai-stats', protect, adminOnly, async (req, res) => {
  try {
    const aiStats = getAIStats();
    const learningStats = await getLearningStats();
    const sources = getAllEnabledSources();
    res.json({
      success: true,
      data: { aiStats, learningStats, totalSources: sources.length },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════
// 🎯 STUDENT RECOMMENDATIONS
// ═══════════════════════════════════════

// @GET /api/agent/recommendations — Personalized for logged-in student
router.get('/recommendations', protect, async (req, res) => {
  try {
    const { limit = 20, type = null } = req.query;
    const recommendations = await getRecommendations(req.user._id, { limit: parseInt(limit), type });
    res.json({ success: true, data: recommendations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/agent/deadline-soon — Opportunities closing soon
router.get('/deadline-soon', protect, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const opportunities = await getDeadlineSoon(req.user._id, parseInt(days));
    res.json({ success: true, data: opportunities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
