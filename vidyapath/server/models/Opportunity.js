const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  type: { type: String, enum: ['scholarship', 'competition', 'scheme'], required: true },
  status: { type: String, enum: ['active', 'inactive', 'draft', 'expired'], default: 'active' },

  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, required: true },
  shortDescription: { type: String, maxlength: 250 },
  coverImage: String,

  // Organizer
  organizer: {
    name: { type: String, required: true },
    type: { type: String, enum: ['government', 'ngo', 'corporate', 'trust', 'institution', 'school'] },
    logo: String,
    website: String,
    level: { type: String, enum: ['taluka', 'district', 'state', 'national', 'international'] },
  },

  // Category
  category: {
    type: String,
    enum: ['academic', 'arts', 'science', 'quiz', 'olympiad', 'coding', 'writing', 'debate', 'general'],
    required: true,
  },
  tags: [String],

  // Eligibility
  eligibility: {
    grades: [{ type: Number, min: 1, max: 12 }],
    minAge: Number,
    maxAge: Number,
    gender: { type: String, enum: ['all', 'male', 'female'], default: 'all' },
    states: [String], // empty = all
    categories: [String], // SC/ST/OBC/General
    maxFamilyIncome: Number,
    minPercentage: Number,
    boards: [String],
    otherCriteria: String,
  },

  // Rewards
  rewards: {
    type: { type: String, enum: ['cash', 'certificate', 'recognition', 'mixed'] },
    cashAmount: Number,
    cashCurrency: { type: String, default: 'INR' },
    description: String,
    otherBenefits: [String],
  },

  // Dates
  dates: {
    applicationStart: Date,
    applicationDeadline: Date,
    examDate: Date,
    resultDate: Date,
    awardDate: Date,
  },

  // Application
  application: {
    mode: { type: String, enum: ['internal', 'external', 'both'], default: 'external' },
    externalLink: String,
    requiredDocuments: [String],
    applicationFee: { type: Number, default: 0 },
    isFree: { type: Boolean, default: true },
  },

  // Syllabus (for competitions)
  syllabus: String,
  preparationTips: String,
  pastPapers: [{ year: Number, url: String }],

  // Stats
  stats: {
    totalApplications: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    bookmarkCount: { type: Number, default: 0 },
  },

  // Admin
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isVerified: { type: Boolean, default: false },

}, { timestamps: true });

// Auto-generate slug
opportunitySchema.pre('save', function () {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36);
  }
});

// Index for search
opportunitySchema.index({ title: 'text', description: 'text', tags: 'text' });
opportunitySchema.index({ 'eligibility.grades': 1, category: 1, status: 1 });
opportunitySchema.index({ 'eligibility.states': 1, status: 1 });
opportunitySchema.index({ 'dates.applicationDeadline': 1 });
opportunitySchema.index({ type: 1, status: 1 });

module.exports = mongoose.model('Opportunity', opportunitySchema);
