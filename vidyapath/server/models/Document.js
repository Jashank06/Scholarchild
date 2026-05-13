const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['aadhaar', 'marksheet', 'income_cert', 'caste_cert', 'domicile', 'photo', 'birth_cert', 'bank_passbook', 'other'],
    required: true,
  },
  name: { type: String, required: true },
  originalName: String,
  url: { type: String, required: true },
  mimeType: String,
  size: Number,
  verified: { type: Boolean, default: false },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,
  expiryDate: Date,
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

documentSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('Document', documentSchema);
