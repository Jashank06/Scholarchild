/**
 * 📊 AI Prioritizer
 * Scores opportunities based on relevance, benefit value, urgency, and audience size.
 */

function calculatePriorityScore(opportunity) {
  const scores = { relevance: 50, benefitValue: 50, urgency: 50, audienceSize: 50 };

  // 1. Relevance — based on type and source quality
  const typeRelevance = { scholarship: 90, scheme: 85, competition: 80, fellowship: 75, internship: 70, camp: 65, workshop: 60, other: 50 };
  scores.relevance = typeRelevance[opportunity.type] || 50;
  if (opportunity.organizer?.type === 'government') scores.relevance = Math.min(100, scores.relevance + 10);
  if (opportunity.aiMetadata?.trustLevel === 'verified') scores.relevance = Math.min(100, scores.relevance + 5);

  // 2. Benefit Value — based on monetary reward
  const amount = opportunity.rewards?.cashAmount || 0;
  if (amount >= 100000) scores.benefitValue = 95;
  else if (amount >= 50000) scores.benefitValue = 85;
  else if (amount >= 25000) scores.benefitValue = 75;
  else if (amount >= 10000) scores.benefitValue = 65;
  else if (amount > 0) scores.benefitValue = 55;
  else {
    // Non-monetary: certificates, recognition
    const rewardType = opportunity.rewards?.type;
    scores.benefitValue = rewardType === 'mixed' ? 60 : rewardType === 'certificate' ? 45 : 40;
  }

  // 3. Urgency — based on deadline proximity
  const deadline = opportunity.dates?.applicationDeadline;
  if (deadline) {
    const daysLeft = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 0) scores.urgency = 10; // Expired
    else if (daysLeft <= 7) scores.urgency = 95;
    else if (daysLeft <= 15) scores.urgency = 85;
    else if (daysLeft <= 30) scores.urgency = 70;
    else if (daysLeft <= 60) scores.urgency = 55;
    else scores.urgency = 40;
  } else {
    scores.urgency = 50; // No deadline = moderate urgency
  }

  // 4. Audience Size — based on eligibility breadth
  const eligibility = opportunity.eligibility || {};
  let audienceScore = 50;
  // More grades eligible = larger audience
  const gradeCount = eligibility.grades?.length || 0;
  if (gradeCount === 0) audienceScore += 20; // All grades
  else if (gradeCount >= 6) audienceScore += 15;
  else if (gradeCount >= 3) audienceScore += 10;
  // State coverage
  const stateCount = eligibility.states?.length || 0;
  if (stateCount === 0) audienceScore += 15; // All India
  else if (stateCount >= 5) audienceScore += 10;
  // Gender
  if (eligibility.gender === 'all') audienceScore += 5;
  // Category
  const catCount = eligibility.categories?.length || 0;
  if (catCount === 0) audienceScore += 5; // All categories
  scores.audienceSize = Math.min(100, audienceScore);

  // Overall — weighted average
  scores.overall = Math.round(
    scores.relevance * 0.30 +
    scores.benefitValue * 0.25 +
    scores.urgency * 0.25 +
    scores.audienceSize * 0.20
  );

  return scores;
}

module.exports = { calculatePriorityScore };
