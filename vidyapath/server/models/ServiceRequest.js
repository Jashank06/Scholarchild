const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['application_help', 'document_verification', 'scholarship_guidance', 'technical_support', 'complaint', 'feedback', 'other'],
    required: true,
  },
  subject: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  timeline: [{
    status: String,
    note: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now },
  }],

  attachments: [{ name: String, url: String }],

}, { timestamps: true });

serviceRequestSchema.index({ userId: 1, status: 1 });
serviceRequestSchema.index({ status: 1, priority: 1 });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
