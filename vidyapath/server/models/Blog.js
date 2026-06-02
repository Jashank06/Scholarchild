const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  excerpt: { type: String, trim: true, maxlength: 500 },
  content: { type: String, default: '' },
  featuredImage: { type: String, default: '' },
  author: {
    name: { type: String, default: 'Kushaagra Team' },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
  },
  categories: [{ type: String, trim: true }],
  tags: [{ type: String, trim: true }],
  readTime: { type: String, default: '5 min read' },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  publishedAt: { type: Date },
  viewCount: { type: Number, default: 0 },
  likes: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, createdAt: { type: Date, default: Date.now } }],
  shares: { type: Number, default: 0 },
  ratings: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, score: { type: Number, min: 1, max: 5 } }],
  comments: [{
    name: { type: String, required: true },
    email: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    replies: [{
      name: { type: String, default: 'Kushaagra Team' },
      content: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    }],
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

blogSchema.index({ slug: 1 });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ status: 1, viewCount: -1 });
blogSchema.index({ categories: 1 });

blogSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.isModified('slug')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
