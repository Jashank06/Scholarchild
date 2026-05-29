const express = require('express');
const router = express.Router();
const ServiceProvider = require('../models/ServiceProvider');
const { protect, adminOnly } = require('../middleware/auth');

// ─── Public Routes ───────────────────────────────────────────────────────────

// GET /api/service-providers — list active providers
router.get('/', async (req, res) => {
  try {
    const { category, city, featured, limit = 50 } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (city) filter.city = new RegExp(city, 'i');
    if (featured === 'true') filter.featured = true;

    const now = new Date();
    const dateFilter = {
      $or: [
        { startDate: { $exists: false } },
        { startDate: null },
        { startDate: { $lte: now } },
      ],
      $and: [
        {
          $or: [
            { endDate: { $exists: false } },
            { endDate: null },
            { endDate: { $gte: now } },
          ],
        },
      ],
    };
    Object.assign(filter, dateFilter);

    const providers = await ServiceProvider.find(filter)
      .sort({ featured: -1, order: 1, createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, data: providers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/service-providers/cities — list distinct cities
router.get('/cities', async (req, res) => {
  try {
    const cities = await ServiceProvider.distinct('city', { isActive: true, city: { $ne: '' } });
    res.json({ success: true, data: cities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/service-providers/:id/click — track click
router.post('/:id/click', async (req, res) => {
  try {
    const provider = await ServiceProvider.findByIdAndUpdate(
      req.params.id,
      { $inc: { clickCount: 1 } },
      { new: true }
    );
    if (!provider) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Admin Routes ────────────────────────────────────────────────────────────

// GET /api/service-providers/admin — all providers (admin)
router.get('/admin', protect, adminOnly, async (req, res) => {
  try {
    const { category, isActive, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await ServiceProvider.countDocuments(filter);
    const providers = await ServiceProvider.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: providers,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/service-providers/admin — create provider
router.post('/admin', protect, adminOnly, async (req, res) => {
  try {
    const provider = await ServiceProvider.create(req.body);
    res.status(201).json({ success: true, data: provider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/service-providers/admin/:id — get single provider
router.get('/admin/:id', protect, adminOnly, async (req, res) => {
  try {
    const provider = await ServiceProvider.findById(req.params.id);
    if (!provider) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: provider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/service-providers/admin/:id — update provider
router.put('/admin/:id', protect, adminOnly, async (req, res) => {
  try {
    const provider = await ServiceProvider.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!provider) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: provider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/service-providers/admin/:id — delete provider
router.delete('/admin/:id', protect, adminOnly, async (req, res) => {
  try {
    const provider = await ServiceProvider.findByIdAndDelete(req.params.id);
    if (!provider) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/service-providers/admin/:id/toggle — toggle active/featured
router.patch('/admin/:id/toggle', protect, adminOnly, async (req, res) => {
  try {
    const { isActive, featured } = req.body;
    const update = {};
    if (isActive !== undefined) update.isActive = isActive;
    if (featured !== undefined) update.featured = featured;
    const provider = await ServiceProvider.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!provider) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: provider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
