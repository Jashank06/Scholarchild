const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Opportunity = require('../models/Opportunity');
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');
const { awardXP, awardBadge } = require('../utils/gamification');
const { calculateMatchScore } = require('../utils/recommendation');

// @POST /api/applications — Apply to an opportunity
router.post('/', protect, async (req, res) => {
  try {
    const { opportunityId, formData, documents } = req.body;

    // Check if already applied
    const existing = await Application.findOne({ userId: req.user._id, opportunityId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already applied to this opportunity' });
    }

    // Check deadline
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found' });
    if (opportunity.dates.applicationDeadline && new Date() > opportunity.dates.applicationDeadline) {
      return res.status(400).json({ success: false, message: 'Application deadline has passed' });
    }

    // Calculate match score
    const matchScore = calculateMatchScore(req.user, opportunity);

    // Create application
    const application = await Application.create({
      userId: req.user._id,
      opportunityId,
      formData,
      documents,
      matchScore,
      timeline: [{ status: 'applied', date: new Date(), note: 'Application submitted successfully' }],
    });

    // Update opportunity stats
    opportunity.stats.totalApplications += 1;
    await opportunity.save();

    // Award XP and check badges
    await awardXP(req.user, 25, 'Applied to an opportunity');

    const appCount = await Application.countDocuments({ userId: req.user._id });
    if (appCount === 1) await awardBadge(req.user, 'FIRST_APP');
    if (appCount === 5) await awardBadge(req.user, 'FIVE_APPS');
    if (appCount === 10) await awardBadge(req.user, 'TEN_APPS');

    // Create notification
    await Notification.create({
      userId: req.user._id,
      type: 'status_update',
      title: 'Application Submitted! 🎉',
      message: `Your application for "${opportunity.title}" has been submitted successfully.`,
      link: `/dashboard/applications`,
      icon: '📝',
    });

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/applications/track-external — Track external link clicks
router.post('/track-external', protect, async (req, res) => {
  try {
    const { opportunityId } = req.body;

    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found' });

    let application = await Application.findOne({ userId: req.user._id, opportunityId });
    if (!application) {
      application = await Application.create({
        userId: req.user._id,
        opportunityId,
        status: 'applied',
        isExternalRedirect: true,
        matchScore: calculateMatchScore(req.user, opportunity),
        timeline: [{ status: 'applied', date: new Date(), note: 'Redirected to external application portal' }],
      });

      // Update opportunity stats
      opportunity.stats.totalApplications += 1;
      await opportunity.save();

      // Notification
      await Notification.create({
        userId: req.user._id,
        type: 'status_update',
        title: 'Redirected Successfully 🔗',
        message: `We've tracked your interest in "${opportunity.title}". Remember to complete the application on their portal!`,
        link: `/dashboard/applications`,
        icon: '🔗',
      });
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/applications — Get user's applications
router.get('/', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { userId: req.user._id };
    if (status && status !== 'all') filter.status = status;

    const total = await Application.countDocuments(filter);
    const applications = await Application.find(filter)
      .populate('opportunityId', 'title type organizer dates rewards application url')
      .sort({ appliedAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    // Count by status
    const statusCounts = await Application.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: applications,
      statusCounts: statusCounts.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/applications/:id — Single application
router.get('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('opportunityId')
      .populate('documents.documentId');

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    if (application.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @PUT /api/applications/:id/status — Update status (Admin)
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, note } = req.body;
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ success: false, message: 'Not found' });

    application.status = status;
    application.timeline.push({ status, date: new Date(), note, updatedBy: 'admin' });
    await application.save();

    // Notify user
    const opportunity = await Opportunity.findById(application.opportunityId);
    await Notification.create({
      userId: application.userId,
      type: 'status_update',
      title: `Application ${status === 'approved' ? 'Approved! 🎉' : status === 'rejected' ? 'Update' : 'Status Updated'}`,
      message: `Your application for "${opportunity?.title}" has been updated to: ${status}`,
      link: `/dashboard/applications`,
      icon: status === 'approved' ? '✅' : status === 'rejected' ? '❌' : '📋',
    });

    // Award badge for first win
    if (status === 'approved') {
      const user = await require('../models/User').findById(application.userId);
      await awardBadge(user, 'FIRST_WIN');
      await awardXP(user, 100, 'Application approved');
    }

    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
