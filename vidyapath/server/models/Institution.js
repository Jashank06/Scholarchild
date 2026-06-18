const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['ITI', 'Diploma', 'College', 'University'], required: true },
  affiliation: { type: String, trim: true },
  address: {
    city: String, district: String, state: String, pincode: String,
    fullAddress: String,
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' },
  },
  contact: {
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    website: { type: String, default: '' },
  },
  courses: [{ type: String, trim: true }],
  facilities: {
    hasHostel: { type: Boolean, default: false },
    hasLibrary: { type: Boolean, default: false },
    hasSports: { type: Boolean, default: false },
    hasWifi: { type: Boolean, default: false },
    hasCafeteria: { type: Boolean, default: false },
  },
  stats: {
    totalStudents: Number,
    placementRate: Number,
    avgFees: Number,
  },
  ratings: {
    overall: { type: Number, default: 0 },
    academics: { type: Number, default: 0 },
    infrastructure: { type: Number, default: 0 },
    faculty: { type: Number, default: 0 },
    placements: { type: Number, default: 0 },
    campus: { type: Number, default: 0 },
    valueForMoney: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  customFields: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  isVerified: { type: Boolean, default: false },
  adminUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

institutionSchema.index({ 'address.state': 1, 'address.district': 1 });

module.exports = mongoose.model('Institution', institutionSchema);
