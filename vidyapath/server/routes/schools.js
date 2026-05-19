const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { School } = require('../models/School');
const Review = require('../models/Review');
const User = require('../models/User');
const SchoolCategory = require('../models/SchoolCategory');
const SchoolField = require('../models/SchoolField');
const { sendSchoolUpdateRequest } = require('../aiAgent/notificationEngine');
const { protect, parentOnly, institutionOnly, adminOnly, multiRole } = require('../middleware/auth');

// @GET /api/schools — List schools with filters
router.get('/', async (req, res) => {
  try {
    const { state, district, city, board, type, search, udiseCode, lat, lng, radiusInKm = 10, hasComputerLab, hasLibrary, hasPlayground, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (state) filter['address.state'] = new RegExp(state, 'i');
    if (district) filter['address.district'] = new RegExp(district, 'i');
    if (city) filter['address.city'] = new RegExp(city, 'i');
    if (board) filter.board = board;
    if (type) filter.type = type;
    if (udiseCode) filter.udiseCode = udiseCode;
    if (search) filter.name = new RegExp(search, 'i');
    
    if (hasComputerLab === 'true') filter['facilities.hasComputerLab'] = true;
    if (hasLibrary === 'true') filter['facilities.hasLibrary'] = true;
    if (hasPlayground === 'true') filter['facilities.hasPlayground'] = true;

    // Geospatial search
    if (lat && lng) {
      filter.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseFloat(radiusInKm) * 1000 // Convert km to meters
        }
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await School.countDocuments(filter);
    
    // If doing geo-search, let MongoDB sort by distance automatically, else sort by ratings
    const query = School.find(filter);
    if (!lat || !lng) {
      query.sort({ 'ratings.overall': -1 });
    }
    
    const schools = await query.skip(skip).limit(parseInt(limit));

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
      let existing = {};
      if (school.customFields) {
        if (typeof school.customFields.toJSON === 'function') {
          existing = school.customFields.toJSON();
        } else if (school.customFields instanceof Map) {
          existing = Object.fromEntries(school.customFields);
        } else {
          existing = school.customFields;
        }
      }
      school.customFields = { ...existing, ...customFields };
      school.markModified('customFields');
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

// @POST /api/schools/send-update-requests — Admin triggers school email update requests
router.post('/send-update-requests', protect, adminOnly, async (req, res) => {
  try {
    const { schoolIds } = req.body;
    if (!schoolIds || !Array.isArray(schoolIds) || schoolIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide schoolIds array' });
    }

    const schools = await School.find({ _id: { $in: schoolIds } });
    if (schools.length === 0) {
      return res.status(404).json({ success: false, message: 'No matching schools found' });
    }

    const origin = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:3000';
    let sentCount = 0;
    let failedCount = 0;
    const errors = [];

    for (const school of schools) {
      const email = school.contact?.email;
      if (!email) {
        failedCount++;
        errors.push({ schoolId: school._id, name: school.name, error: 'No contact email defined' });
        continue;
      }

      // Generate secure token (valid for 7 days)
      const token = crypto.randomBytes(32).toString('hex');
      school.updateToken = token;
      school.updateTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      school.updateRequestStatus = 'sent';
      await school.save();

      const updateUrl = `${origin}/schools/update?token=${token}`;

      try {
        await sendSchoolUpdateRequest(email, school.name, updateUrl);
        sentCount++;
      } catch (err) {
        failedCount++;
        errors.push({ schoolId: school._id, name: school.name, error: err.message });
      }
    }

    res.json({
      success: true,
      message: `Requests processed: ${sentCount} sent successfully, ${failedCount} failed.`,
      sentCount,
      failedCount,
      errors
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/schools/public-profile/:token — Public view to fetch school details and configuration using token
router.get('/public-profile/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const school = await School.findOne({
      updateToken: token,
      updateTokenExpires: { $gt: new Date() }
    });

    if (!school) {
      return res.status(404).json({ success: false, message: 'Invalid or expired update link' });
    }

    // Update status to visited if it was 'sent'
    if (school.updateRequestStatus === 'sent') {
      school.updateRequestStatus = 'visited';
      await school.save();
    }

    // Fetch config categories and fields to build the dynamic form on the client
    const [categories, fields] = await Promise.all([
      SchoolCategory.find({}).sort({ order: 1, name: 1 }),
      SchoolField.find({}).sort({ order: 1, label: 1 })
    ]);

    res.json({
      success: true,
      data: {
        school: {
          _id: school._id,
          name: school.name,
          board: school.board,
          type: school.type,
          address: school.address,
          contact: school.contact,
          customFields: school.customFields,
          updateRequestStatus: school.updateRequestStatus
        },
        categories,
        fields
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/schools/public-profile/:token — Public update school details using token
router.post('/public-profile/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const school = await School.findOne({
      updateToken: token,
      updateTokenExpires: { $gt: new Date() }
    });

    if (!school) {
      return res.status(404).json({ success: false, message: 'Invalid or expired update link' });
    }

    const { board, type, address, contact, customFields } = req.body;

    if (board) school.board = board;
    if (type) school.type = type;
    if (address) {
      school.address = { ...(school.address || {}), ...address };
    }
    if (contact) {
      // If contact email is blank, don't overwrite with blank, fallback to existing or let schema handle it
      school.contact = { 
        email: contact.email?.trim() || school.contact?.email || 'contact@school.edu', 
        phone: contact.phone || '', 
        website: contact.website || '' 
      };
    }
    if (customFields) {
      let existing = {};
      if (school.customFields) {
        if (typeof school.customFields.toJSON === 'function') {
          existing = school.customFields.toJSON();
        } else if (school.customFields instanceof Map) {
          existing = Object.fromEntries(school.customFields);
        } else {
          existing = school.customFields;
        }
      }
      school.customFields = { ...existing, ...customFields };
      school.markModified('customFields');
    }

    school.updateRequestStatus = 'updated';
    // Clear token for one-time submission
    school.updateToken = undefined;
    school.updateTokenExpires = undefined;

    await school.save();

    res.json({ success: true, message: 'School profile updated successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
