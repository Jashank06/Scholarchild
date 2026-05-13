const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },

  status: {
    type: String,
    enum: ['draft', 'applied', 'under_review', 'approved', 'rejected', 'deadline_missed'],
    default: 'applied',
  },
  isExternalRedirect: { type: Boolean, default: false },

  // Application Data
  formData: { type: mongoose.Schema.Types.Mixed, default: {} },
  documents: [{
    name: String,
    url: String,
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    uploadedAt: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false },
  }],

  // Timeline
  timeline: [{
    status: String,
    date: { type: Date, default: Date.now },
    note: String,
    updatedBy: String,
  }],

  // Match score at time of application
  matchScore: { type: Number, default: 0 },

  // Result
  result: {
    rank: Number,
    score: Number,
    certificate: String,
    remarks: String,
  },

  appliedAt: { type: Date, default: Date.now },
}, { timestamps: true });

applicationSchema.index({ userId: 1, opportunityId: 1 }, { unique: true });
applicationSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
