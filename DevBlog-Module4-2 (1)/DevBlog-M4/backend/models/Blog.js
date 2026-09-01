/**
 * Blog.js
 * ------------------------------------------------------------------
 * MODULE 3: Mongoose schema/model for a blog post.
 * MODULE 4 UPDATE: added `authorEmail` so the backend can verify that
 * only the user who created a blog is allowed to edit or delete it
 * (see the ownership check in blogController.js).
 *
 * `timestamps: true` automatically adds and manages createdAt and
 * updatedAt fields, so we don't have to set them by hand.
 * ------------------------------------------------------------------
 */

const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: ['Web Development', 'JavaScript', 'Programming', 'AI', 'Technology', 'Career']
    },
    description: {
      type: String,
      required: [true, 'Short description is required'],
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Blog content is required']
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true
    },
    authorEmail: {
      type: String,
      required: [true, 'Author email is required'],
      lowercase: true,
      trim: true
    },
    coverImage: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Published', 'Draft'],
      default: 'Published'
    },
    views: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model('Blog', blogSchema);
