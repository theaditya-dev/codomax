/**
 * blogRoutes.js
 * ------------------------------------------------------------------
 * Defines the URL paths for blog posts and connects each one to its
 * controller function.
 *
 * Mounted in server.js at: /api/blogs
 *   → POST   /api/blogs      (create a blog)
 *   → GET    /api/blogs      (list all blogs — supports ?search= & ?category=)
 *   → GET    /api/blogs/:id  (get one blog by its MongoDB id)
 *   → PUT    /api/blogs/:id  (update a blog — owner only) — added in Module 4
 *   → DELETE /api/blogs/:id  (delete a blog — owner only) — added in Module 4
 * ------------------------------------------------------------------
 */

const express = require('express');
const router = express.Router();
const { createBlog, getBlogs, getBlogById, updateBlog, deleteBlog } = require('../controllers/blogController');

router.post('/', createBlog);
router.get('/', getBlogs);
router.get('/:id', getBlogById); // must come after GET '/' so it doesn't shadow it
router.put('/:id', updateBlog);
router.delete('/:id', deleteBlog);

module.exports = router;
