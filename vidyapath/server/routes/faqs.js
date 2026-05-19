const express = require('express');
const router = express.Router();
const FAQ = require('../models/FAQ');

const defaultFAQs = [
  {
    question: 'How do I track my child\'s scholarship applications?',
    answer: 'You can navigate to the "Application Status" menu to view real-time updates on all scholarships your child has applied for. The statuses range from Draft to Under Review, Approved, or Rejected.',
    category: 'Applications',
    order: 1
  },
  {
    question: 'Can I link multiple children to my account?',
    answer: 'Yes! Go to your Profile page and click on "Manage" under "My Children". You can link multiple verified student accounts using their Registration IDs.',
    category: 'Account',
    order: 2
  },
  {
    question: 'Where can I upload documents required for scholarships?',
    answer: 'Use the "Files & Folders" section from the sidebar. You can organize your child\'s academic, sports, and basic documents here. These securely stored documents can be attached directly to applications.',
    category: 'Documents',
    order: 3
  },
  {
    question: 'How are the scholarship recommendations generated?',
    answer: 'Our AI Agent analyzes your child\'s profile (grades, category, interests, income) and matches it against hundreds of active schemes to find the most relevant opportunities.',
    category: 'Scholarships',
    order: 4
  },
  {
    question: 'How do I contact support if I face an issue?',
    answer: 'You can reach out to our team using the "Support Center" menu on the sidebar. You can create a new service request and our agents will respond to you promptly.',
    category: 'Support',
    order: 5
  }
];

// @GET /api/faqs
// Get all active FAQs, sorted by category and order
router.get('/', async (req, res) => {
  try {
    let faqs = await FAQ.find({ isActive: true }).sort({ category: 1, order: 1 });

    // Seed defaults if empty
    if (faqs.length === 0) {
      await FAQ.insertMany(defaultFAQs);
      faqs = await FAQ.find({ isActive: true }).sort({ category: 1, order: 1 });
    }

    res.json({ success: true, data: faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
