const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { protect, adminOnly } = require('../middleware/auth');

// @GET /api/blogs — Public: list published blogs
router.get('/', async (req, res) => {
  try {
    const { sort, category, tag, search, page = 1, limit = 12 } = req.query;
    const filter = { status: 'published' };
    if (category) filter.categories = category;
    if (tag) filter.tags = tag;
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { excerpt: new RegExp(search, 'i') },
        { content: new RegExp(search, 'i') },
      ];
    }

    let sortObj = { publishedAt: -1 };
    if (sort === 'popular') sortObj = { viewCount: -1, publishedAt: -1 };

    const total = await Blog.countDocuments(filter);
    const blogs = await Blog.find(filter)
      .select('-content -comments -ratings -likes')
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // For sidebar: latest and popular
    const latest = await Blog.find({ status: 'published' })
      .select('title slug publishedAt featuredImage')
      .sort({ publishedAt: -1 })
      .limit(5);

    const popular = await Blog.find({ status: 'published' })
      .select('title slug viewCount publishedAt')
      .sort({ viewCount: -1, publishedAt: -1 })
      .limit(5);

    // Aggregate categories
    const categoryAgg = await Blog.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$categories' },
      { $group: { _id: '$categories', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: blogs,
      sidebar: { latest, popular, categories: categoryAgg },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/blogs/:slug — Public: single blog
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, status: 'published' });
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

    blog.viewCount += 1;
    await blog.save();

    const related = await Blog.find({
      status: 'published',
      _id: { $ne: blog._id },
      categories: { $in: blog.categories },
    })
      .select('title slug excerpt featuredImage publishedAt readTime')
      .sort({ publishedAt: -1 })
      .limit(3);

    res.json({ success: true, data: blog, related });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/blogs/:id/like — Auth: toggle like
router.post('/:id/like', protect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

    const idx = blog.likes.findIndex(l => l.userId.toString() === req.user._id.toString());
    if (idx > -1) {
      blog.likes.splice(idx, 1);
    } else {
      blog.likes.push({ userId: req.user._id });
    }
    await blog.save();
    res.json({ success: true, likes: blog.likes.length, liked: idx === -1 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/blogs/:id/rate — Auth: submit rating
router.post('/:id/rate', protect, async (req, res) => {
  try {
    const { score } = req.body;
    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ success: false, message: 'Score must be between 1 and 5' });
    }
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

    const idx = blog.ratings.findIndex(r => r.userId.toString() === req.user._id.toString());
    if (idx > -1) {
      blog.ratings[idx].score = score;
    } else {
      blog.ratings.push({ userId: req.user._id, score });
    }
    await blog.save();

    const avg = blog.ratings.reduce((a, r) => a + r.score, 0) / blog.ratings.length;
    res.json({ success: true, average: parseFloat(avg.toFixed(1)), count: blog.ratings.length, userScore: score });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/blogs/:id/comment — Public: submit comment
router.post('/:id/comment', async (req, res) => {
  try {
    const { name, email, content } = req.body;
    if (!name || !email || !content) {
      return res.status(400).json({ success: false, message: 'Name, email, and content are required' });
    }
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

    blog.comments.push({ name, email, content });
    await blog.save();

    const newComment = blog.comments[blog.comments.length - 1];
    res.status(201).json({ success: true, data: newComment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/blogs/:id/comment/:commentId/reply — Auth Admin: reply to comment
router.post('/:id/comment/:commentId/reply', protect, adminOnly, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ success: false, message: 'Reply content is required' });

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

    const comment = blog.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    comment.replies.push({ name: 'Kushaagra Team', content });
    await blog.save();
    res.json({ success: true, data: comment.replies[comment.replies.length - 1] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/blogs/admin/all — Admin: all blogs (including drafts)
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json({ success: true, data: blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/blogs — Admin: create blog
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const blog = await Blog.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @PUT /api/blogs/:id — Admin: update blog
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @DELETE /api/blogs/:id — Admin: delete blog
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.json({ success: true, message: 'Blog deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
