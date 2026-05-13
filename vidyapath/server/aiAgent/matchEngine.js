/**
 * 🎯 Student Match Engine
 * Matches opportunities to students based on profile — personalized recommendations
 */

const User = require('../models/User');
const Opportunity = require('../models/Opportunity');

/**
 * Calculate match score between a student and an opportunity
 * @param {object} student - User document (student)
 * @param {object} opportunity - Opportunity document
 * @returns {number} Match score 0-100
 */
function calculateMatchScore(student, opportunity) {
  let score = 50; // Base score
  let maxBonus = 0;
  const profile = student.profile || {};
  const elig = opportunity.eligibility || {};

  // 1. Grade Match (±25 points)
  maxBonus += 25;
  if (elig.grades && elig.grades.length > 0) {
    if (profile.grade && elig.grades.includes(profile.grade)) {
      score += 25; // Perfect match
    } else if (profile.grade) {
      score -= 30; // Grade mismatch is a strong negative
    }
  } else {
    score += 15; // Open to all grades
  }

  // 2. State Match (±15 points)
  maxBonus += 15;
  if (elig.states && elig.states.length > 0) {
    if (profile.address?.state && elig.states.includes(profile.address.state)) {
      score += 15;
    } else if (profile.address?.state) {
      score -= 20; // State mismatch
    }
  } else {
    score += 10; // All-India
  }

  // 3. Category Match (±10 points)
  maxBonus += 10;
  if (elig.categories && elig.categories.length > 0 && !elig.categories.includes('General')) {
    if (profile.category && elig.categories.includes(profile.category)) {
      score += 10;
    } else if (profile.category) {
      score -= 15;
    }
  } else {
    score += 5; // Open to all
  }

  // 4. Gender Match (±10 points)
  maxBonus += 10;
  if (elig.gender && elig.gender !== 'all') {
    if (profile.gender === elig.gender) {
      score += 10;
    } else if (profile.gender) {
      score -= 25; // Gender mismatch
    }
  } else {
    score += 5;
  }

  // 5. Interest Match (+15 points)
  maxBonus += 15;
  if (profile.interests && profile.interests.length > 0) {
    const oppCategory = opportunity.category || '';
    if (profile.interests.includes(oppCategory)) {
      score += 15;
    } else if (profile.interests.includes('science') && ['science', 'olympiad', 'coding'].includes(oppCategory)) {
      score += 10;
    }
  }

  // 6. Income Match (+5 points)
  if (elig.maxFamilyIncome && profile.familyIncome) {
    if (profile.familyIncome <= elig.maxFamilyIncome) score += 5;
    else score -= 10;
  }

  // 7. Board Match (+5 points)
  if (elig.boards && elig.boards.length > 0 && profile.board) {
    if (elig.boards.includes(profile.board)) score += 5;
  }

  // Clamp to 0-100
  return Math.max(0, Math.min(100, score));
}

/**
 * Get recommended opportunities for a student
 * @param {string} studentId - User ID
 * @param {object} options - { limit, minScore, type }
 * @returns {Array} Sorted opportunities with match scores
 */
async function getRecommendations(studentId, options = {}) {
  const { limit = 20, minScore = 40, type = null } = options;

  const student = await User.findById(studentId).lean();
  if (!student || student.role !== 'student') return [];

  const filter = { status: 'active' };
  if (type) filter.type = type;

  const opportunities = await Opportunity.find(filter)
    .sort({ 'dates.applicationDeadline': 1 })
    .limit(100)
    .lean();

  const scored = opportunities
    .map(opp => ({
      ...opp,
      matchScore: calculateMatchScore(student, opp),
    }))
    .filter(opp => opp.matchScore >= minScore)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  return scored;
}

/**
 * Find matching students for an opportunity (for notifications)
 */
async function findMatchingStudents(opportunity, minScore = 45) {
  const filter = { role: 'student' };
  const elig = opportunity.eligibility || {};

  if (elig.grades && elig.grades.length > 0) {
    filter['profile.grade'] = { $in: elig.grades };
  }
  if (elig.states && elig.states.length > 0) {
    filter['$or'] = [
      { 'profile.address.state': { $in: elig.states } },
      { 'profile.address.state': { $exists: false } },
    ];
  }
  if (elig.gender && elig.gender !== 'all') {
    filter['profile.gender'] = elig.gender;
  }

  const students = await User.find(filter).select('_id profile email').lean();
  
  return students.filter(s => calculateMatchScore(s, opportunity) >= minScore);
}

/**
 * Get deadline-approaching opportunities for a student
 */
async function getDeadlineSoon(studentId, daysAhead = 7) {
  const student = await User.findById(studentId).lean();
  if (!student) return [];

  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + daysAhead);

  const opportunities = await Opportunity.find({
    status: 'active',
    'dates.applicationDeadline': { $gte: now, $lte: cutoff },
  }).lean();

  return opportunities
    .map(opp => ({ ...opp, matchScore: calculateMatchScore(student, opp) }))
    .filter(opp => opp.matchScore >= 35)
    .sort((a, b) => new Date(a.dates.applicationDeadline) - new Date(b.dates.applicationDeadline));
}

module.exports = { calculateMatchScore, getRecommendations, findMatchingStudents, getDeadlineSoon };
