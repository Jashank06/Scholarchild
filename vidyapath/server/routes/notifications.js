const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');
const User = require('../models/User');

router.get('/', protect, async (req, res) => {
  try {
    const { unread } = req.query;
    const filter = { userId: req.user._id };
    if (unread === 'true') filter.isRead = false;
    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });
    res.json({ success: true, data: notifications, unreadCount });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/admin/push', protect, adminOnly, async (req, res) => {
  try {
    const { target, targetRole, targetId, title, message, type, link, icon } = req.body;
    let userIds = [];

    if (target === 'all') {
      const users = await User.find({}, '_id');
      userIds = users.map(u => u._id);
    } else if (target === 'role') {
      const users = await User.find({ role: targetRole }, '_id');
      userIds = users.map(u => u._id);
    } else if (target === 'single') {
      userIds = [targetId];
    }

    if (userIds.length === 0) return res.status(400).json({ success: false, message: 'No users found' });

    const notifications = userIds.map(uid => ({
      userId: uid, type, title, message, link, icon,
    }));

    await Notification.insertMany(notifications);
    res.json({ success: true, message: `Pushed to ${userIds.length} users` });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/:id/read', protect, async (req, res) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { isRead: true, readAt: new Date() });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
