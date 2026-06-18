const mongoose = require('mongoose');

const eventReviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  ratings: {
    overall: { type: Number, min: 1, max: 5 },
    experience: { type: Number, min: 1, max: 5 },
    organization: { type: Number, min: 1, max: 5 },
    value: { type: Number, min: 1, max: 5 },
    engagement: { type: Number, min: 1, max: 5 },
  },
  title: { type: String, maxlength: 100 },
  comment: { type: String, maxlength: 1500 },
  pros: [{ type: String, maxlength: 200 }],
  cons: [{ type: String, maxlength: 200 }],
  photos: [String],
  isVerified: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: true },
  reviewType: { type: String, enum: ['participant', 'spectator', 'parent', 'admin'], default: 'participant' },
  helpfulCount: { type: Number, default: 0 },
  reportCount: { type: Number, default: 0 },
  helpfulBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

eventReviewSchema.index({ userId: 1, eventId: 1 }, { unique: true });
eventReviewSchema.index({ eventId: 1, createdAt: -1 });
eventReviewSchema.index({ eventId: 1, 'ratings.overall': -1 });

eventReviewSchema.pre('save', function (next) {
  if (this.isModified('ratings')) {
    const r = this.ratings;
    const keys = ['experience', 'organization', 'value', 'engagement'];
    const sum = keys.reduce((acc, k) => acc + (r[k] || 0), 0);
    r.overall = Math.round((sum / keys.length) * 10) / 10;
  }
  next();
});

module.exports = mongoose.model('EventReview', eventReviewSchema);
