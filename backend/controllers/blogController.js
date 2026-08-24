/**
 * blogController.js
 * ------------------------------------------------------------------
 * Handles the business logic for blog posts:
 *   - createBlog: add a new blog post to the in-memory array
 *   - getBlogs:   return all blog posts (newest first)
 *
 * Data is read from / written to the in-memory `blogs` array in
 * ../data/data.js. No database is used in Module 2 — everything
 * resets when the server restarts.
 * ------------------------------------------------------------------
 */

const { blogs } = require('../data/data');

/**
 * POST /api/blogs
 * Creates a new blog post after validating the input.
 */
function createBlog(req, res) {
  try {
    const { title, category, description, content, author, coverImage, status } = req.body;

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

    // ---------- Create and store the new blog ----------
    const newBlog = {
      id: 'blog_' + Date.now(),
      title: title.trim(),
      category: category.trim(),
      coverImage: coverImage ? coverImage.trim() : '',
      description: description.trim(),
      content: content.trim(),
      author: author.trim(),
      status: status === 'Draft' ? 'Draft' : 'Published',
      date: new Date().toISOString(),
      views: 0
    };

    // Newest post first
    blogs.unshift(newBlog);

    return res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      blog: newBlog
    });
  } catch (error) {
    console.error('Create blog error:', error);
    return res.status(500).json({ success: false, message: 'Something went wrong on the server. Please try again.' });
  }
}

/**
 * GET /api/blogs
 * Returns every blog post currently stored in memory.
 */
function getBlogs(req, res) {
  try {
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

module.exports = { createBlog, getBlogs };
