/**
 * blogController.js
 * ------------------------------------------------------------------
 * MODULE 4 UPDATE: adds full CRUD.
 *   - createBlog  → POST   /api/blogs
 *   - getBlogs    → GET    /api/blogs   (now supports ?search= and ?category=)
 *   - getBlogById → GET    /api/blogs/:id
 *   - updateBlog  → PUT    /api/blogs/:id   (NEW — owner only)
 *   - deleteBlog  → DELETE /api/blogs/:id   (NEW — owner only)
 *
 * OWNERSHIP CHECK (read this before you rely on it):
 * This project has no JWT/session system yet (that's a later module),
 * so there is no cryptographically verified "logged-in user" on the
 * server. To still satisfy "users can't edit someone else's blog",
 * the frontend sends the current user's email as `requesterEmail` in
 * the body of every PUT/DELETE request, and the backend only allows
 * the update/delete if it matches the blog's stored `authorEmail`.
 * This stops accidental/casual edits but is NOT true security — a
 * user could technically send any email in a raw API request. Real
 * protection requires JWT-based auth, planned for a future module.
 * ------------------------------------------------------------------
 */

const mongoose = require('mongoose');
const Blog = require('../models/Blog');

/**
 * POST /api/blogs
 * Creates a new blog post after validating the input, and saves it to MongoDB.
 */
async function createBlog(req, res) {
  try {
    const { title, category, description, content, author, authorEmail, coverImage, status } = req.body;

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

    if (!author || !author.trim()) {
      return res.status(400).json({ success: false, message: 'Author is required.' });
    }

    if (!authorEmail || !authorEmail.trim()) {
      return res.status(400).json({ success: false, message: 'Author email is required.' });
    }

    // ---------- Create and save the new blog in MongoDB ----------
    const newBlog = new Blog({
      title: title.trim(),
      category: category.trim(),
      coverImage: coverImage ? coverImage.trim() : '',
      description: description.trim(),
      content: content.trim(),
      author: author.trim(),
      authorEmail: authorEmail.trim(),
      status: status === 'Draft' ? 'Draft' : 'Published'
    });

    const savedBlog = await newBlog.save();

    return res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      blog: savedBlog
    });
  } catch (error) {
    // Mongoose validation errors (e.g. category not in the allowed list)
    if (error.name === 'ValidationError') {
      const firstMessage = Object.values(error.errors)[0].message;
      return res.status(400).json({ success: false, message: firstMessage });
    }

    console.error('Create blog error:', error);
    return res.status(500).json({ success: false, message: 'Something went wrong on the server. Please try again.' });
  }
}

/**
 * GET /api/blogs
 * Returns blog posts from MongoDB, newest first.
 * Optional query params (Module 4 enhancement):
 *   ?search=keyword     → case-insensitive match on title
 *   ?category=CatName   → exact category match
 */
async function getBlogs(req, res) {
  try {
    const { search, category } = req.query;
    const filter = {};

    if (search && search.trim()) {
      // 'i' = case-insensitive; escape isn't strictly needed for a student
      // project but keeps a stray regex character from breaking the query.
      const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.title = { $regex: safeSearch, $options: 'i' };
    }

    if (category && category.trim()) {
      filter.category = category.trim();
    }

    const blogs = await Blog.find(filter).sort({ createdAt: -1 }); // -1 = newest first

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
 * GET /api/blogs/:id
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
 * PUT /api/blogs/:id
 * Updates a blog post — only allowed for the blog's own author.
 */
async function updateBlog(req, res) {
  try {
    const { id } = req.params;
    const { title, category, description, content, coverImage, status, requesterEmail } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid blog ID.' });
    }

    if (!requesterEmail || !requesterEmail.trim()) {
      return res.status(400).json({ success: false, message: 'requesterEmail is required to update a blog.' });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found.' });
    }

    // ---------- Ownership check ----------
    if (blog.authorEmail !== requesterEmail.trim().toLowerCase()) {
      return res.status(403).json({ success: false, message: 'You are not allowed to edit this blog.' });
    }

    // ---------- Validation (only fields the edit form sends) ----------
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
 * DELETE /api/blogs/:id
 * Deletes a blog post — only allowed for the blog's own author.
 */
async function deleteBlog(req, res) {
  try {
    const { id } = req.params;
    const { requesterEmail } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid blog ID.' });
    }

    if (!requesterEmail || !requesterEmail.trim()) {
      return res.status(400).json({ success: false, message: 'requesterEmail is required to delete a blog.' });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found.' });
    }

    // ---------- Ownership check ----------
    if (blog.authorEmail !== requesterEmail.trim().toLowerCase()) {
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

module.exports = { createBlog, getBlogs, getBlogById, updateBlog, deleteBlog };
