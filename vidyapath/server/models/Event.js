const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, enum: ['Sports', 'Cultural', 'Competition', 'Workshop', 'Other'], required: true },
  description: { type: String, default: '' },
  eventDate: Date,
  registrationDeadline: Date,
  venue: {
    city: String, state: String, fullAddress: String,
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' },
  },
  organizer: {
    name: String, contact: String, website: String,
  },
  eligibility: { type: String, default: '' },
  prizes: { type: String, default: '' },
  fees: { type: Number, default: 0 },
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
  coverImage: String,
  ratings: {
    overall: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
    organization: { type: Number, default: 0 },
    value: { type: Number, default: 0 },
    engagement: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  customFields: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  isVerified: { type: Boolean, default: false },
  adminUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

eventSchema.index({ 'venue.city': 1, 'venue.state': 1 });
eventSchema.index({ category: 1, status: 1 });
eventSchema.index({ eventDate: 1 });

module.exports = mongoose.model('Event', eventSchema);
