const express = require('express');
const router = express.Router();
const SchoolCategory = require('../models/SchoolCategory');
const SchoolField = require('../models/SchoolField');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/categories', protect, adminOnly, async (req, res) => {
  try {
    const categories = await SchoolCategory.find({}).sort({ order: 1, name: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/categories', protect, adminOnly, async (req, res) => {
  try {
    const category = await SchoolCategory.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/categories/:id', protect, adminOnly, async (req, res) => {
  try {
    const category = await SchoolCategory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/categories/:id', protect, adminOnly, async (req, res) => {
  try {
    await SchoolField.deleteMany({ categoryId: req.params.id });
    const category = await SchoolCategory.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/fields', protect, adminOnly, async (req, res) => {
  try {
    const fields = await SchoolField.find({}).sort({ order: 1, label: 1 });
    res.json({ success: true, data: fields });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/fields', protect, adminOnly, async (req, res) => {
  try {
    const field = await SchoolField.create(req.body);
    res.status(201).json({ success: true, data: field });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/fields/:id', protect, adminOnly, async (req, res) => {
  try {
    const field = await SchoolField.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!field) return res.status(404).json({ success: false, message: 'Field not found' });
    res.json({ success: true, data: field });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/fields/:id', protect, adminOnly, async (req, res) => {
  try {
    const field = await SchoolField.findByIdAndDelete(req.params.id);
    if (!field) return res.status(404).json({ success: false, message: 'Field not found' });
    res.json({ success: true, message: 'Field deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
