const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const mongoose = require('mongoose');
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

    const { sort = 'recent', page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let sortQuery = { createdAt: -1 };
    if (sort === 'highest') sortQuery = { 'ratings.overall': -1 };
    if (sort === 'lowest') sortQuery = { 'ratings.overall': 1 };
    if (sort === 'helpful') sortQuery = { helpfulCount: -1 };

    const reviews = await Review.find({ schoolId: req.params.id, isApproved: true })
      .populate('userId', 'profile.firstName profile.lastName profile.avatar')
      .sort(sortQuery)
      .skip(skip)
      .limit(parseInt(limit));

    const totalReviews = await Review.countDocuments({ schoolId: req.params.id, isApproved: true });

    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { schoolId: new mongoose.Types.ObjectId(req.params.id), isApproved: true } },
      { $group: { _id: '$ratings.overall', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    res.json({ 
      success: true, 
      data: { 
        school, 
        reviews,
        totalReviews,
        ratingDistribution,
        pagination: {
          total: totalReviews,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(totalReviews / parseInt(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/schools/:id/reviews/:reviewId/helpful — Mark review as helpful
router.post('/:id/reviews/:reviewId/helpful', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.schoolId.toString() !== req.params.id) {
      return res.status(400).json({ success: false, message: 'Review does not belong to this school' });
    }

    const userId = req.user._id;
    const alreadyHelpful = review.helpfulBy.includes(userId);

    if (alreadyHelpful) {
      review.helpfulBy = review.helpfulBy.filter(id => id.toString() !== userId.toString());
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    } else {
      review.helpfulBy.push(userId);
      review.helpfulCount += 1;
    }
    await review.save();

    res.json({ success: true, helpfulCount: review.helpfulCount, marked: !alreadyHelpful });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/schools/:id/reviews/:reviewId/report — Report a review
router.post('/:id/reviews/:reviewId/report', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    review.reportCount += 1;
    await review.save();

    res.json({ success: true, message: 'Review reported. Thank you for your feedback.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/schools/:id/review — Parent or admin submits a school review
router.post('/:id/review', protect, multiRole('parent', 'admin'), async (req, res, next) => {
  try {
    console.log('=== Review Submit Debug ===');
    console.log('User:', req.user?._id, req.user?.role);
    console.log('Body:', req.body);
    
    const { 
      academics, infrastructure, faculty, extracurricular, safety, 
      communication, valueForMoney,
      title, comment, pros, cons, 
      visitDate, childGrade, reviewType 
    } = req.body;

    const school = await School.findById(req.params.id);
    if (!school) return res.status(404).json({ success: false, message: 'School not found' });

    // Check if user already reviewed this school
    const existingReview = await Review.findOne({ userId: req.user._id, schoolId: req.params.id });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this school. You can edit your existing review.' });
    }

    const reviewData = {
      userId: req.user._id,
      schoolId: req.params.id,
      ratings: { 
        academics: academics || 3, 
        infrastructure: infrastructure || 3, 
        faculty: faculty || 3, 
        extracurricular: extracurricular || 3, 
        safety: safety || 3,
        communication: communication || 3,
        valueForMoney: valueForMoney || 3,
      },
      title: title || '',
      comment: comment || '',
      pros: Array.isArray(pros) ? pros : (pros || []),
      cons: Array.isArray(cons) ? cons : (cons || []),
      visitDate: visitDate ? new Date(visitDate) : undefined,
      childGrade: childGrade,
      reviewType: reviewType || (req.user.role === 'admin' ? 'admin' : 'parent'),
      isVerified: req.user.role === 'admin',
    };

    console.log('Creating review with data:', JSON.stringify(reviewData, null, 2));
    const review = await Review.create(reviewData);
    console.log('Review created:', review._id);

    // Update school aggregate ratings
    const allReviews = await Review.find({ schoolId: req.params.id, isApproved: true });
    console.log('Total reviews after create:', allReviews.length);
    
    const count = allReviews.length;
    const avg = (field) => {
      if (count === 0) return 0;
      const total = allReviews.reduce((sum, r) => {
        const val = r.ratings && r.ratings[field];
        return sum + (typeof val === 'number' ? val : 0);
      }, 0);
      return total / count;
    };

    school.ratings = {
      overall: parseFloat(avg('overall').toFixed(1)),
      academics: parseFloat(avg('academics').toFixed(1)),
      infrastructure: parseFloat(avg('infrastructure').toFixed(1)),
      faculty: parseFloat(avg('faculty').toFixed(1)),
      extracurricular: parseFloat(avg('extracurricular').toFixed(1)),
      safety: parseFloat(avg('safety').toFixed(1)),
      communication: parseFloat(avg('communication').toFixed(1)),
      valueForMoney: parseFloat(avg('valueForMoney').toFixed(1)),
      totalReviews: count,
    };
    await school.save();
    console.log('School ratings updated');

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    console.error('Review submit error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this school' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// @PUT /api/schools/:id/review — Update existing review
router.put('/:id/review', protect, async (req, res) => {
  try {
    const review = await Review.findOne({ userId: req.user._id, schoolId: req.params.id });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    const { 
      academics, infrastructure, faculty, extracurricular, safety,
      communication, valueForMoney,
      title, comment, pros, cons, visitDate, childGrade 
    } = req.body;

    if (academics) review.ratings.academics = academics;
    if (infrastructure) review.ratings.infrastructure = infrastructure;
    if (faculty) review.ratings.faculty = faculty;
    if (extracurricular) review.ratings.extracurricular = extracurricular;
    if (safety) review.ratings.safety = safety;
    if (communication) review.ratings.communication = communication;
    if (valueForMoney) review.ratings.valueForMoney = valueForMoney;
    
    if (title !== undefined) review.title = title;
    if (comment !== undefined) review.comment = comment;
    if (pros) review.pros = pros;
    if (cons) review.cons = cons;
    if (visitDate) review.visitDate = new Date(visitDate);
    if (childGrade) review.childGrade = childGrade;

    await review.save();

    // Recalculate school ratings
    const school = await School.findById(req.params.id);
    const allReviews = await Review.find({ schoolId: req.params.id, isApproved: true });
    const count = allReviews.length;
    
    const avg = (field) => {
      const validReviews = allReviews.filter(r => r.ratings[field] != null);
      return validReviews.length > 0 
        ? validReviews.reduce((sum, r) => sum + r.ratings[field], 0) / validReviews.length 
        : 0;
    };

    school.ratings = {
      overall: parseFloat(avg('overall').toFixed(1)),
      academics: parseFloat(avg('academics').toFixed(1)),
      infrastructure: parseFloat(avg('infrastructure').toFixed(1)),
      faculty: parseFloat(avg('faculty').toFixed(1)),
      extracurricular: parseFloat(avg('extracurricular').toFixed(1)),
      safety: parseFloat(avg('safety').toFixed(1)),
      communication: parseFloat(avg('communication').toFixed(1)),
      valueForMoney: parseFloat(avg('valueForMoney').toFixed(1)),
      totalReviews: count,
    };
    await school.save();

    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @DELETE /api/schools/:id/review — Delete own review
router.delete('/:id/review', protect, async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ userId: req.user._id, schoolId: req.params.id });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    // Recalculate school ratings
    const school = await School.findById(req.params.id);
    const allReviews = await Review.find({ schoolId: req.params.id, isApproved: true });
    const count = allReviews.length;
    
    if (count === 0) {
      school.ratings = { overall: 0, academics: 0, infrastructure: 0, faculty: 0, extracurricular: 0, safety: 0, communication: 0, valueForMoney: 0, totalReviews: 0 };
    } else {
      const avg = (field) => {
        const validReviews = allReviews.filter(r => r.ratings[field] != null);
        return validReviews.length > 0 
          ? validReviews.reduce((sum, r) => sum + r.ratings[field], 0) / validReviews.length 
          : 0;
      };
      school.ratings = {
        overall: parseFloat(avg('overall').toFixed(1)),
        academics: parseFloat(avg('academics').toFixed(1)),
        infrastructure: parseFloat(avg('infrastructure').toFixed(1)),
        faculty: parseFloat(avg('faculty').toFixed(1)),
        extracurricular: parseFloat(avg('extracurricular').toFixed(1)),
        safety: parseFloat(avg('safety').toFixed(1)),
        communication: parseFloat(avg('communication').toFixed(1)),
        valueForMoney: parseFloat(avg('valueForMoney').toFixed(1)),
        totalReviews: count,
      };
    }
    await school.save();

    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
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
