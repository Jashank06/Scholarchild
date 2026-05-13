const express = require('express');
const router = express.Router();
const { School } = require('../models/School');
const Review = require('../models/Review');
const User = require('../models/User');
const { protect, parentOnly, institutionOnly, adminOnly, multiRole } = require('../middleware/auth');

// @GET /api/schools — List schools with filters
router.get('/', async (req, res) => {
  try {
    const { state, district, board, type, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (state) filter['address.state'] = new RegExp(state, 'i');
    if (district) filter['address.district'] = new RegExp(district, 'i');
    if (board) filter.board = board;
    if (type) filter.type = type;
    if (search) filter.name = new RegExp(search, 'i');

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await School.countDocuments(filter);
    const schools = await School.find(filter).sort({ 'ratings.overall': -1 }).skip(skip).limit(parseInt(limit));

    res.json({
      success: true,
      data: schools,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/schools/:id — School detail with reviews
router.get('/:id', async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) return res.status(404).json({ success: false, message: 'School not found' });

    const reviews = await Review.find({ schoolId: req.params.id, isApproved: true })
      .populate('userId', 'profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, data: { school, reviews } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/schools/:id/review — Parent submits a school review
router.post('/:id/review', protect, multiRole('parent', 'admin'), async (req, res) => {
  try {
    const { academics, infrastructure, faculty, extracurricular, safety, comment } = req.body;

    const school = await School.findById(req.params.id);
    if (!school) return res.status(404).json({ success: false, message: 'School not found' });

    const review = await Review.create({
      userId: req.user._id,
      schoolId: req.params.id,
      ratings: { academics, infrastructure, faculty, extracurricular, safety },
      comment,
    });

    // Update school aggregate ratings
    const allReviews = await Review.find({ schoolId: req.params.id, isApproved: true });
    const count = allReviews.length;
    const avg = (field) => allReviews.reduce((sum, r) => sum + r.ratings[field], 0) / count;

    school.ratings = {
      overall: parseFloat(avg('overall').toFixed(1)),
      academics: parseFloat(avg('academics').toFixed(1)),
      infrastructure: parseFloat(avg('infrastructure').toFixed(1)),
      faculty: parseFloat(avg('faculty').toFixed(1)),
      extracurricular: parseFloat(avg('extracurricular').toFixed(1)),
      totalReviews: count,
    };
    await school.save();

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this school' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/schools/user/reviews — Get user's submitted reviews
router.get('/user/reviews', protect, async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user._id })
      .populate('schoolId', 'name address board')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/schools — Create school (Admin or self-registration)
router.post('/', protect, async (req, res) => {
  try {
    const { name, board, type, address, contact, customFields } = req.body;
    const school = await School.create({
      name, board, type, address, contact,
      customFields: customFields || {},
      isVerified: req.user.role === 'admin',
      adminUsers: [req.user._id],
    });
    res.status(201).json({ success: true, data: school });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @PUT /api/schools/:id — Update school (school admin or admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) return res.status(404).json({ success: false, message: 'School not found' });

    // Check authorization
    const isSchoolAdmin = school.adminUsers.includes(req.user._id);
    if (!isSchoolAdmin && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this school' });
    }

    const { customFields, ...rest } = req.body;
    Object.assign(school, rest);
    if (customFields) {
      school.customFields = { ...(school.customFields || {}), ...customFields };
    }
    await school.save();
    res.json({ success: true, data: school });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @PUT /api/schools/:id/verify — Admin verifies a school
router.put('/:id/verify', protect, adminOnly, async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) return res.status(404).json({ success: false, message: 'School not found' });

    school.isVerified = true;
    await school.save();

    // Also approve the user account if linked
    if (school.adminUsers.length > 0) {
      await User.updateMany({ _id: { $in: school.adminUsers } }, { isApproved: true, 'institutionProfile.verificationStatus': 'approved' });
    }

    res.json({ success: true, message: 'School verified successfully', data: school });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
