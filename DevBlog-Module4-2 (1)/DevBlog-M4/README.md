# DevBlog – Glassmorphism Blog Platform

A dark-themed, glassmorphism blog platform built in four stages: **Module 1** (frontend UI) → **Module 2** (Express REST API) → **Module 3** (MongoDB Atlas + secure passwords + blog details page) → **Module 4** (full CRUD: edit and delete your own blogs, search & filter).

## Internship

**Codomax Digital Solutions** — Full Stack Web Development Internship
**Module 4 — CRUD Operations**

Repository: https://github.com/theaditya-dev/codomax

## What's New in Module 4

- Added **PUT /api/blogs/:id** and **DELETE /api/blogs/:id**, so blogs can now be fully updated and deleted, not just created and read
- The existing **Create Blog** page now doubles as the **Edit Blog** page: visiting `create-blog.html?edit=<id>` loads that blog, prefills the form, and updates it instead of creating a new one
- The **Dashboard** shows **Edit** and **Delete** buttons on each of your stories again
- The **Blog Details** page shows **Edit Blog** / **Delete Blog** buttons, but only when you're viewing your own story
- Added an **ownership check**: the backend only allows a PUT/DELETE if the requester's email matches the blog's `authorEmail` (see "How ownership is enforced" below — important to understand its limits)
- Added optional **search by title** and **filter by category** on the Home page (`GET /api/blogs?search=...&category=...`)
- No new npm packages were needed — Module 4 reuses `express`, `mongoose`, `cors`, `dotenv` already installed in Module 3

## How Ownership Is Enforced (read this)

This project has **no JWT or server-side session system yet** — logging in only stores your name/email in the browser's `localStorage` (Module 2/3 behavior, unchanged). So when the frontend asks the backend to update or delete a blog, it also sends the current user's email as `requesterEmail` in the request body. The backend compares that to the blog's stored `authorEmail` and rejects the request with `403 Forbidden` if they don't match.

**This is good enough to stop accidental or casual misuse** (the UI simply won't show Edit/Delete buttons unless you're the author, and the backend double-checks before saving), **but it is not real security** — someone could technically call the API directly with a different `requesterEmail` and pass the check. True protection requires JWT-based authentication, which is a good candidate for a future module.

## Technologies

**Frontend:** HTML5, CSS3 (glassmorphism, responsive design), Vanilla JavaScript (`fetch()`)
**Backend:** Node.js, Express.js, Mongoose, bcrypt, cors, dotenv
**Database:** MongoDB Atlas

## Project Structure

```
DevBlog/
│
├── frontend/
│   ├── index.html              ← added search + category filter bar
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── create-blog.html        ← now also used for editing (?edit=<id>)
│   ├── blog-details.html       ← now shows Edit/Delete for the owner
│   ├── css/
│   │   └── style.css           ← added .filter-bar styles
│   ├── js/
│   │   └── script.js           ← full CRUD wiring (see below)
│   └── assets/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── .env.example
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   └── Blog.js             ← added `authorEmail` field
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── blogRoutes.js       ← added PUT and DELETE routes
│   └── controllers/
│       ├── authController.js
│       └── blogController.js   ← added updateBlog + deleteBlog, search/filter on getBlogs
│
├── .gitignore
└── README.md
```

## CRUD API Endpoints

| Method | Endpoint | Description | Auth check |
|---|---|---|---|
| POST | `/api/auth/register` | Register a user | — |
| POST | `/api/auth/login` | Log in | — |
| POST | `/api/blogs` | **Create** a blog | must include `authorEmail` |
| GET | `/api/blogs` | **Read** all blogs (supports `?search=` and `?category=`) | — |
| GET | `/api/blogs/:id` | **Read** one blog | — |
| PUT | `/api/blogs/:id` | **Update** a blog | `requesterEmail` must match the blog's author |
| DELETE | `/api/blogs/:id` | **Delete** a blog | `requesterEmail` must match the blog's author |

### `PUT /api/blogs/:id`
**Request body**
```json
{
  "title": "Updated title",
  "category": "JavaScript",
  "description": "Updated description",
  "content": "Updated content",
  "coverImage": "",
  "status": "Published",
  "requesterEmail": "aditya@example.com"
}
```
**200 success:** `{ "success": true, "message": "Blog updated successfully", "blog": { "...": "..." } }`
**403 not the owner:** `{ "success": false, "message": "You are not allowed to edit this blog." }`
**404 not found:** `{ "success": false, "message": "Blog not found." }`

### `DELETE /api/blogs/:id`
**Request body**
```json
{ "requesterEmail": "aditya@example.com" }
```
**200 success:** `{ "success": true, "message": "Blog deleted successfully" }`
**403 not the owner:** `{ "success": false, "message": "You are not allowed to delete this blog." }`

### `GET /api/blogs?search=react&category=JavaScript`
Both query params are optional and combine as an AND filter. `search` matches the blog title, case-insensitive.

## How the Frontend Connects to Each Endpoint

| Frontend action | Function in `script.js` | Endpoint called |
|---|---|---|
| Submitting the register form | `registerUser()` | `POST /api/auth/register` |
| Submitting the login form | `loginUser()` | `POST /api/auth/login` |
| Clicking "Publish Blog" (new post) | `createBlogApi()` | `POST /api/blogs` |
| Home page loading / typing in search / changing category | `fetchBlogs()` | `GET /api/blogs?search=&category=` |
| Dashboard loading | `fetchBlogs()` | `GET /api/blogs` (filtered client-side to your `authorEmail`) |
| Opening `blog-details.html?id=...` | `fetchBlogById()` | `GET /api/blogs/:id` |
| Clicking "Edit" (Dashboard or Details) | navigates to `create-blog.html?edit=<id>`, which calls `fetchBlogById()` to prefill | `GET /api/blogs/:id` |
| Submitting the edit form ("Update Blog") | `updateBlogApi()` | `PUT /api/blogs/:id` |
| Clicking "Delete" (Dashboard or Details, after confirmation) | `deleteBlogApi()` | `DELETE /api/blogs/:id` |

## Files Created

- None — Module 4 only modified existing files from Modules 1–3.

## Files Modified

- `backend/models/Blog.js` — added `authorEmail` field
- `backend/controllers/blogController.js` — added `updateBlog`, `deleteBlog`, search/category filtering on `getBlogs`
- `backend/routes/blogRoutes.js` — added `PUT /:id` and `DELETE /:id`
- `frontend/js/script.js` — added `updateBlogApi()`, `deleteBlogApi()`, edit-mode support in the Create Blog page, Edit/Delete buttons on Dashboard and Blog Details, search/filter on Home
- `frontend/index.html` — added the search box + category dropdown above "Latest Stories"
- `frontend/css/style.css` — added `.filter-bar` styles

## npm Packages Added

None. Module 4 reuses `express`, `mongoose`, `bcrypt`, `cors`, and `dotenv`, already installed in Module 3.

## How to Run the Project

```bash
# Backend
cd backend
npm install        # only needed again if you haven't already
npm start           # or: npm run dev

# Frontend
# Open the frontend folder in VS Code → right-click index.html → "Open with Live Server"
```

Make sure `backend/.env` still has your MongoDB Atlas `MONGO_URI` from Module 3.

## How to Test Each Endpoint

```bash
# Update a blog (replace BLOG_ID and the email with a real one you registered)
curl -X PUT http://localhost:5000/api/blogs/BLOG_ID \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Updated Title\",\"requesterEmail\":\"aditya@example.com\"}"

# Delete a blog
curl -X DELETE http://localhost:5000/api/blogs/BLOG_ID \
  -H "Content-Type: application/json" \
  -d "{\"requesterEmail\":\"aditya@example.com\"}"

# Search + filter
curl "http://localhost:5000/api/blogs?search=javascript&category=JavaScript"
```

Or just use the UI: log in → go to Dashboard → click **Edit** on one of your stories → change something → **Update Blog** → confirm it changed → click **Delete** on another story → confirm the popup → confirm it disappears from the list and Home page.

## Testing Checklist (Module 4)

- [x] Create Blog still works and now also sends `authorEmail`
- [x] Home page loads blogs from MongoDB, search box filters by title, category dropdown filters by category
- [x] Blog Details page loads correctly and shows Edit/Delete only for the blog's own author
- [x] Editing your own blog pre-fills the form and saves changes with `PUT`
- [x] Deleting your own blog asks for confirmation, then removes it from Dashboard and Home immediately
- [x] Invalid blog ID on any `/api/blogs/:id` route returns `400`
- [x] Non-existent blog ID returns `404`
- [x] Attempting to edit/delete a blog with a mismatched `requesterEmail` returns `403`
- [x] Module 1 (UI), Module 2 (REST API/CORS), and Module 3 (MongoDB, hashed passwords, blog details) all still work unchanged

## Security & Quality Notes

- MongoDB credentials live only in `backend/.env`, which is git-ignored — never in frontend code.
- Passwords remain bcrypt-hashed and are never returned by any API response.
- All blog IDs are validated with `mongoose.Types.ObjectId.isValid()` before being queried, so a malformed ID returns a clean `400` instead of a server crash.
- All CRUD endpoints return consistent `{ success, message, ... }` JSON with appropriate HTTP status codes (`200`, `201`, `400`, `403`, `404`, `500`).
- No hardcoded/fake blog data is used anywhere — every blog shown in the UI comes from MongoDB.

## Future Improvements (Module 5+)

- Replace the `requesterEmail` ownership check with real JWT-based authentication and protected routes
- Add pagination to `GET /api/blogs` for large numbers of posts
- Add image upload instead of raw cover-image URLs
- Add comments/likes on individual blog posts

---

Built for **Codomax Digital Solutions** — Full Stack Web Development Internship, Module 4.
