const mongoose = require('mongoose');

const institutionReviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
  ratings: {
    overall: { type: Number, min: 1, max: 5 },
    academics: { type: Number, min: 1, max: 5 },
    infrastructure: { type: Number, min: 1, max: 5 },
    faculty: { type: Number, min: 1, max: 5 },
    placements: { type: Number, min: 1, max: 5 },
    campus: { type: Number, min: 1, max: 5 },
    valueForMoney: { type: Number, min: 1, max: 5 },
  },
  title: { type: String, maxlength: 100 },
  comment: { type: String, maxlength: 1500 },
  pros: [{ type: String, maxlength: 200 }],
  cons: [{ type: String, maxlength: 200 }],
  photos: [String],
  isVerified: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: true },
  reviewType: { type: String, enum: ['student', 'parent', 'admin', 'alumni'], default: 'student' },
  helpfulCount: { type: Number, default: 0 },
  reportCount: { type: Number, default: 0 },
  helpfulBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  visitDate: Date,
  courseName: String,
}, { timestamps: true });

institutionReviewSchema.index({ userId: 1, institutionId: 1 }, { unique: true });
institutionReviewSchema.index({ institutionId: 1, createdAt: -1 });
institutionReviewSchema.index({ institutionId: 1, 'ratings.overall': -1 });

institutionReviewSchema.pre('save', function (next) {
  if (this.isModified('ratings')) {
    const r = this.ratings;
    const keys = ['academics', 'infrastructure', 'faculty', 'placements', 'campus', 'valueForMoney'];
    const sum = keys.reduce((acc, k) => acc + (r[k] || 0), 0);
    r.overall = Math.round((sum / keys.length) * 10) / 10;
  }
  next();
});

module.exports = mongoose.model('InstitutionReview', institutionReviewSchema);
