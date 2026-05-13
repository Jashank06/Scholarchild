/**
 * Kushaagra Gamification System
 * XP points, levels, badges, and streaks
 */

const BADGES = {
  FIRST_LOGIN: { id: 'first_login', name: 'First Steps', icon: '🌟', xp: 50, description: 'Logged in for the first time' },
  PROFILE_COMPLETE: { id: 'profile_complete', name: 'Profile Pro', icon: '👤', xp: 100, description: 'Completed your profile 100%' },
  FIRST_APP: { id: 'first_application', name: 'First Application', icon: '📝', xp: 75, description: 'Applied to your first opportunity' },
  FIVE_APPS: { id: 'five_applications', name: 'Application Star', icon: '⭐', xp: 150, description: 'Applied to 5 opportunities' },
  TEN_APPS: { id: 'ten_applications', name: 'Application Master', icon: '🏅', xp: 300, description: 'Applied to 10 opportunities' },
  FIRST_WIN: { id: 'first_win', name: 'Winner', icon: '🏆', xp: 500, description: 'Got approved for a scholarship/competition' },
  STREAK_7: { id: 'streak_7', name: '7-Day Streak', icon: '🔥', xp: 200, description: 'Active for 7 consecutive days' },
  STREAK_30: { id: 'streak_30', name: 'Monthly Champion', icon: '💎', xp: 500, description: 'Active for 30 consecutive days' },
  EXPLORER: { id: 'explorer', name: 'Explorer', icon: '🚀', xp: 100, description: 'Viewed 50 opportunities' },
  DOC_MASTER: { id: 'doc_master', name: 'Doc Master', icon: '📁', xp: 100, description: 'Uploaded all required documents' },
  SCHOLAR_ELITE: { id: 'scholar_elite', name: 'Scholar Elite', icon: '💎', xp: 1000, description: 'Reached Level 10' },
};

const LEVEL_THRESHOLDS = [
  0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500, 10000,
];

function getLevel(xp) {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

function getXpToNextLevel(xp) {
  const level = getLevel(xp);
  if (level >= LEVEL_THRESHOLDS.length) return 0;
  return LEVEL_THRESHOLDS[level] - xp;
}

function getLevelProgress(xp) {
  const level = getLevel(xp);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const progress = ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return Math.min(100, Math.max(0, progress));
}

async function awardXP(user, amount, reason) {
  user.gamification.xp += amount;
  user.gamification.level = getLevel(user.gamification.xp);
  await user.save();
  return { xp: user.gamification.xp, level: user.gamification.level, awarded: amount, reason };
}

async function awardBadge(user, badgeId) {
  const badge = BADGES[badgeId];
  if (!badge) return null;

  const alreadyHas = user.gamification.badges.some(b => b.badgeId === badge.id);
  if (alreadyHas) return null;

  user.gamification.badges.push({
    badgeId: badge.id,
    badgeName: badge.name,
    badgeIcon: badge.icon,
  });
  user.gamification.xp += badge.xp;
  user.gamification.level = getLevel(user.gamification.xp);
  await user.save();

  return badge;
}

async function updateStreak(user) {
  const today = new Date().toDateString();
  const lastActive = user.gamification.lastActiveDate?.toDateString();

  if (lastActive === today) return; // Already active today

  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (lastActive === yesterday) {
    user.gamification.streakDays += 1;
  } else {
    user.gamification.streakDays = 1;
  }

  user.gamification.lastActiveDate = new Date();

  // Check streak badges
  if (user.gamification.streakDays >= 7) await awardBadge(user, 'STREAK_7');
  if (user.gamification.streakDays >= 30) await awardBadge(user, 'STREAK_30');

  await user.save();
}

module.exports = {
  BADGES, LEVEL_THRESHOLDS,
  getLevel, getXpToNextLevel, getLevelProgress,
  awardXP, awardBadge, updateStreak,
};
