/**
 * Blog.js
 * ------------------------------------------------------------------
 * MODULE 3: Mongoose schema/model for a blog post.
 * MODULE 4 UPDATE: added `authorEmail` so the backend can verify that
 * only the user who created a blog is allowed to edit or delete it.
 * MODULE 5 UPDATE: added `user`, a real reference to the User who owns
 * this blog (its MongoDB ObjectId). This is now the SOURCE OF TRUTH for
 * ownership — it's set from the verified JWT on the server, not from
 * anything the frontend sends. `author` / `authorEmail` are kept as
 * plain display fields (so existing cards/pages don't need to change)
 * and as a fallback for any blog created before this field existed.
 *
 * `user` is intentionally NOT required, so blogs created in Modules
 * 1–4 (which have no `user` field) keep working for reading/display —
 * they just can't be edited/deleted since there's no verified owner to
 * check against (see the ownership checks in blogController.js).
 *
 * `timestamps: true` automatically adds and manages createdAt and
 * updatedAt fields, so we don't have to set them by hand.
 * ------------------------------------------------------------------
 */

const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
      // not required — see the comment above about older blogs
    },
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
