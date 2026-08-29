/**
 * blogRoutes.js
 * ------------------------------------------------------------------
 * Defines the URL paths for blog posts and connects each one to its
 * controller function.
 *
 * Mounted in server.js at: /api/blogs
 *   → POST /api/blogs      (create a blog)
 *   → GET  /api/blogs      (list all blogs)
 *   → GET  /api/blogs/:id  (get one blog by its MongoDB id) — added in Module 3
 * ------------------------------------------------------------------
 */

const express = require('express');
const router = express.Router();
const { createBlog, getBlogs, getBlogById } = require('../controllers/blogController');

router.post('/', createBlog);
router.get('/', getBlogs);
router.get('/:id', getBlogById); // must come after GET '/' so it doesn't shadow it

module.exports = router;
