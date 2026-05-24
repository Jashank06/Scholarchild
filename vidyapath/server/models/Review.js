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
    communication: { type: Number, min: 1, max: 5, default: 3 },
    valueForMoney: { type: Number, min: 1, max: 5, default: 3 },
    overall: { type: Number, min: 1, max: 5 },
  },

  // Review content
  title: { type: String, maxlength: 100, default: '' },
  comment: { type: String, maxlength: 1500 },
  
  // Pros and cons
  pros: [{ type: String, maxlength: 200 }],
  cons: [{ type: String, maxlength: 200 }],
  
  // Media
  photos: [{ type: String }],
  
  // Verification status
  isVerified: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: true },
  
  // Review type
  reviewType: { 
    type: String, 
    enum: ['parent', 'admin', 'student', 'teacher'], 
    default: 'parent' 
  },
  
  // School response
  schoolResponse: {
    responded: { type: Boolean, default: false },
    message: { type: String, maxlength: 500 },
    respondedAt: Date,
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  
  // Engagement
  helpfulCount: { type: Number, default: 0 },
  reportCount: { type: Number, default: 0 },
  helpfulBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Metadata
  visitDate: Date,
  childGrade: Number,

}, { timestamps: true });

// Calculate overall rating before save
reviewSchema.pre('save', function () {
  const r = this.ratings;
  const values = [r.academics, r.infrastructure, r.faculty, r.extracurricular, r.safety];
  if (r.communication) values.push(r.communication);
  if (r.valueForMoney) values.push(r.valueForMoney);
  
  if (values.length > 0) {
    this.ratings.overall = parseFloat(
      (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
    );
  }
});

// One review per user per school
reviewSchema.index({ userId: 1, schoolId: 1 }, { unique: true });
reviewSchema.index({ schoolId: 1, createdAt: -1 });
reviewSchema.index({ schoolId: 1, 'ratings.overall': -1 });

module.exports = mongoose.model('Review', reviewSchema);