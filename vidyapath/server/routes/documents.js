const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Document = require('../models/Document');
const { protect, adminOnly } = require('../middleware/auth');
const { awardBadge } = require('../utils/gamification');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, and PNG are allowed.'));
    }
  }
});

router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file' });
    const doc = await Document.create({
      userId: req.user._id, type: req.body.type || 'other',
      name: req.body.name || req.file.originalname, originalName: req.file.originalname,
      url: `/uploads/${req.file.filename}`, mimeType: req.file.mimetype, size: req.file.size,
      verified: true, // Auto-verify on upload as requested
    });
    const cnt = await Document.countDocuments({ userId: req.user._id });
    if (cnt >= 5) await awardBadge(req.user, 'DOC_MASTER');
    res.status(201).json({ success: true, data: doc });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/', protect, async (req, res) => {
  try {
    const docs = await Document.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: docs });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Document.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/:id/verify', protect, adminOnly, async (req, res) => {
  try {
    const doc = await Document.findByIdAndUpdate(req.params.id, { verified: true, verifiedBy: req.user._id, verifiedAt: new Date() }, { new: true });
    res.json({ success: true, data: doc });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
