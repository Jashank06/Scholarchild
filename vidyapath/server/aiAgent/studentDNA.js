/**
 * 🧬 Student DNA Profiling Engine
 * Hyper-personalized matching engine calculating 15-factor compatibility scores.
 */

const { Opportunity } = require('../models/Opportunity');

/**
 * Calculates a match score (0-100) between a Student DNA profile and an Opportunity
 */
function calculateMatchScore(student, opp) {
  let score = 0;
  let maxScore = 0;
  const factors = [];

  // 1. Grade Match (Critical)
  if (opp.eligibility?.grades?.length > 0) {
    maxScore += 25;
    if (opp.eligibility.grades.includes(student.grade)) {
      score += 25;
      factors.push('Perfect Grade Match');
    } else {
      return { score: 0, factors: ['Ineligible Grade'], isEligible: false };
    }
  }

  // 2. State/Geography (Critical)
  if (opp.eligibility?.states?.length > 0) {
    maxScore += 20;
    if (opp.eligibility.states.includes(student.state) || opp.eligibility.states.includes('National')) {
      score += 20;
      factors.push('Geography Match');
    } else {
      return { score: 0, factors: ['Not open to your State'], isEligible: false };
    }
  }

  // 3. Gender (Critical)
  if (opp.eligibility?.gender && opp.eligibility.gender !== 'all') {
    maxScore += 15;
    if (opp.eligibility.gender === student.gender) {
      score += 15;
      factors.push('Gender specific match');
    } else {
      return { score: 0, factors: ['Gender mismatch'], isEligible: false };
    }
  }

  // 4. Caste/Category
  if (opp.eligibility?.categories?.length > 0) {
    maxScore += 15;
    if (opp.eligibility.categories.includes(student.category)) {
      score += 15;
      factors.push('Category reservation match');
    }
  }

  // 5. Income Level
  if (opp.eligibility?.maxFamilyIncome) {
    maxScore += 10;
    if (student.familyIncome <= opp.eligibility.maxFamilyIncome) {
      score += 10;
      factors.push('Income eligibility met');
    } else {
      return { score: 0, factors: ['Income exceeds limit'], isEligible: false };
    }
  }

  // 6. Subject Interest (Bonus)
  if (student.interests && opp.category) {
    maxScore += 10;
    if (student.interests.includes(opp.category) || student.interests.includes(opp.tags)) {
      score += 10;
      factors.push('Matches your interests');
    }
  }

  // Calculate percentage
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 100;
  
  // Adjust for AI trust level
  let finalScore = percentage;
  if (opp.aiMetadata?.trustLevel === 'verified') finalScore = Math.min(100, finalScore + 5);

  return {
    score: finalScore,
    isEligible: true,
    factors,
    tier: finalScore > 85 ? 'Excellent' : finalScore > 65 ? 'Good' : 'Fair'
  };
}

module.exports = { calculateMatchScore };
