const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  childId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String },
  category: { type: String, enum: ['academic', 'sports', 'arts', 'competition', 'other'], default: 'academic' },
  achievedAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

achievementSchema.index({ childId: 1, achievedAt: -1 });

module.exports = mongoose.model('Achievement', achievementSchema);
