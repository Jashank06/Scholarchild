const express = require('express');
const router = express.Router();
const Notable = require('../models/Notable');
const { protect, adminOnly } = require('../middleware/auth');

// ─── Public Routes ───────────────────────────────────────────────────────────

// GET /api/notables — list active notables
router.get('/', async (req, res) => {
  try {
    const { category, featured, limit = 50 } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (featured === 'true') filter.featured = true;

    // Date filter — only show items within their date range
    const now = new Date();
    filter.$or = [
      { startDate: { $exists: false } },
      { startDate: null },
      { startDate: { $lte: now } },
    ];
    filter.$and = [
      {
        $or: [
          { endDate: { $exists: false } },
          { endDate: null },
          { endDate: { $gte: now } },
        ],
      },
    ];

    const notables = await Notable.find(filter)
      .sort({ featured: -1, order: 1, createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, data: notables });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/notables/categories — list distinct categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Notable.distinct('category', { isActive: true });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/notables/:id/click — track click
router.post('/:id/click', async (req, res) => {
  try {
    const notable = await Notable.findByIdAndUpdate(
      req.params.id,
      { $inc: { clickCount: 1 } },
      { new: true }
    );
    if (!notable) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Admin Routes ────────────────────────────────────────────────────────────

// GET /api/notables/admin — all notables (admin)
router.get('/admin', protect, adminOnly, async (req, res) => {
  try {
    const { category, isActive, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Notable.countDocuments(filter);
    const notables = await Notable.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: notables,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/notables/admin — create notable
router.post('/admin', protect, adminOnly, async (req, res) => {
  try {
    const notable = await Notable.create(req.body);
    res.status(201).json({ success: true, data: notable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/notables/admin/:id — get single notable
router.get('/admin/:id', protect, adminOnly, async (req, res) => {
  try {
    const notable = await Notable.findById(req.params.id);
    if (!notable) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: notable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/notables/admin/:id — update notable
router.put('/admin/:id', protect, adminOnly, async (req, res) => {
  try {
    const notable = await Notable.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!notable) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: notable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/notables/admin/:id — delete notable
router.delete('/admin/:id', protect, adminOnly, async (req, res) => {
  try {
    const notable = await Notable.findByIdAndDelete(req.params.id);
    if (!notable) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/notables/admin/:id/toggle — toggle active/featured
router.patch('/admin/:id/toggle', protect, adminOnly, async (req, res) => {
  try {
    const { isActive, featured } = req.body;
    const update = {};
    if (isActive !== undefined) update.isActive = isActive;
    if (featured !== undefined) update.featured = featured;
    const notable = await Notable.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!notable) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: notable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
