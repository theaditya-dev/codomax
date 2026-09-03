/**
 * authRoutes.js
 * ------------------------------------------------------------------
 * Defines the URL paths for authentication and connects each one
 * to its controller function.
 *
 * Mounted in server.js at: /api/auth
 *   → POST /api/auth/register
 *   → POST /api/auth/login
 *   → GET  /api/auth/me   (protected — requires a valid JWT) — added in Module 5
 * ------------------------------------------------------------------
 */

const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getProfile);

module.exports = router;
