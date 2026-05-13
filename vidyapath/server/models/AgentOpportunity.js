const mongoose = require('mongoose');

const agentOpportunitySchema = new mongoose.Schema({
  // ─── Core Opportunity Fields (mirrors Opportunity model) ───
  type: {
    type: String,
    enum: ['scholarship', 'competition', 'scheme', 'fellowship', 'internship', 'camp', 'workshop', 'other'],
    required: true,
  },
  title: { type: String, required: true, trim: true },
  slug: { type: String, lowercase: true },
  description: { type: String, default: '' },
  shortDescription: { type: String, maxlength: 350 },
  coverImage: String,

  // Organizer
  organizer: {
    name: { type: String, default: 'Unknown' },
    type: { type: String, enum: ['government', 'ngo', 'corporate', 'trust', 'institution', 'school', 'unknown'], default: 'unknown' },
    logo: String,
    website: String,
    level: { type: String, enum: ['taluka', 'district', 'state', 'national', 'international'], default: 'national' },
  },

  // Category
  category: {
    type: String,
    enum: ['academic', 'arts', 'science', 'quiz', 'olympiad', 'coding', 'writing', 'debate', 'general', 'sports', 'music', 'other'],
    default: 'general',
  },
  tags: [String],

  // Eligibility
  eligibility: {
    grades: [{ type: Number, min: 1, max: 12 }],
    minAge: Number,
    maxAge: Number,
    gender: { type: String, enum: ['all', 'male', 'female'], default: 'all' },
    states: [String],
    categories: [String], // SC/ST/OBC/General
    maxFamilyIncome: Number,
    minPercentage: Number,
    boards: [String],
    otherCriteria: String,
  },

  // Rewards
  rewards: {
    type: { type: String, enum: ['cash', 'certificate', 'recognition', 'mixed', 'prize', 'other'], default: 'other' },
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

  // ─── AI Agent Metadata ───
  aiMetadata: {
    detectionConfidence: { type: Number, min: 0, max: 100, default: 50 },
    classificationConfidence: { type: Number, min: 0, max: 100, default: 50 },
    overallConfidence: { type: Number, min: 0, max: 100, default: 50 },
    trustLevel: { type: String, enum: ['verified', 'suspicious', 'unverified'], default: 'unverified' },
    trustScore: { type: Number, min: 0, max: 100, default: 50 },
    classificationReasoning: String,
    detectedKeywords: [String],
    inferredFields: [String], // Fields that were AI-inferred, not directly extracted
  },

  // ─── Source Tracking ───
  source: {
    type: { type: String, enum: ['excel_import', 'url_scan', 'api_fetch', 'manual', 'web_scrape', 'scheduled_scan'], default: 'manual' },
    url: String,
    domain: String,
    fileName: String,
    rawData: String, // Original raw text/data before processing
    scrapedAt: { type: Date, default: Date.now },
  },

  // ─── Enrichment Log ───
  enrichmentLog: [{
    field: String,
    action: String, // 'inferred', 'normalized', 'generated', 'corrected'
    originalValue: String,
    newValue: String,
    reasoning: String,
    timestamp: { type: Date, default: Date.now },
  }],

  // ─── Duplicate Detection ───
  duplicateCheck: {
    isDuplicate: { type: Boolean, default: false },
    similarityScore: { type: Number, default: 0 },
    matchedOpportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity' },
    matchedAgentOpportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'AgentOpportunity' },
    matchDetails: String,
  },

  // ─── Priority Score ───
  priorityScore: {
    overall: { type: Number, min: 0, max: 100, default: 50 },
    relevance: { type: Number, min: 0, max: 100, default: 50 },
    benefitValue: { type: Number, min: 0, max: 100, default: 50 },
    urgency: { type: Number, min: 0, max: 100, default: 50 },
    audienceSize: { type: Number, min: 0, max: 100, default: 50 },
  },

  // ─── Approval Workflow ───
  agentStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'needs_review', 'duplicate'],
    default: 'pending',
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  rejectionReason: String,
  approvedOpportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity' },

  // ─── Scan Reference ───
  scanLogId: { type: mongoose.Schema.Types.ObjectId, ref: 'AgentScanLog' },

}, { timestamps: true });

// Auto-generate slug
agentOpportunitySchema.pre('save', function () {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36);
  }
});

// Indexes
agentOpportunitySchema.index({ agentStatus: 1, createdAt: -1 });
agentOpportunitySchema.index({ 'aiMetadata.overallConfidence': -1 });
agentOpportunitySchema.index({ 'priorityScore.overall': -1 });
agentOpportunitySchema.index({ title: 'text', description: 'text', tags: 'text' });
agentOpportunitySchema.index({ 'source.type': 1 });
agentOpportunitySchema.index({ 'duplicateCheck.isDuplicate': 1 });

module.exports = mongoose.model('AgentOpportunity', agentOpportunitySchema);
