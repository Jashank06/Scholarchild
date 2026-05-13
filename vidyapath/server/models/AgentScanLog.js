const mongoose = require('mongoose');

const agentScanLogSchema = new mongoose.Schema({
  // ─── Scan Info ───
  scanType: {
    type: String,
    enum: ['scheduled', 'manual', 'excel_import', 'url_scan', 'bulk_sources'],
    required: true,
  },
  source: { type: String, required: true }, // URL, filename, or source name
  triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin who triggered (null for scheduled)

  // ─── Timing ───
  startedAt: { type: Date, default: Date.now },
  completedAt: Date,
  durationMs: Number,

  // ─── Results ───
  status: {
    type: String,
    enum: ['running', 'completed', 'failed', 'partial'],
    default: 'running',
  },
  opportunitiesFound: { type: Number, default: 0 },
  opportunitiesCreated: { type: Number, default: 0 },
  duplicatesSkipped: { type: Number, default: 0 },
  errorsEncountered: { type: Number, default: 0 },

  // ─── Details ───
  findings: [{
    title: String,
    status: { type: String, enum: ['created', 'duplicate', 'error'] },
    agentOpportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'AgentOpportunity' },
    error: String,
  }],
  scanErrors: [{
    message: String,
    row: Number,
    data: String,
    timestamp: { type: Date, default: Date.now },
  }],

  // ─── Summary ───
  summary: String,

}, { timestamps: true });

agentScanLogSchema.index({ scanType: 1, createdAt: -1 });
agentScanLogSchema.index({ status: 1 });

module.exports = mongoose.model('AgentScanLog', agentScanLogSchema);
