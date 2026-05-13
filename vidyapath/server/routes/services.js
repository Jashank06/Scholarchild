const express = require('express');
const router = express.Router();
const ServiceRequest = require('../models/ServiceRequest');
const { protect, adminOnly } = require('../middleware/auth');

// @POST /api/services — Create a new service request
router.post('/', protect, async (req, res) => {
  try {
    const { type, subject, description, priority, attachments } = req.body;
    const request = await ServiceRequest.create({
      userId: req.user._id,
      type,
      subject,
      description,
      priority: priority || 'medium',
      attachments
    });

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/services — Get user's service requests
router.get('/', protect, async (req, res) => {
  try {
    let filter = { userId: req.user._id };
    
    // If admin, they can see all requests or filter by user
    if (req.user.role === 'admin') {
      filter = req.query.userId ? { userId: req.query.userId } : {};
    }

    const requests = await ServiceRequest.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/services/:id — Get single service request
router.get('/:id', protect, async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id).populate('userId', 'profile.firstName profile.lastName email');
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    // Authorization: owner or admin
    if (request.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @PUT /api/services/:id — Update request status (Admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status, note, priority } = req.body;
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Not found' });

    if (status) {
      request.status = status;
      request.timeline.push({
        status,
        note: note || `Status updated to ${status}`,
        updatedBy: req.user._id,
        date: new Date()
      });
    }

    if (priority) request.priority = priority;
    
    await request.save();
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
