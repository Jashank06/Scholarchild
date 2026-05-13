const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { awardBadge } = require('../utils/gamification');

// @GET /api/users/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.calculateProfileScore();
    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { firstName, lastName, dateOfBirth, gender, grade, board, schoolName, address, familyIncome, category, religion, parentOccupation, previousGradePercentage, achievements, interests } = req.body;

    // Update profile fields
    if (firstName !== undefined) user.profile.firstName = firstName;
    if (lastName !== undefined) user.profile.lastName = lastName;
    if (dateOfBirth) user.profile.dateOfBirth = dateOfBirth;
    if (gender) user.profile.gender = gender;
    if (grade) user.profile.grade = parseInt(grade);
    if (board) user.profile.board = board;
    if (schoolName) user.profile.schoolName = schoolName;
    if (address) user.profile.address = { ...user.profile.address, ...address };
    if (familyIncome !== undefined) user.profile.familyIncome = familyIncome;
    if (category) user.profile.category = category;
    if (religion) user.profile.religion = religion;
    if (parentOccupation) user.profile.parentOccupation = parentOccupation;
    if (previousGradePercentage !== undefined) user.profile.previousGradePercentage = previousGradePercentage;
    if (achievements) user.profile.achievements = achievements;
    if (interests) user.profile.interests = interests;

    user.calculateProfileScore();

    // Badge for completing profile
    if (user.profileScore >= 100) {
      await awardBadge(user, 'PROFILE_COMPLETE');
    }

    await user.save();
    res.json({ success: true, user, profileScore: user.profileScore });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @PUT /api/users/preferences
router.put('/preferences', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { language, notifications } = req.body;

    if (language) user.preferences.language = language;
    if (notifications) user.preferences.notifications = { ...user.preferences.notifications, ...notifications };

    await user.save();
    res.json({ success: true, preferences: user.preferences });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/users/gamification
router.get('/gamification', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { getLevel, getXpToNextLevel, getLevelProgress, BADGES } = require('../utils/gamification');

    res.json({
      success: true,
      gamification: {
        ...user.gamification.toObject(),
        levelProgress: getLevelProgress(user.gamification.xp),
        xpToNextLevel: getXpToNextLevel(user.gamification.xp),
      },
      allBadges: Object.values(BADGES),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/users/:id/profile — Get a specific user's profile (for parent-child, admin)
router.get('/:id/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Only allow: parent viewing child, admin, or self
    const isParent = req.user.role === 'parent' && req.user.parentProfile?.children?.some(
      c => c.childId?.toString() === req.params.id
    );
    const isSelf = req.user._id.toString() === req.params.id;
    const isAdmin = req.user.role === 'admin';

    if (!isParent && !isSelf && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this profile' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
