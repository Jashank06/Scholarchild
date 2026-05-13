const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  
  ratings: {
    academics: { type: Number, min: 1, max: 5, required: true },
    infrastructure: { type: Number, min: 1, max: 5, required: true },
    faculty: { type: Number, min: 1, max: 5, required: true },
    extracurricular: { type: Number, min: 1, max: 5, required: true },
    safety: { type: Number, min: 1, max: 5, required: true },
    overall: { type: Number, min: 1, max: 5 },
  },

  comment: { type: String, maxlength: 1000 },
  isVerified: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: true },
  
  // Helpful votes
  helpfulCount: { type: Number, default: 0 },
  reportCount: { type: Number, default: 0 },

}, { timestamps: true });

// Calculate overall rating before save
reviewSchema.pre('save', function (next) {
  const r = this.ratings;
  this.ratings.overall = parseFloat(
    ((r.academics + r.infrastructure + r.faculty + r.extracurricular + r.safety) / 5).toFixed(1)
  );
  next();
});

// One review per user per school
reviewSchema.index({ userId: 1, schoolId: 1 }, { unique: true });
reviewSchema.index({ schoolId: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
