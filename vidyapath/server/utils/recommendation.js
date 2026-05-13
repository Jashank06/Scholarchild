/**
 * VidyaPath AI Recommendation Engine
 * Rule-based match scoring system
 * Calculates a 0-100 match score between a user profile and an opportunity
 */

function calculateMatchScore(user, opportunity) {
  let score = 0;
  let maxScore = 0;
  const profile = user.profile || {};
  const elig = opportunity.eligibility || {};

  // 1. Grade match (30 points)
  maxScore += 30;
  if (elig.grades?.length > 0 && profile.grade) {
    if (elig.grades.includes(profile.grade)) {
      score += 30;
    }
  } else if (!elig.grades || elig.grades.length === 0) {
    score += 30; // No grade restriction = full match
  }

  // 2. State match (20 points)
  maxScore += 20;
  if (elig.states?.length > 0 && profile.address?.state) {
    if (elig.states.includes(profile.address.state)) {
      score += 20;
    }
  } else if (!elig.states || elig.states.length === 0) {
    score += 20; // National = full match
  }

  // 3. Category (caste/social) match (15 points)
  maxScore += 15;
  if (elig.categories?.length > 0 && profile.category) {
    if (elig.categories.includes(profile.category) || elig.categories.includes('General')) {
      score += 15;
    }
  } else {
    score += 15;
  }

  // 4. Income eligibility (10 points)
  maxScore += 10;
  if (elig.maxFamilyIncome && profile.familyIncome) {
    if (profile.familyIncome <= elig.maxFamilyIncome) {
      score += 10;
    }
  } else {
    score += 10;
  }

  // 5. Academic percentage (10 points)
  maxScore += 10;
  if (elig.minPercentage && profile.previousGradePercentage) {
    if (profile.previousGradePercentage >= elig.minPercentage) {
      score += 10;
    }
  } else {
    score += 10;
  }

  // 6. Interest match (10 points)
  maxScore += 10;
  if (profile.interests?.length > 0 && opportunity.category) {
    if (profile.interests.includes(opportunity.category)) {
      score += 10;
    } else {
      score += 3; // Partial — category not in interests but still eligible
    }
  } else {
    score += 5;
  }

  // 7. Board match (5 points)
  maxScore += 5;
  if (elig.boards?.length > 0 && profile.board) {
    if (elig.boards.includes(profile.board)) {
      score += 5;
    }
  } else {
    score += 5;
  }

  // Calculate percentage
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 50;
  return Math.min(100, Math.max(0, percentage));
}

/**
 * Get recommended opportunities for a user
 * Sorted by match score descending
 */
async function getRecommendations(user, opportunities, limit = 20) {
  const scored = opportunities.map(opp => ({
    opportunity: opp,
    matchScore: calculateMatchScore(user, opp),
  }));

  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored.slice(0, limit);
}

module.exports = { calculateMatchScore, getRecommendations };
