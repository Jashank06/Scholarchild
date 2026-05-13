const mongoose = require('mongoose');

const agentFeedbackSchema = new mongoose.Schema({
  agentOpportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'AgentOpportunity', required: true },
  action: { type: String, enum: ['approved', 'rejected', 'edited'], required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  originalConfidence: { type: Number, default: 0 },
  fieldsEdited: [String],
  rejectionReason: String,
  sourceUrl: String,
  sourceDomain: String,
  opportunityType: String,
}, { timestamps: true });

agentFeedbackSchema.index({ sourceDomain: 1, action: 1 });
agentFeedbackSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('AgentFeedback', agentFeedbackSchema);
