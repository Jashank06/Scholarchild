const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const Opportunity = require('../models/Opportunity');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const upload = multer({ dest: path.join(__dirname, '../uploads/csv') });

// @POST /api/admin/bulk-upload — CSV bulk upload opportunities
router.post('/bulk-upload', protect, adminOnly, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No CSV file uploaded' });

    const results = [];
    const errors = [];
    let row = 0;

    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => {
          row++;
          try {
            const opp = {
              type: data.type || 'scholarship',
              title: data.title,
              description: data.description || data.title,
              shortDescription: data.short_description || '',
              organizer: { name: data.organizer, type: data.organizer_type || 'government', level: data.level || 'national' },
              category: data.category || 'academic',
              tags: data.tags ? data.tags.split(';') : [],
              eligibility: {
                grades: data.grades ? data.grades.split(';').map(Number) : [],
                categories: data.categories ? data.categories.split(';') : [],
                maxFamilyIncome: data.max_income ? parseInt(data.max_income) : undefined,
                minPercentage: data.min_percentage ? parseInt(data.min_percentage) : undefined,
                states: data.states ? data.states.split(';') : [],
              },
              rewards: { type: data.reward_type || 'cash', cashAmount: data.cash_amount ? parseInt(data.cash_amount) : 0, description: data.reward_description || '' },
              dates: { applicationDeadline: data.deadline ? new Date(data.deadline) : undefined },
              application: { mode: data.app_mode || 'external', externalLink: data.external_link || '', isFree: data.is_free !== 'false' },
              createdBy: req.user._id, isVerified: true, status: 'active',
            };
            if (opp.title) results.push(opp);
          } catch (e) { errors.push({ row, error: e.message }); }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    if (results.length > 0) {
      const inserted = await Opportunity.insertMany(results, { ordered: false });
      // Cleanup CSV file
      fs.unlinkSync(req.file.path);
      res.json({ success: true, message: `Imported ${inserted.length} opportunities`, imported: inserted.length, errors });
    } else {
      fs.unlinkSync(req.file.path);
      res.status(400).json({ success: false, message: 'No valid rows found', errors });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/admin/stats — Dashboard stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalParents = await User.countDocuments({ role: 'parent' });
    const totalSchools = await User.countDocuments({ role: { $in: ['school', 'university'] } });
    const totalOpportunities = await Opportunity.countDocuments({ status: 'active' });
    const totalScholarships = await Opportunity.countDocuments({ type: 'scholarship', status: 'active' });
    const totalCompetitions = await Opportunity.countDocuments({ type: 'competition', status: 'active' });
    const totalSchemes = await Opportunity.countDocuments({ type: 'scheme', status: 'active' });
    const Application = require('../models/Application');
    const totalApplications = await Application.countDocuments();

    res.json({
      success: true,
      stats: { totalUsers, totalStudents, totalParents, totalSchools, totalOpportunities, totalScholarships, totalCompetitions, totalSchemes, totalApplications },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/admin/users — List all users with filters
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const { role, search, page = 1, limit = 30 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { email: new RegExp(search, 'i') },
        { 'profile.firstName': new RegExp(search, 'i') },
        { 'profile.lastName': new RegExp(search, 'i') },
        { 'institutionProfile.institutionName': new RegExp(search, 'i') },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(filter);
    const users = await User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));

    res.json({
      success: true,
      data: users,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @PUT /api/admin/users/:id/role — Update user role
router.put('/users/:id/role', protect, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @PUT /api/admin/users/:id/approve — Approve/reject institution
router.put('/users/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const { approved } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isApproved = approved;
    if (user.institutionProfile) {
      user.institutionProfile.verificationStatus = approved ? 'approved' : 'rejected';
      if (approved) user.institutionProfile.verifiedAt = new Date();
    }
    await user.save();

    // Send notification
    const Notification = require('../models/Notification');
    await Notification.create({
      userId: user._id,
      type: 'system',
      title: approved ? 'Institution Approved! 🎉' : 'Verification Update',
      message: approved
        ? 'Your institution has been verified by VidyaPath admin. All features are now unlocked.'
        : 'Your institution verification was not approved. Please contact support.',
      icon: approved ? '✅' : '❌',
    });

    res.json({ success: true, message: `User ${approved ? 'approved' : 'rejected'}`, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/admin/notifications/broadcast — Send bulk notification
router.post('/notifications/broadcast', protect, adminOnly, async (req, res) => {
  try {
    const { title, message, targetRole, icon } = req.body;
    const Notification = require('../models/Notification');
    
    const filter = {};
    if (targetRole && targetRole !== 'all') filter.role = targetRole;
    const users = await User.find(filter).select('_id');

    const notifications = users.map(u => ({
      userId: u._id,
      type: 'system',
      title, message,
      icon: icon || '📢',
    }));

    await Notification.insertMany(notifications);

    res.json({ success: true, message: `Notification sent to ${users.length} users` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/admin/seed — Seed sample data
router.post('/seed', protect, adminOnly, async (req, res) => {
  try {
    const seedOpps = [
      {
        type: 'scholarship', title: 'National Merit Scholarship 2026', category: 'academic',
        description: 'A prestigious scholarship for top performing students in Grade 10 and 12.',
        organizer: { name: 'Ministry of Education', type: 'government', level: 'national' },
        eligibility: { grades: [10, 12], minPercentage: 85 },
        rewards: { type: 'cash', cashAmount: 50000, description: '₹50,000 annual grant' },
        dates: { applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
        tags: ['merit', 'national', 'central'], status: 'active', isVerified: true
      },
      {
        type: 'competition', title: 'Global Coding Challenge', category: 'coding',
        description: 'Showcase your coding skills on a global stage. Top 100 get internships.',
        organizer: { name: 'TechCorp International', type: 'corporate', level: 'international' },
        eligibility: { grades: [9, 10, 11, 12] },
        rewards: { type: 'prize', description: 'MacBook Pro + Internship' },
        dates: { applicationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) },
        tags: ['coding', 'tech', 'international'], status: 'active', isVerified: true
      },
      {
        type: 'scheme', title: 'Ujjwala Education Support', category: 'general',
        description: 'Financial aid for students from economically weaker sections.',
        organizer: { name: 'State Welfare Dept.', type: 'government', level: 'state' },
        eligibility: { maxFamilyIncome: 250000 },
        rewards: { type: 'cash', cashAmount: 25000, description: '₹25,000 per semester' },
        dates: { applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) },
        tags: ['ews', 'state', 'welfare'], status: 'active', isVerified: true
      }
    ];

    await Opportunity.insertMany(seedOpps);
    res.json({ success: true, message: 'Sample data seeded successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
