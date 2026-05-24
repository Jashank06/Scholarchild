const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  udiseCode: { type: String, unique: true, sparse: true, trim: true },
  name: { type: String, required: true, trim: true },
  board: { type: String, enum: ['CBSE', 'ICSE', 'State', 'IB', 'IGCSE', 'Other'] },
  type: { type: String, enum: ['government', 'private', 'aided'] },
  address: {
    city: String, district: String, taluka: String, state: String, pincode: String,
    fullAddress: String,
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' }, // [longitude, latitude]
  },
  contact: {
    email: { type: String, default: 'contact@school.edu' },
    phone: { type: String, default: '' },
    website: { type: String, default: '' }
  },
  facilities: {
    hasComputerLab: { type: Boolean, default: false },
    hasLibrary: { type: Boolean, default: false },
    hasPlayground: { type: Boolean, default: false },
    hasSmartClasses: { type: Boolean, default: false },
  },
  stats: {
    totalStudents: Number,
    studentTeacherRatio: Number,
    avgPassPercentage: Number,
  },
  ratings: {
    overall: { type: Number, default: 0 },
    academics: { type: Number, default: 0 },
    infrastructure: { type: Number, default: 0 },
    faculty: { type: Number, default: 0 },
    extracurricular: { type: Number, default: 0 },
    safety: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    valueForMoney: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  customFields: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  isVerified: { type: Boolean, default: false },
  adminUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  updateToken: { type: String, sparse: true, index: true },
  updateTokenExpires: { type: Date },
  updateRequestStatus: { type: String, enum: ['none', 'sent', 'visited', 'updated'], default: 'none' },
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