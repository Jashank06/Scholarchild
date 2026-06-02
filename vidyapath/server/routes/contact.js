const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { protect, adminOnly } = require('../middleware/auth');

// @POST /api/contact — Public: submit a contact enquiry
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, mobile, subject, message } = req.body;

    if (!firstName || !lastName || !email || !mobile) {
      return res.status(400).json({ success: false, message: 'First name, last name, email, and mobile are required' });
    }

    const enquiry = await Contact.create({ firstName, lastName, email, mobile, subject, message });
    res.status(201).json({ success: true, data: enquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/contact — Admin: list all enquiries
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const enquiries = await Contact.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: enquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/contact/:id — Admin: single enquiry
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const enquiry = await Contact.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    res.json({ success: true, data: enquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @PUT /api/contact/:id — Admin: update status
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const enquiry = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    res.json({ success: true, data: enquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
