const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Application = require('../models/Application');
const { protect, multiRole } = require('../middleware/auth');

// @GET /api/institution/analytics — Get dashboard metrics for institutions
router.get('/analytics', protect, multiRole('school', 'university', 'admin'), async (req, res) => {
  try {
    const institutionId = req.user._id;
    
    // 1. Get managed students
    const user = await User.findById(institutionId);
    const managedStudentIds = user.institutionProfile?.managedStudents || [];
    
    // 2. Fetch stats
    const totalStudents = managedStudentIds.length;
    
    const applications = await Application.find({ userId: { $in: managedStudentIds } });
    const totalApplications = applications.length;
    const successfulApplications = applications.filter(app => app.status === 'selected').length;
    
    // 3. Calculate total aid (mock calculation for now, in real app we'd sum rewards)
    // We'll search for 'selected' applications and sum their opportunity rewards
    const successApps = await Application.find({ 
      userId: { $in: managedStudentIds }, 
      status: 'selected' 
    }).populate('opportunity');
    
    const totalAid = successApps.reduce((sum, app) => sum + (app.opportunity?.rewards?.cashAmount || 0), 0);
    
    // 4. Recent activity
    const recentActivity = await Application.find({ userId: { $in: managedStudentIds } })
      .populate('userId', 'profile.firstName profile.lastName')
      .populate('opportunity', 'title rewards')
      .sort({ updatedAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalApplications,
        successfulApplications,
        totalAid,
        successRate: totalApplications > 0 ? Math.round((successfulApplications / totalApplications) * 100) : 0
      },
      recentActivity: recentActivity.map(app => ({
        name: `${app.userId?.profile?.firstName} ${app.userId?.profile?.lastName}`,
        award: app.opportunity?.title,
        date: new Date(app.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: app.status.charAt(0).toUpperCase() + app.status.slice(1).replace('_', ' '),
        impact: app.status === 'selected' ? `₹${app.opportunity?.rewards?.cashAmount?.toLocaleString() || 0}` : '—'
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
