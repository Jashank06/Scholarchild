const express = require('express');
const router = express.Router();
const FileNode = require('../models/FileNode');
const { protect } = require('../middleware/auth');

// Get file nodes (folders/files) for a user
router.get('/', protect, async (req, res) => {
  try {
    const parentIdParam = req.query.parentId;
    
    const query = { userId: req.user.id, isDeleted: false };
    
    // Handle parentId: null means root level, otherwise filter by parentId
    if (!parentIdParam || parentIdParam === 'null' || parentIdParam === 'undefined') {
      query.parentId = null;
    } else {
      query.parentId = parentIdParam;
    }
    
    const nodes = await FileNode.find(query).sort({ type: -1, name: 1 });
    res.json({ success: true, data: nodes });
  } catch (error) {
    console.error('Error fetching file nodes:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create folder
router.post('/folder', protect, async (req, res) => {
  try {
    const { name, parentId } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Folder name is required' });
    }
    
    const folder = await FileNode.create({
      name: name.trim(),
      type: 'folder',
      userId: req.user.id,
      parentId: parentId || null,
    });
    
    res.json({ success: true, data: folder });
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Upload file
router.post('/upload', protect, async (req, res) => {
  try {
    const multer = require('multer');
    const path = require('path');
    const fs = require('fs');
    
    // Setup upload directory
    const uploadDir = path.join(__dirname, '../uploads/file-nodes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const storage = multer.diskStorage({
      destination: (req, file, cb) => cb(null, uploadDir),
      filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      }
    });
    
    const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
    
    // Handle upload manually since we're in router context
    const { parentId } = req.query;
    
    upload.single('file')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      
      const fileNode = await FileNode.create({
        name: req.file.originalname,
        type: 'file',
        userId: req.user.id,
        parentId: parentId || null,
        url: `/uploads/file-nodes/${req.file.filename}`,
        mimeType: req.file.mimetype,
        size: req.file.size,
        extension: path.extname(req.file.originalname).slice(1),
      });
      
      res.json({ success: true, data: fileNode });
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete file node
router.delete('/:id', protect, async (req, res) => {
  try {
    const node = await FileNode.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!node) {
      return res.status(404).json({ success: false, message: 'File or folder not found' });
    }
    
    // Soft delete
    node.isDeleted = true;
    await node.save();
    
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error deleting file node:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;