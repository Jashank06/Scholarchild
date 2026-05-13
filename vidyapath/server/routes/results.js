const express = require('express');
const router = express.Router();
const ResultSource = require('../models/ResultSource');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { board, state, level, search } = req.query;
    const filter = { status: 'active' };
    if (board) filter.board = board;
    if (state) filter.state = state;
    if (level) filter.level = level;
    if (search) filter.$or = [
      { name: new RegExp(search, 'i') },
      { examName: new RegExp(search, 'i') },
    ];

    const data = await ResultSource.find(filter).sort({ lastUpdatedAt: -1, createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const source = await ResultSource.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: source });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const source = await ResultSource.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!source) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: source });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const source = await ResultSource.findByIdAndDelete(req.params.id);
    if (!source) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
