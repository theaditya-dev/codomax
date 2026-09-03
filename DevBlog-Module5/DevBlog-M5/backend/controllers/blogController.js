/**
 * blogController.js
 * ------------------------------------------------------------------
 * MODULE 4: full CRUD (create/read/update/delete) + search/filter.
 * MODULE 5 UPDATE:
 *   - createBlog now gets the author's identity from the verified JWT
 *     (req.user, set by authMiddleware) instead of trusting whatever
 *     `author`/`authorEmail` the frontend sends in the request body.
 *   - updateBlog / deleteBlog now check ownership using the real
 *     `user` ObjectId reference instead of a client-supplied email —
 *     this is the "real" security Module 4's README said was missing.
 *   - Added getMyBlogs for the protected Dashboard, which returns only
 *     the logged-in user's own blogs (found via their verified id, not
 *     a client-side filter).
 *
 * createBlog, updateBlog, and deleteBlog are all protected by
 * authMiddleware in blogRoutes.js, so req.user is guaranteed to exist
 * inside them. getBlogs and getBlogById stay public — anyone can read
 * published blogs without logging in.
 * ------------------------------------------------------------------
 */

const mongoose = require('mongoose');
const Blog = require('../models/Blog');

/**
 * POST /api/blogs   (protected)
 * Creates a new blog post owned by the logged-in user.
 */
async function createBlog(req, res) {
  try {
    const { title, category, description, content, coverImage, status } = req.body;

    // ---------- Validation ----------
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Blog title is required.' });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Category is required.' });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Short description is required.' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Blog content is required.' });
    }

    // ---------- Create and save the new blog, owned by req.user (from the JWT) ----------
    const newBlog = new Blog({
      user: req.user.id,
      title: title.trim(),
      category: category.trim(),
      coverImage: coverImage ? coverImage.trim() : '',
      description: description.trim(),
      content: content.trim(),
      author: req.user.name,        // taken from the verified token, not req.body
      authorEmail: req.user.email,  // taken from the verified token, not req.body
      status: status === 'Draft' ? 'Draft' : 'Published'
    });

    const savedBlog = await newBlog.save();

    return res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      blog: savedBlog
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const firstMessage = Object.values(error.errors)[0].message;
      return res.status(400).json({ success: false, message: firstMessage });
    }

    console.error('Create blog error:', error);
    return res.status(500).json({ success: false, message: 'Something went wrong on the server. Please try again.' });
  }
}

/**
 * GET /api/blogs   (public)
 * Returns blog posts from MongoDB, newest first.
 * Optional query params: ?search=keyword  ?category=CatName
 */
async function getBlogs(req, res) {
  try {
    const { search, category } = req.query;
    const filter = {};

    if (search && search.trim()) {
      const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.title = { $regex: safeSearch, $options: 'i' };
    }

    if (category && category.trim()) {
      filter.category = category.trim();
    }

    const blogs = await Blog.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: blogs.length,
      blogs
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    return res.status(500).json({ success: false, message: 'Something went wrong on the server. Please try again.' });
  }
}

/**
 * GET /api/blogs/mine   (protected)
 * Returns ONLY the logged-in user's own blogs, found via their
 * verified id from the JWT — not a filter the frontend could fake.
 * Used by the Dashboard page.
 */
async function getMyBlogs(req, res) {
  try {
    const blogs = await Blog.find({ user: req.user.id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: blogs.length,
      blogs
    });
  } catch (error) {
    console.error('Get my blogs error:', error);
    return res.status(500).json({ success: false, message: 'Something went wrong on the server. Please try again.' });
  }
}

/**
 * GET /api/blogs/:id   (public)
 * Returns a single blog post by its MongoDB _id.
 */
async function getBlogById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid blog ID.' });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found.' });
    }

    return res.status(200).json({
      success: true,
      blog
    });
  } catch (error) {
    console.error('Get blog by id error:', error);
    return res.status(500).json({ success: false, message: 'Something went wrong on the server. Please try again.' });
  }
}

/**
 * PUT /api/blogs/:id   (protected)
 * Updates a blog post — only allowed if req.user (from the JWT) is
 * the blog's real owner (blog.user).
 */
async function updateBlog(req, res) {
  try {
    const { id } = req.params;
    const { title, category, description, content, coverImage, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid blog ID.' });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found.' });
    }

    // ---------- Ownership check (real check, using the verified user id) ----------
    // Blogs created before Module 5 have no `user` field at all — there's no
    // verified owner to check against, so we safely refuse to edit them here
    // rather than guessing.
    if (!blog.user || blog.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You are not allowed to edit this blog.' });
    }

    // ---------- Validation (only for fields the edit form actually sends) ----------
    if (title !== undefined && !title.trim()) {
      return res.status(400).json({ success: false, message: 'Blog title is required.' });
    }

    if (description !== undefined && !description.trim()) {
      return res.status(400).json({ success: false, message: 'Short description is required.' });
    }

    if (content !== undefined && !content.trim()) {
      return res.status(400).json({ success: false, message: 'Blog content is required.' });
    }

    // ---------- Apply updates ----------
    if (title !== undefined) blog.title = title.trim();
    if (category !== undefined) blog.category = category.trim();
    if (description !== undefined) blog.description = description.trim();
    if (content !== undefined) blog.content = content.trim();
    if (coverImage !== undefined) blog.coverImage = coverImage.trim();
    if (status !== undefined) blog.status = status === 'Draft' ? 'Draft' : 'Published';

    const updatedBlog = await blog.save(); // updatedAt is refreshed automatically

    return res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      blog: updatedBlog
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const firstMessage = Object.values(error.errors)[0].message;
      return res.status(400).json({ success: false, message: firstMessage });
    }

    console.error('Update blog error:', error);
    return res.status(500).json({ success: false, message: 'Something went wrong on the server. Please try again.' });
  }
}

/**
 * DELETE /api/blogs/:id   (protected)
 * Deletes a blog post — only allowed if req.user (from the JWT) is
 * the blog's real owner (blog.user).
 */
async function deleteBlog(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid blog ID.' });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found.' });
    }

    // ---------- Ownership check (real check, using the verified user id) ----------
    if (!blog.user || blog.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You are not allowed to delete this blog.' });
    }

    await Blog.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    return res.status(500).json({ success: false, message: 'Something went wrong on the server. Please try again.' });
  }
}

module.exports = { createBlog, getBlogs, getMyBlogs, getBlogById, updateBlog, deleteBlog };
