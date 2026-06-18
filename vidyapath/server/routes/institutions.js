const express = require('express');
const router = express.Router();
const Institution = require('../models/Institution');
const InstitutionReview = require('../models/InstitutionReview');
const User = require('../models/User');
const { protect, adminOnly, multiRole } = require('../middleware/auth');
const ActivityLog = require('../models/ActivityLog');

// @GET /api/institutions — List institutions with filters
router.get('/', async (req, res) => {
  try {
    const { state, city, type, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (state) filter['address.state'] = new RegExp(state, 'i');
    if (city) filter['address.city'] = new RegExp(city, 'i');
    if (type) filter.type = type;
    if (search) filter.name = new RegExp(search, 'i');

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Institution.countDocuments(filter);
    const institutions = await Institution.find(filter)
      .sort({ 'ratings.overall': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ success: true, data: institutions, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/institutions/user/reviews — Get logged-in user's reviews
router.get('/user/reviews', protect, async (req, res) => {
  try {
    const reviews = await InstitutionReview.find({ userId: req.user._id })
      .populate('institutionId', 'name type address ratings')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/institutions/:id/history — Get activity history
router.get('/:id/history', async (req, res) => {
  try {
    const logs = await ActivityLog.find({ entityType: 'institution', entityId: req.params.id })
      .populate('userId', 'profile role')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/institutions/:id — Get institution detail with reviews
router.get('/:id', async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);
    if (!institution) return res.status(404).json({ success: false, message: 'Institution not found' });

    const reviews = await InstitutionReview.find({ institutionId: req.params.id, isApproved: true })
      .populate('userId', 'profile role')
      .sort({ createdAt: -1 });

    const ratingDistribution = await InstitutionReview.aggregate([
      { $match: { institutionId: institution._id, isApproved: true } },
      { $group: { _id: null, avgOverall: { $avg: '$ratings.overall' }, count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      institution,
      reviews,
      totalReviews: reviews.length,
      ratingDistribution: ratingDistribution[0] || { avgOverall: 0, count: 0 },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/institutions — Create institution (any authenticated user)
router.post('/', protect, async (req, res) => {
  try {
    const { name, type, address, contact, courses, affiliation } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Institution name is required' });
    }
    if (!address || (!address.city && !address.state)) {
      return res.status(400).json({ success: false, message: 'At least city or state is required for location' });
    }
    if (!type) {
      return res.status(400).json({ success: false, message: 'Institution type is required (ITI, Diploma, College, University)' });
    }

    const institution = await Institution.create({
      name: name.trim(), type, affiliation, address, contact,
      courses: courses || [],
      isVerified: req.user.role === 'admin',
      adminUsers: [req.user._id],
      createdBy: req.user._id,
    });
    await ActivityLog.create({
      entityType: 'institution', entityId: institution._id, action: 'created',
      userId: req.user._id,
      changes: { name, type, affiliation, address, contact },
    });
    res.status(201).json({ success: true, data: institution });
    require('../aiAgent/entityEnricher').checkAndEnrich().catch(() => {});
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @PUT /api/institutions/:id — Update institution (any authenticated user)
router.put('/:id', protect, async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);
    if (!institution) return res.status(404).json({ success: false, message: 'Institution not found' });

    const { customFields, ...rest } = req.body;
    const oldValues = {
      name: institution.name, type: institution.type, affiliation: institution.affiliation,
      'address.city': institution.address?.city, 'address.state': institution.address?.state,
      'address.district': institution.address?.district, 'address.pincode': institution.address?.pincode,
      'contact.email': institution.contact?.email, 'contact.phone': institution.contact?.phone, 'contact.website': institution.contact?.website,
    };
    Object.assign(institution, rest);
    institution.updatedBy = req.user._id;
    if (customFields) {
      let existing = {};
      if (institution.customFields) {
        if (typeof institution.customFields.toJSON === 'function') {
          existing = institution.customFields.toJSON();
        } else if (institution.customFields instanceof Map) {
          existing = Object.fromEntries(institution.customFields);
        } else {
          existing = institution.customFields;
        }
      }
      institution.customFields = { ...existing, ...customFields };
      institution.markModified('customFields');
    }
    await institution.save();

    const changes = {};
    const newValues = {
      name: institution.name, type: institution.type, affiliation: institution.affiliation,
      'address.city': institution.address?.city, 'address.state': institution.address?.state,
      'address.district': institution.address?.district, 'address.pincode': institution.address?.pincode,
      'contact.email': institution.contact?.email, 'contact.phone': institution.contact?.phone, 'contact.website': institution.contact?.website,
    };
    for (const key of Object.keys(oldValues)) {
      if (JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])) {
        changes[key] = { from: oldValues[key], to: newValues[key] };
      }
    }
    if (Object.keys(changes).length > 0) {
      await ActivityLog.create({
        entityType: 'institution', entityId: institution._id, action: 'updated',
        userId: req.user._id, changes,
      });
    }

    res.json({ success: true, data: institution });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @DELETE /api/institutions/:id — Delete institution (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);
    if (!institution) return res.status(404).json({ success: false, message: 'Institution not found' });
    await Institution.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Institution deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @PUT /api/institutions/:id/verify — Admin verifies an institution
router.put('/:id/verify', protect, adminOnly, async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);
    if (!institution) return res.status(404).json({ success: false, message: 'Institution not found' });

    institution.isVerified = true;
    await institution.save();

    if (institution.adminUsers.length > 0) {
      await User.updateMany({ _id: { $in: institution.adminUsers } }, { isApproved: true });
    }

    res.json({ success: true, message: 'Institution verified successfully', data: institution });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/institutions/:id/review — Submit a review
router.post('/:id/review', protect, async (req, res, next) => {
  if (!['parent', 'admin', 'student'].includes(req.user?.role)) {
    return res.status(403).json({ success: false, message: 'Access restricted to: parent, admin, student' });
  }
  next();
}, async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);
    if (!institution) return res.status(404).json({ success: false, message: 'Institution not found' });

    const existing = await InstitutionReview.findOne({ userId: req.user._id, institutionId: req.params.id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this institution' });
    }

    const { ratings, title, comment, pros, cons, visitDate, courseName } = req.body;
    const review = await InstitutionReview.create({
      userId: req.user._id,
      institutionId: req.params.id,
      ratings, title, comment, pros, cons, visitDate, courseName,
      reviewType: req.user.role === 'admin' ? 'admin' : req.user.role === 'parent' ? 'parent' : 'student',
    });

    const allReviews = await InstitutionReview.find({ institutionId: req.params.id, isApproved: true });
    const avgRatings = {};
    const ratingKeys = ['academics', 'infrastructure', 'faculty', 'placements', 'campus', 'valueForMoney'];
    ratingKeys.forEach(key => {
      const sum = allReviews.reduce((acc, r) => acc + (r.ratings?.[key] || 0), 0);
      avgRatings[key] = allReviews.length > 0 ? Math.round((sum / allReviews.length) * 10) / 10 : 0;
    });
    avgRatings.overall = Math.round((ratingKeys.reduce((acc, k) => acc + avgRatings[k], 0) / ratingKeys.length) * 10) / 10;
    avgRatings.totalReviews = allReviews.length;

    await Institution.findByIdAndUpdate(req.params.id, { ratings: avgRatings });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @PUT /api/institutions/:id/review — Update own review
router.put('/:id/review', protect, async (req, res) => {
  try {
    const review = await InstitutionReview.findOne({ userId: req.user._id, institutionId: req.params.id });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    const { ratings, title, comment, pros, cons, visitDate, courseName } = req.body;
    if (ratings) review.ratings = { ...review.ratings.toJSON?.() || review.ratings, ...ratings };
    if (title !== undefined) review.title = title;
    if (comment !== undefined) review.comment = comment;
    if (pros !== undefined) review.pros = pros;
    if (cons !== undefined) review.cons = cons;
    if (visitDate !== undefined) review.visitDate = visitDate;
    if (courseName !== undefined) review.courseName = courseName;
    await review.save();

    const allReviews = await InstitutionReview.find({ institutionId: req.params.id, isApproved: true });
    const avgRatings = {};
    const ratingKeys = ['academics', 'infrastructure', 'faculty', 'placements', 'campus', 'valueForMoney'];
    ratingKeys.forEach(key => {
      const sum = allReviews.reduce((acc, r) => acc + (r.ratings?.[key] || 0), 0);
      avgRatings[key] = allReviews.length > 0 ? Math.round((sum / allReviews.length) * 10) / 10 : 0;
    });
    avgRatings.overall = Math.round((ratingKeys.reduce((acc, k) => acc + avgRatings[k], 0) / ratingKeys.length) * 10) / 10;
    avgRatings.totalReviews = allReviews.length;

    await Institution.findByIdAndUpdate(req.params.id, { ratings: avgRatings });

    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @DELETE /api/institutions/:id/review — Delete own review
router.delete('/:id/review', protect, async (req, res) => {
  try {
    const review = await InstitutionReview.findOneAndDelete({ userId: req.user._id, institutionId: req.params.id });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    const allReviews = await InstitutionReview.find({ institutionId: req.params.id, isApproved: true });
    const avgRatings = {};
    const ratingKeys = ['academics', 'infrastructure', 'faculty', 'placements', 'campus', 'valueForMoney'];
    ratingKeys.forEach(key => {
      const sum = allReviews.reduce((acc, r) => acc + (r.ratings?.[key] || 0), 0);
      avgRatings[key] = allReviews.length > 0 ? Math.round((sum / allReviews.length) * 10) / 10 : 0;
    });
    avgRatings.overall = Math.round((ratingKeys.reduce((acc, k) => acc + avgRatings[k], 0) / ratingKeys.length) * 10) / 10;
    avgRatings.totalReviews = allReviews.length;

    await Institution.findByIdAndUpdate(req.params.id, { ratings: avgRatings });

    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/institutions/:id/reviews/:reviewId/helpful — Toggle helpful
router.post('/:id/reviews/:reviewId/helpful', protect, async (req, res) => {
  try {
    const review = await InstitutionReview.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    const idx = review.helpfulBy.indexOf(req.user._id);
    if (idx > -1) {
      review.helpfulBy.splice(idx, 1);
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    } else {
      review.helpfulBy.push(req.user._id);
      review.helpfulCount += 1;
    }
    await review.save();
    res.json({ success: true, helpfulCount: review.helpfulCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
