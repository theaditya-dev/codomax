/**
 * blogController.js
 * ------------------------------------------------------------------
 * MODULE 3 UPDATE: Blog posts now read from and write to MongoDB
 * (via the Blog model) instead of the in-memory `blogs` array from
 * Module 2. Also adds getBlogById for the new blog-details.html page.
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

    // ---------- Create and save the new blog in MongoDB ----------
    const newBlog = new Blog({
      title: title.trim(),
      category: category.trim(),
      coverImage: coverImage ? coverImage.trim() : '',
      description: description.trim(),
      content: content.trim(),
      author: author.trim(),
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
 * Returns every blog post from MongoDB, newest first.
 */
async function getBlogs(req, res) {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }); // -1 = newest first

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
 * Used by the new blog-details.html page.
 */
async function getBlogById(req, res) {
  try {
    const { id } = req.params;

    // A malformed id (wrong length/characters) is never a valid Mongo ObjectId —
    // catching this up front avoids a confusing 500 error from Mongoose.
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

module.exports = { createBlog, getBlogs, getBlogById };
