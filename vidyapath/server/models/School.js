const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  board: { type: String, enum: ['CBSE', 'ICSE', 'State', 'IB', 'IGCSE', 'Other'] },
  type: { type: String, enum: ['government', 'private', 'aided'] },
  address: {
    city: String, district: String, taluka: String, state: String, pincode: String,
  },
  contact: { email: String, phone: String, website: String },
  ratings: {
    overall: { type: Number, default: 0 },
    academics: { type: Number, default: 0 },
    infrastructure: { type: Number, default: 0 },
    faculty: { type: Number, default: 0 },
    extracurricular: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  customFields: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  isVerified: { type: Boolean, default: false },
  adminUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

schoolSchema.index({ 'address.state': 1, 'address.district': 1 });

const bookmarkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
}, { timestamps: true });

bookmarkSchema.index({ userId: 1, opportunityId: 1 }, { unique: true });

const School = mongoose.model('School', schoolSchema);
const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

module.exports = { School, Bookmark };
