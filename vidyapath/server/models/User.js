const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['student', 'parent', 'admin', 'school', 'university', 'service_provider'],
    default: 'student',
  },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, unique: true, sparse: true, trim: true },
  password: { type: String, select: false },
  isVerified: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: true }, // For schools/institutions needing admin approval
  otp: { code: String, expiresAt: Date },

  // ─── Student Profile ───
  profile: {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    avatar: String,
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    grade: { type: Number, min: 1, max: 12 },
    board: { type: String, enum: ['CBSE', 'ICSE', 'State', 'IB', 'IGCSE', 'Other'] },
    schoolName: String,
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },

    // Location
    address: {
      street: String,
      city: String,
      district: String,
      taluka: String,
      state: String,
      pincode: String,
    },

    // Family Info
    familyIncome: Number,
    category: { type: String, enum: ['General', 'OBC', 'SC', 'ST', 'EWS', 'Other'] },
    religion: String,
    parentOccupation: String,

    // Academic
    previousGradePercentage: Number,
    achievements: [String],
    interests: [{ type: String, enum: ['academic', 'arts', 'science', 'quiz', 'olympiad', 'coding', 'writing', 'debate', 'music', 'other'] }],
  },

  // ─── Parent Profile ───
  parentProfile: {
    occupation: String,
    qualifications: String,
    children: [{
      childId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      relationship: { type: String, enum: ['father', 'mother', 'guardian'], default: 'guardian' },
      linkedAt: { type: Date, default: Date.now },
    }],
  },

  // ─── Linked Parent (reverse lookup for students) ───
  linkedParent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // ─── Institution Profile (School / University / Service Provider) ───
  institutionProfile: {
    institutionName: { type: String, trim: true },
    institutionType: { type: String, enum: ['government', 'private', 'aided', 'autonomous', 'deemed'] },
    registrationNumber: String,
    principalName: String,
    board: { type: String, enum: ['CBSE', 'ICSE', 'State', 'IB', 'IGCSE', 'Other'] },
    accreditation: String,
    totalStudents: Number,
    gradesOffered: [Number], // e.g. [1,2,...,12]
    website: String,
    logo: String,
    description: String,
    verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    verifiedAt: Date,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    managedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },

  // ─── Gamification ───
  gamification: {
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [{
      badgeId: String,
      badgeName: String,
      badgeIcon: String,
      earnedAt: { type: Date, default: Date.now },
    }],
    streakDays: { type: Number, default: 0 },
    lastActiveDate: Date,
  },

  // ─── Preferences ───
  preferences: {
    language: { type: String, default: 'en' },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: false },
    },
  },

  // Profile completion score
  profileScore: { type: Number, default: 0 },

}, { timestamps: true });

// Hash password
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Calculate profile score
userSchema.methods.calculateProfileScore = function () {
  let score = 0;
  const p = this.profile;
  if (p.firstName) score += 10;
  if (p.lastName) score += 5;
  if (p.dateOfBirth) score += 10;
  if (p.gender) score += 5;
  if (p.grade) score += 15;
  if (p.board) score += 5;
  if (p.schoolName) score += 5;
  if (p.address?.state) score += 10;
  if (p.address?.city) score += 5;
  if (p.familyIncome) score += 10;
  if (p.category) score += 5;
  if (p.previousGradePercentage) score += 10;
  if (p.interests?.length > 0) score += 5;
  this.profileScore = score;
  return score;
};

// Virtual: full name
userSchema.virtual('fullName').get(function () {
  if (this.role === 'school' || this.role === 'university') {
    return this.institutionProfile?.institutionName || '';
  }
  return `${this.profile?.firstName || ''} ${this.profile?.lastName || ''}`.trim();
});

userSchema.set('toJSON', { virtuals: true });

// Indexes
userSchema.index({ role: 1 });
userSchema.index({ 'profile.grade': 1, 'profile.address.state': 1 });
userSchema.index({ 'parentProfile.children.childId': 1 });
userSchema.index({ linkedParent: 1 });

module.exports = mongoose.model('User', userSchema);
