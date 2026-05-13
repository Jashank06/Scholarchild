const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FileNode = require('../models/FileNode');
const { protect } = require('../middleware/auth');

const uploadsDir = path.join(__dirname, '../uploads/files');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const listChildren = async (userId, parentId) => {
  const filter = { userId, parentId: parentId || null, isDeleted: false };
  const items = await FileNode.find(filter).sort({ type: 1, name: 1 });
  return items;
};

router.get('/', protect, async (req, res) => {
  try {
    const parentId = req.query.parentId || null;
    const items = await listChildren(req.user._id, parentId === 'root' ? null : parentId);
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/folder', protect, async (req, res) => {
  try {
    const { name, parentId } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Folder name required' });

    const folder = await FileNode.create({
      userId: req.user._id,
      parentId: parentId || null,
      type: 'folder',
      name,
    });

    res.status(201).json({ success: true, data: folder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const node = await FileNode.create({
      userId: req.user._id,
      parentId: req.body.parentId || null,
      type: 'file',
      name: req.body.name || req.file.originalname,
      url: `/uploads/files/${req.file.filename}`,
      mimeType: req.file.mimetype,
      size: req.file.size,
      extension: path.extname(req.file.originalname).toLowerCase(),
    });

    res.status(201).json({ success: true, data: node });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id/rename', protect, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name required' });

    const node = await FileNode.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { name },
      { new: true }
    );

    if (!node) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: node });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const node = await FileNode.findOne({ _id: req.params.id, userId: req.user._id });
    if (!node) return res.status(404).json({ success: false, message: 'Not found' });

    const markDeleted = async (ids) => {
      if (!ids.length) return;
      await FileNode.updateMany({ _id: { $in: ids } }, { isDeleted: true });
      const children = await FileNode.find({ parentId: { $in: ids }, userId: req.user._id, isDeleted: false });
      if (children.length) {
        await markDeleted(children.map(c => c._id));
      }
    };

    await markDeleted([node._id]);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
