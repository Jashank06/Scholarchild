const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const EventReview = require('../models/EventReview');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const ActivityLog = require('../models/ActivityLog');

// @GET /api/events — List events with filters
router.get('/', async (req, res) => {
  try {
    const { state, city, category, status, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (state) filter['venue.state'] = new RegExp(state, 'i');
    if (city) filter['venue.city'] = new RegExp(city, 'i');
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) filter.name = new RegExp(search, 'i');

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Event.countDocuments(filter);
    const events = await Event.find(filter)
      .sort({ eventDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ success: true, data: events, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/events/user/reviews — Get logged-in user's reviews
router.get('/user/reviews', protect, async (req, res) => {
  try {
    const reviews = await EventReview.find({ userId: req.user._id })
      .populate('eventId', 'name category venue')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/events/:id/history — Get activity history
router.get('/:id/history', async (req, res) => {
  try {
    const logs = await ActivityLog.find({ entityType: 'event', entityId: req.params.id })
      .populate('userId', 'profile role')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/events/:id — Get event detail with reviews
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const reviews = await EventReview.find({ eventId: req.params.id, isApproved: true })
      .populate('userId', 'profile role')
      .sort({ createdAt: -1 });

    const ratingDistribution = await EventReview.aggregate([
      { $match: { eventId: event._id, isApproved: true } },
      { $group: { _id: null, avgOverall: { $avg: '$ratings.overall' }, count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      event,
      reviews,
      totalReviews: reviews.length,
      ratingDistribution: ratingDistribution[0] || { avgOverall: 0, count: 0 },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/events — Create event (any authenticated user)
router.post('/', protect, async (req, res) => {
  try {
    const { name, category, description, eventDate, registrationDeadline, venue, organizer, eligibility, prizes, fees } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Event name is required' });
    }
    if (!venue || (!venue.city && !venue.state)) {
      return res.status(400).json({ success: false, message: 'At least city or state is required for location' });
    }
    if (!category) {
      return res.status(400).json({ success: false, message: 'Event category is required' });
    }

    const event = await Event.create({
      name: name.trim(), category, description, eventDate, registrationDeadline,
      venue, organizer, eligibility, prizes, fees: fees || 0,
      isVerified: req.user.role === 'admin',
      adminUsers: [req.user._id],
      createdBy: req.user._id,
    });
    await ActivityLog.create({
      entityType: 'event', entityId: event._id, action: 'created',
      userId: req.user._id,
      changes: { name, category, description, venue, organizer, eligibility, prizes, fees: fees || 0 },
    });
    res.status(201).json({ success: true, data: event });
    require('../aiAgent/entityEnricher').checkAndEnrich().catch(() => {});
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @PUT /api/events/:id — Update event (any authenticated user)
router.put('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const { customFields, ...rest } = req.body;
    const oldValues = {
      name: event.name, category: event.category, description: event.description,
      eventDate: event.eventDate, registrationDeadline: event.registrationDeadline,
      'venue.city': event.venue?.city, 'venue.state': event.venue?.state, 'venue.fullAddress': event.venue?.fullAddress,
      'organizer.name': event.organizer?.name, 'organizer.contact': event.organizer?.contact, 'organizer.website': event.organizer?.website,
      eligibility: event.eligibility, prizes: event.prizes, fees: event.fees, status: event.status,
    };
    Object.assign(event, rest);
    event.updatedBy = req.user._id;
    if (customFields) {
      let existing = {};
      if (event.customFields) {
        if (typeof event.customFields.toJSON === 'function') {
          existing = event.customFields.toJSON();
        } else if (event.customFields instanceof Map) {
          existing = Object.fromEntries(event.customFields);
        } else {
          existing = event.customFields;
        }
      }
      event.customFields = { ...existing, ...customFields };
      event.markModified('customFields');
    }
    await event.save();

    const changes = {};
    const newValues = {
      name: event.name, category: event.category, description: event.description,
      eventDate: event.eventDate, registrationDeadline: event.registrationDeadline,
      'venue.city': event.venue?.city, 'venue.state': event.venue?.state, 'venue.fullAddress': event.venue?.fullAddress,
      'organizer.name': event.organizer?.name, 'organizer.contact': event.organizer?.contact, 'organizer.website': event.organizer?.website,
      eligibility: event.eligibility, prizes: event.prizes, fees: event.fees, status: event.status,
    };
    for (const key of Object.keys(oldValues)) {
      if (JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])) {
        changes[key] = { from: oldValues[key], to: newValues[key] };
      }
    }
    if (Object.keys(changes).length > 0) {
      await ActivityLog.create({
        entityType: 'event', entityId: event._id, action: 'updated',
        userId: req.user._id, changes,
      });
    }

    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @DELETE /api/events/:id — Delete event (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @PUT /api/events/:id/verify — Admin verifies an event
router.put('/:id/verify', protect, adminOnly, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    event.isVerified = true;
    await event.save();

    if (event.adminUsers.length > 0) {
      await User.updateMany({ _id: { $in: event.adminUsers } }, { isApproved: true });
    }

    res.json({ success: true, message: 'Event verified successfully', data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/events/:id/review — Submit a review
router.post('/:id/review', protect, async (req, res, next) => {
  if (!['parent', 'admin', 'student'].includes(req.user?.role)) {
    return res.status(403).json({ success: false, message: 'Access restricted to: parent, admin, student' });
  }
  next();
}, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const existing = await EventReview.findOne({ userId: req.user._id, eventId: req.params.id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this event' });
    }

    const { ratings, title, comment, pros, cons } = req.body;
    const review = await EventReview.create({
      userId: req.user._id,
      eventId: req.params.id,
      ratings, title, comment, pros, cons,
      reviewType: req.user.role === 'admin' ? 'admin' : req.user.role === 'parent' ? 'parent' : 'participant',
    });

    const allReviews = await EventReview.find({ eventId: req.params.id, isApproved: true });
    const avgRatings = {};
    const ratingKeys = ['experience', 'organization', 'value', 'engagement'];
    ratingKeys.forEach(key => {
      const sum = allReviews.reduce((acc, r) => acc + (r.ratings?.[key] || 0), 0);
      avgRatings[key] = allReviews.length > 0 ? Math.round((sum / allReviews.length) * 10) / 10 : 0;
    });
    avgRatings.overall = Math.round((ratingKeys.reduce((acc, k) => acc + avgRatings[k], 0) / ratingKeys.length) * 10) / 10;
    avgRatings.totalReviews = allReviews.length;

    await Event.findByIdAndUpdate(req.params.id, { ratings: avgRatings });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @PUT /api/events/:id/review — Update own review
router.put('/:id/review', protect, async (req, res) => {
  try {
    const review = await EventReview.findOne({ userId: req.user._id, eventId: req.params.id });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    const { ratings, title, comment, pros, cons } = req.body;
    if (ratings) review.ratings = { ...review.ratings.toJSON?.() || review.ratings, ...ratings };
    if (title !== undefined) review.title = title;
    if (comment !== undefined) review.comment = comment;
    if (pros !== undefined) review.pros = pros;
    if (cons !== undefined) review.cons = cons;
    await review.save();

    const allReviews = await EventReview.find({ eventId: req.params.id, isApproved: true });
    const avgRatings = {};
    const ratingKeys = ['experience', 'organization', 'value', 'engagement'];
    ratingKeys.forEach(key => {
      const sum = allReviews.reduce((acc, r) => acc + (r.ratings?.[key] || 0), 0);
      avgRatings[key] = allReviews.length > 0 ? Math.round((sum / allReviews.length) * 10) / 10 : 0;
    });
    avgRatings.overall = Math.round((ratingKeys.reduce((acc, k) => acc + avgRatings[k], 0) / ratingKeys.length) * 10) / 10;
    avgRatings.totalReviews = allReviews.length;

    await Event.findByIdAndUpdate(req.params.id, { ratings: avgRatings });

    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @DELETE /api/events/:id/review — Delete own review
router.delete('/:id/review', protect, async (req, res) => {
  try {
    const review = await EventReview.findOneAndDelete({ userId: req.user._id, eventId: req.params.id });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    const allReviews = await EventReview.find({ eventId: req.params.id, isApproved: true });
    const avgRatings = {};
    const ratingKeys = ['experience', 'organization', 'value', 'engagement'];
    ratingKeys.forEach(key => {
      const sum = allReviews.reduce((acc, r) => acc + (r.ratings?.[key] || 0), 0);
      avgRatings[key] = allReviews.length > 0 ? Math.round((sum / allReviews.length) * 10) / 10 : 0;
    });
    avgRatings.overall = Math.round((ratingKeys.reduce((acc, k) => acc + avgRatings[k], 0) / ratingKeys.length) * 10) / 10;
    avgRatings.totalReviews = allReviews.length;

    await Event.findByIdAndUpdate(req.params.id, { ratings: avgRatings });

    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/events/:id/reviews/:reviewId/helpful — Toggle helpful
router.post('/:id/reviews/:reviewId/helpful', protect, async (req, res) => {
  try {
    const review = await EventReview.findById(req.params.reviewId);
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
