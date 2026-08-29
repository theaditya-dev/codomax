/**
 * server.js
 * ------------------------------------------------------------------
 * Entry point for the DevBlog backend.
 *
 * MODULE 3 UPDATE: now connects to MongoDB Atlas (via config/db.js)
 * before the server starts accepting requests. Everything else from
 * Module 2 (CORS, JSON parsing, routes, error handling) is unchanged.
 *
 * What this file does:
 *   1. Loads environment variables from .env (via dotenv)
 *   2. Connects to MongoDB using Mongoose
 *   3. Creates an Express app
 *   4. Enables CORS so the frontend (opened with Live Server on a
 *      different port, e.g. 5500) is allowed to call this API
 *   5. Parses incoming JSON request bodies
 *   6. Mounts the auth and blog routers
 *   7. Starts the server on http://localhost:5000
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

// Auth endpoints: /api/auth/register, /api/auth/login
app.use('/api/auth', authRoutes);

// Blog endpoints: /api/blogs, /api/blogs/:id
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
