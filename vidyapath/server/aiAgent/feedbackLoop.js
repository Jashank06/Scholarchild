/**
 * 🔄 Feedback Loop — Self-learning from admin decisions
 * Tracks approvals/rejections to improve AI confidence over time
 */

const AgentFeedback = require('../models/AgentFeedback');

// In-memory pattern cache (refreshed periodically)
let patternCache = {
  trustedDomains: {},      // domain → approval rate
  rejectedPatterns: [],    // common rejection reasons
  autoApproveThreshold: parseInt(process.env.AGENT_AUTO_APPROVE_THRESHOLD) || 85,
  lastRefresh: 0,
};

/**
 * Record admin feedback on an opportunity
 */
async function recordFeedback(data) {
  try {
    await AgentFeedback.create({
      agentOpportunityId: data.agentOpportunityId,
      action: data.action, // 'approved', 'rejected', 'edited'
      adminId: data.adminId,
      originalConfidence: data.originalConfidence,
      fieldsEdited: data.fieldsEdited || [],
      rejectionReason: data.rejectionReason || '',
      sourceUrl: data.sourceUrl || '',
      sourceDomain: data.sourceDomain || '',
      opportunityType: data.opportunityType || '',
    });
  } catch (error) {
    console.error('Feedback recording failed:', error.message);
  }
}

/**
 * Refresh learned patterns from feedback history
 */
async function refreshPatterns() {
  try {
    // Domain approval rates
    const domainStats = await AgentFeedback.aggregate([
      { $match: { sourceDomain: { $ne: '' } } },
      { $group: {
        _id: '$sourceDomain',
        total: { $sum: 1 },
        approved: { $sum: { $cond: [{ $eq: ['$action', 'approved'] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ['$action', 'rejected'] }, 1, 0] } },
      }},
      { $match: { total: { $gte: 3 } } }, // Only domains with 3+ reviews
    ]);

    patternCache.trustedDomains = {};
    for (const d of domainStats) {
      patternCache.trustedDomains[d._id] = {
        approvalRate: Math.round((d.approved / d.total) * 100),
        total: d.total,
      };
    }

    // Common rejection reasons
    const rejections = await AgentFeedback.find({ action: 'rejected', rejectionReason: { $ne: '' } })
      .sort({ createdAt: -1 }).limit(50).lean();
    patternCache.rejectedPatterns = rejections.map(r => r.rejectionReason);

    patternCache.lastRefresh = Date.now();
    console.log(`🔄 Feedback patterns refreshed: ${Object.keys(patternCache.trustedDomains).length} domains tracked`);
  } catch (error) {
    console.error('Pattern refresh failed:', error.message);
  }
}

/**
 * Get trust adjustment for a domain based on feedback history
 */
function getDomainTrustAdjustment(domain) {
  const stats = patternCache.trustedDomains[domain];
  if (!stats || stats.total < 3) return 0;
  
  if (stats.approvalRate >= 90) return 15;    // Very trusted
  if (stats.approvalRate >= 70) return 8;     // Trusted
  if (stats.approvalRate >= 50) return 0;     // Neutral
  if (stats.approvalRate >= 30) return -10;   // Suspicious
  return -20;                                  // Frequently rejected
}

/**
 * Check if opportunity should be auto-approved
 */
function shouldAutoApprove(opportunity) {
  const confidence = opportunity.aiMetadata?.overallConfidence || 0;
  const trustScore = opportunity.aiMetadata?.trustScore || 0;
  const domain = opportunity.source?.domain || '';
  const domainAdjustment = getDomainTrustAdjustment(domain);

  const adjustedConfidence = confidence + domainAdjustment;
  const threshold = patternCache.autoApproveThreshold;

  return {
    shouldAutoApprove: adjustedConfidence >= threshold && trustScore >= 70,
    adjustedConfidence,
    domainAdjustment,
    threshold,
    reasoning: `Confidence: ${confidence} + Domain: ${domainAdjustment} = ${adjustedConfidence} (threshold: ${threshold})`,
  };
}

/**
 * Get learning statistics
 */
async function getLearningStats() {
  const total = await AgentFeedback.countDocuments();
  const approved = await AgentFeedback.countDocuments({ action: 'approved' });
  const rejected = await AgentFeedback.countDocuments({ action: 'rejected' });
  const edited = await AgentFeedback.countDocuments({ action: 'edited' });

  return {
    totalReviews: total,
    approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
    approved,
    rejected,
    edited,
    trackedDomains: Object.keys(patternCache.trustedDomains).length,
    autoApproveThreshold: patternCache.autoApproveThreshold,
    lastRefresh: patternCache.lastRefresh ? new Date(patternCache.lastRefresh) : null,
  };
}

// Initial refresh on load (delayed)
setTimeout(() => refreshPatterns(), 5000);

module.exports = { recordFeedback, refreshPatterns, getDomainTrustAdjustment, shouldAutoApprove, getLearningStats };
