const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  entityType: { type: String, enum: ['school', 'institution', 'event'], required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  action: { type: String, enum: ['created', 'updated'], required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  changes: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: { createdAt: true, updatedAt: false } });

activityLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
