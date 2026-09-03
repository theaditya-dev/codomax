/**
 * server.js
 * ------------------------------------------------------------------
 * Entry point for the DevBlog backend.
 *
 * MODULE 3: connects to MongoDB Atlas (via config/db.js) before the
 * server starts accepting requests.
 * MODULE 5 UPDATE: checks that JWT_SECRET is set before starting,
 * since every protected route depends on it. Routes themselves are
 * unchanged here — the new JWT middleware is wired up inside
 * authRoutes.js and blogRoutes.js, not in this file.
 *
 * What this file does:
 *   1. Loads environment variables from .env (via dotenv)
 *   2. Confirms JWT_SECRET is set (auth won't work without it)
 *   3. Connects to MongoDB using Mongoose
 *   4. Creates an Express app
 *   5. Enables CORS so the frontend (opened with Live Server on a
 *      different port, e.g. 5500) is allowed to call this API
 *   6. Parses incoming JSON request bodies
 *   7. Mounts the auth and blog routers
 *   8. Starts the server on http://localhost:5000
 * ------------------------------------------------------------------
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- JWT secret check ----------
// Every protected route (see middleware/authMiddleware.js) needs this
// to verify tokens, so fail fast with a clear message instead of
// letting every login/protected request break confusingly later.
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is not set. Add it to backend/.env (see .env.example).');
  process.exit(1);
}

// ---------- Middleware ----------

// Allow requests from the frontend (running on a different origin/port)
app.use(cors());

// Parse incoming JSON bodies (e.g. from fetch() POST requests) into req.body
app.use(express.json());

// ---------- Routes ----------

// Health check / root route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'DevBlog API is running' });
});

// Auth endpoints: /api/auth/register, /api/auth/login, /api/auth/me
app.use('/api/auth', authRoutes);

// Blog endpoints: /api/blogs, /api/blogs/mine, /api/blogs/:id
app.use('/api/blogs', blogRoutes);

// ---------- 404 handler ----------
// Runs when no route above matched the request
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ---------- Global error handler ----------
// Catches unexpected errors thrown anywhere in the app
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ---------- Connect to MongoDB, then start the server ----------
// We wait for the database connection before calling app.listen() so
// the API never accepts requests it can't actually fulfill.
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`DevBlog API is running at http://localhost:${PORT}`);
  });
});
