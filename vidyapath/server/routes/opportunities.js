const express = require('express');
const router = express.Router();
const Opportunity = require('../models/Opportunity');
const { Bookmark } = require('../models/School');
const { protect, adminOnly } = require('../middleware/auth');
const { calculateMatchScore, getRecommendations } = require('../utils/recommendation');

// @GET /api/opportunities — List with filters
router.get('/', async (req, res) => {
  try {
    const { type, category, grade, state, search, status, sort, page = 1, limit = 20, free, gender, categories, maxIncome, organizerType, level, mode, rewardType, deadline } = req.query;
    const filter = { status: status || 'active' };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (grade) filter['eligibility.grades'] = parseInt(grade);
    if (state) filter.$or = [{ 'eligibility.states': state }, { 'eligibility.states': { $size: 0 } }];
    if (free === 'true') filter['application.isFree'] = true;
    if (search) filter.$text = { $search: search };
    if (gender && gender !== 'all') filter['eligibility.gender'] = gender;
    if (categories) filter['eligibility.categories'] = { $in: categories.split(',') };
    if (maxIncome) filter['eligibility.maxFamilyIncome'] = { $lte: parseInt(maxIncome) };
    if (organizerType) filter['organizer.type'] = organizerType;
    if (level) filter['organizer.level'] = level;
    if (mode) filter['application.mode'] = mode;
    if (rewardType) filter['rewards.type'] = rewardType;
    if (deadline === 'urgent') {
      filter['dates.applicationDeadline'] = {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };
    } else if (deadline === 'upcoming') {
      filter['dates.applicationDeadline'] = { $gte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) };
    }

    let sortObj = { 'dates.applicationDeadline': 1 };
    if (sort === 'newest') sortObj = { createdAt: -1 };
    if (sort === 'deadline') sortObj = { 'dates.applicationDeadline': 1 };
    if (sort === 'popular') sortObj = { 'stats.totalApplications': -1 };
    if (sort === 'reward') sortObj = { 'rewards.cashAmount': -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Opportunity.countDocuments(filter);
    const opportunities = await Opportunity.find(filter).sort(sortObj).skip(skip).limit(parseInt(limit));

    // Calculate match scores if user is authenticated
    let results = opportunities;
    if (req.user) {
      results = opportunities.map(opp => ({
        ...opp.toObject(),
        matchScore: calculateMatchScore(req.user, opp),
      }));
      if (sort === 'match') {
        results.sort((a, b) => b.matchScore - a.matchScore);
      }
    }

    res.json({
      success: true,
      data: results,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/opportunities/recommendations — AI-powered recommendations
router.get('/recommendations', protect, async (req, res) => {
  try {
    const opportunities = await Opportunity.find({ status: 'active', 'dates.applicationDeadline': { $gte: new Date() } });
    const recommendations = await getRecommendations(req.user, opportunities, parseInt(req.query.limit) || 20);
    res.json({ success: true, data: recommendations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/opportunities/:id — Single opportunity
router.get('/:id', async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found' });

    opportunity.stats.totalViews += 1;
    await opportunity.save();

    let result = opportunity.toObject();
    if (req.user) {
      result.matchScore = calculateMatchScore(req.user, opportunity);
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/opportunities — Create (Admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    req.body.createdBy = req.user._id;
    const opportunity = await Opportunity.create(req.body);
    res.status(201).json({ success: true, data: opportunity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @PUT /api/opportunities/:id — Update (Admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const opportunity = await Opportunity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!opportunity) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: opportunity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @DELETE /api/opportunities/:id — Delete (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const opportunity = await Opportunity.findByIdAndDelete(req.params.id);
    if (!opportunity) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/opportunities/:id/bookmark — Toggle bookmark
router.post('/:id/bookmark', protect, async (req, res) => {
  try {
    const existing = await Bookmark.findOne({ userId: req.user._id, opportunityId: req.params.id });
    if (existing) {
      await Bookmark.deleteOne({ _id: existing._id });
      await Opportunity.findByIdAndUpdate(req.params.id, { $inc: { 'stats.bookmarkCount': -1 } });
      res.json({ success: true, bookmarked: false });
    } else {
      await Bookmark.create({ userId: req.user._id, opportunityId: req.params.id });
      await Opportunity.findByIdAndUpdate(req.params.id, { $inc: { 'stats.bookmarkCount': 1 } });
      res.json({ success: true, bookmarked: true });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/opportunities/user/bookmarks — Get user bookmarks
router.get('/user/bookmarks', protect, async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user._id }).populate('opportunityId');
    res.json({ success: true, data: bookmarks.map(b => b.opportunityId) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
