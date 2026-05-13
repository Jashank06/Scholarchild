const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Achievement = require('../models/Achievement');
const Review = require('../models/Review');
const News = require('../models/News');
const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const ensureParent = (req, res, next) => {
  if (req.user.role !== 'parent') {
    return res.status(403).json({ success: false, message: 'Parent access only' });
  }
  next();
};

router.get('/applications', protect, ensureParent, async (req, res) => {
  try {
    const childLinks = req.user.parentProfile?.children || [];
    const childIds = childLinks.map(c => c.childId);
    if (childIds.length === 0) return res.json({ success: true, data: [] });

    const [children, applications] = await Promise.all([
      User.find({ _id: { $in: childIds } }, 'profile parentProfile role'),
      Application.find({ userId: { $in: childIds } })
        .populate('opportunityId', 'title type organizer dates rewards application'),
    ]);

    const childMap = new Map(children.map(child => [child._id.toString(), child]));
    const grouped = {};
    applications.forEach(app => {
      const id = app.userId.toString();
      if (!grouped[id]) grouped[id] = [];
      grouped[id].push(app);
    });

    const response = childIds.map((childId) => {
      const child = childMap.get(childId.toString());
      return {
        childId,
        name: `${child?.profile?.firstName || 'Child'} ${child?.profile?.lastName || ''}`.trim(),
        grade: child?.profile?.grade,
        board: child?.profile?.board,
        applications: (grouped[childId.toString()] || []).sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)),
      };
    });

    res.json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/history', protect, ensureParent, async (req, res) => {
  try {
    const childLinks = req.user.parentProfile?.children || [];
    const childIds = childLinks.map(c => c.childId);

    const children = await User.find({ _id: { $in: childIds } }, 'profile');
    const childMap = new Map(children.map(c => [c._id.toString(), c]));

    const [news, achievements, feedback, reviews] = await Promise.all([
      News.find({ status: 'active' }).sort({ publishedAt: -1 }).limit(20),
      Achievement.find({ childId: { $in: childIds } }).sort({ achievedAt: -1 }).limit(20),
      ServiceRequest.find({ userId: req.user._id, type: 'feedback' }).sort({ createdAt: -1 }).limit(20),
      Review.find({ userId: req.user._id }).populate('schoolId', 'name').sort({ createdAt: -1 }).limit(20),
    ]);

    const achievementData = achievements.map((item) => {
      const child = childMap.get(item.childId.toString());
      return {
        ...item.toObject(),
        childName: `${child?.profile?.firstName || 'Child'} ${child?.profile?.lastName || ''}`.trim(),
      };
    });

    res.json({
      success: true,
      data: {
        news,
        achievements: achievementData,
        feedback,
        reviews,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/achievements', protect, ensureParent, async (req, res) => {
  try {
    const { childId, title, description, category, achievedAt } = req.body;
    if (!childId || !title) return res.status(400).json({ success: false, message: 'Child and title required' });

    const isLinked = req.user.parentProfile?.children?.some(c => c.childId?.toString() === childId);
    if (!isLinked) return res.status(403).json({ success: false, message: 'Child not linked' });

    const achievement = await Achievement.create({
      childId,
      title,
      description,
      category,
      achievedAt,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: achievement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
