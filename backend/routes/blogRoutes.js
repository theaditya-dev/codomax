/**
 * blogRoutes.js
 * ------------------------------------------------------------------
 * Defines the URL paths for blog posts and connects each one to its
 * controller function.
 *
 * Mounted in server.js at: /api/blogs
 *   → POST /api/blogs   (create a blog)
 *   → GET  /api/blogs   (list all blogs)
 * ------------------------------------------------------------------
 */

const express = require('express');
const router = express.Router();
const { createBlog, getBlogs } = require('../controllers/blogController');

router.post('/', createBlog);
router.get('/', getBlogs);

module.exports = router;
