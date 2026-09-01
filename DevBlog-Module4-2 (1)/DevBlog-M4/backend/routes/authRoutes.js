/**
 * authRoutes.js
 * ------------------------------------------------------------------
 * Defines the URL paths for authentication and connects each one
 * to its controller function.
 *
 * Mounted in server.js at: /api/auth
 *   → POST /api/auth/register
 *   → POST /api/auth/login
 * ------------------------------------------------------------------
 */

const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);

module.exports = router;
