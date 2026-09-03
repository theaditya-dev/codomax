/**
 * blogRoutes.js
 * ------------------------------------------------------------------
 * Defines the URL paths for blog posts and connects each one to its
 * controller function.
 *
 * Mounted in server.js at: /api/blogs
 *   → POST   /api/blogs       (protected — create a blog, owned by the logged-in user)
 *   → GET    /api/blogs       (public   — list all blogs; supports ?search= & ?category=)
 *   → GET    /api/blogs/mine  (protected — list ONLY the logged-in user's blogs) — added in Module 5
 *   → GET    /api/blogs/:id   (public   — get one blog by its MongoDB id)
 *   → PUT    /api/blogs/:id   (protected — update a blog, owner only)
 *   → DELETE /api/blogs/:id   (protected — delete a blog, owner only)
 *
 * IMPORTANT: '/mine' is registered BEFORE '/:id'. Express matches
 * routes top-to-bottom, and '/:id' would otherwise treat the literal
 * word "mine" as an id and swallow this route.
 * ------------------------------------------------------------------
 */

const express = require('express');
const router = express.Router();
const { createBlog, getBlogs, getMyBlogs, getBlogById, updateBlog, deleteBlog } = require('../controllers/blogController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createBlog);
router.get('/', getBlogs);
router.get('/mine', authMiddleware, getMyBlogs);
router.get('/:id', getBlogById);
router.put('/:id', authMiddleware, updateBlog);
router.delete('/:id', authMiddleware, deleteBlog);

module.exports = router;
