# DevBlog – Glassmorphism Blog Platform

A dark-themed, glassmorphism blog platform built in five stages: **Module 1** (frontend UI) → **Module 2** (Express REST API) → **Module 3** (MongoDB Atlas) → **Module 4** (full CRUD) → **Module 5** (JWT authentication, protected dashboard, user profile).

## Internship

**Codomax Digital Solutions** — Full Stack Web Development Internship
**Module 5 — Authentication & Dashboard**

Repository: https://github.com/theaditya-dev/codomax

## What's New in Module 5

- **Real JWT authentication.** Register and Login now issue a signed JSON Web Token. The frontend stores it and sends it as `Authorization: Bearer <token>` on every protected request.
- **`authMiddleware.js`** verifies that token on the backend and rejects the request (`401`) if it's missing, malformed, expired, or belongs to a deleted user.
- **Protected routes now enforced server-side**, not just hidden in the UI: creating, updating, and deleting a blog, viewing "my blogs," and viewing your profile all require a valid token — calling them without one always fails on the backend, regardless of what the frontend does.
- **Real ownership**, not an honesty system. Module 4 checked ownership by trusting an email the frontend sent along with the request. Module 5 replaces that: every blog now stores a `user` field (the author's real MongoDB `_id`), set by the server from the verified token when the blog is created. Update/delete now check `blog.user` against the *verified* logged-in user's id — a request can no longer claim to be a different user.
- **New protected endpoint** `GET /api/blogs/mine` — the Dashboard now asks the server "give me my blogs" (using the verified token) instead of fetching everything and filtering by email in the browser.
- **New protected endpoint** `GET /api/auth/me` — powers the new **Profile page** (name, email, member-since date, total blog count).
- **New page:** `frontend/profile.html`.
- **Navbar** now shows a **Profile** button (next to Dashboard/Logout) when logged in.
- **Logout** clears both the token and the user info, so a logged-out user can no longer reach the Dashboard, Create Blog, or Profile pages until logging in again.

## How JWT Storage Works Here (and its limits)

The token is stored in the browser's `localStorage` (`devblog_token`), right alongside the safe user info that was already stored there since Module 2. This project has no server-side session or cookie infrastructure, so `localStorage` is the practical choice available without a bigger architecture change. It's simple and works for a learning project, but it's worth understanding the trade-off: any JavaScript that runs on the page (e.g. from an XSS vulnerability) could read it. A more secure production setup would use an `httpOnly` cookie instead, which JavaScript can't read at all — that's a good next step beyond this module, not something this project currently does.

## How Ownership Is Enforced Now (Module 4 vs. Module 5)

- **Module 4:** the frontend sent `requesterEmail` with every edit/delete request, and the backend compared it to the blog's stored `authorEmail`. Anyone calling the API directly could type in a different email and the check would still "pass."
- **Module 5:** the backend no longer trusts anything the frontend claims about identity for these actions. `authMiddleware` verifies the JWT and looks the user up in MongoDB, attaching the *real* id to `req.user`. `createBlog` sets `blog.user = req.user.id` — not from the request body. `updateBlog`/`deleteBlog` check `blog.user` against `req.user.id`, both from server-verified sources. This is genuine protection: forging the request would require forging a validly-signed token, which isn't possible without the server's `JWT_SECRET`.

**Blogs created in Modules 1–4** have no `user` field (it didn't exist yet). They still display fine everywhere, but they can't be edited or deleted through the app anymore, since there's no verified owner to check against — the backend safely returns `403` rather than guessing. This is called out directly in `Blog.js` and `blogController.js`.

## Technologies

**Frontend:** HTML5, CSS3 (glassmorphism, responsive design), Vanilla JavaScript (`fetch()`)
**Backend:** Node.js, Express.js, Mongoose, bcrypt, **jsonwebtoken**, cors, dotenv
**Database:** MongoDB Atlas

## Project Structure

```
DevBlog/
│
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── create-blog.html
│   ├── blog-details.html
│   ├── profile.html            ← NEW in Module 5
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── script.js           ← JWT storage, Authorization headers, profile/dashboard logic
│   └── assets/
│
├── backend/
│   ├── server.js                ← added a JWT_SECRET startup check
│   ├── package.json             ← added jsonwebtoken
│   ├── .env
│   ├── .env.example             ← added JWT_SECRET, JWT_EXPIRES_IN
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── authMiddleware.js    ← NEW: verifies the JWT on protected routes
│   ├── models/
│   │   ├── User.js
│   │   └── Blog.js              ← added `user` (ObjectId ref to User)
│   ├── routes/
│   │   ├── authRoutes.js        ← added GET /me (protected)
│   │   └── blogRoutes.js        ← added GET /mine, protected POST/PUT/DELETE
│   └── controllers/
│       ├── authController.js    ← added JWT generation + getProfile
│       └── blogController.js    ← identity from JWT, real ownership checks, getMyBlogs
│
├── .gitignore
└── README.md
```

## npm Package Added

**`jsonwebtoken`** — the standard library for creating (`jwt.sign`) and verifying (`jwt.verify`) JSON Web Tokens in Node.js. It's the one new dependency this module needs; everything else (`bcrypt`, `mongoose`, `express`, `cors`, `dotenv`) was already installed in earlier modules.

## Environment Variables to Add

Add these two to `backend/.env` (already present as blanks in `.env.example`):

```
JWT_SECRET=replace_this_with_a_long_random_string
JWT_EXPIRES_IN=7d
```

Generate a strong random secret from a terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Paste the output as `JWT_SECRET`. Never commit this value or share it — anyone with it could forge valid tokens for your app.

## API Endpoints After Module 5

| Method | Endpoint | Protected? | Description |
|---|---|---|---|
| GET | `/` | No | Health check |
| POST | `/api/auth/register` | No | Register a user, returns a JWT |
| POST | `/api/auth/login` | No | Log in, returns a JWT |
| GET | `/api/auth/me` | **Yes** | Get your own profile + blog count |
| POST | `/api/blogs` | **Yes** | Create a blog (owned by you, from the token) |
| GET | `/api/blogs` | No | List all blogs (`?search=`, `?category=`) |
| GET | `/api/blogs/mine` | **Yes** | List only YOUR blogs |
| GET | `/api/blogs/:id` | No | Get one blog |
| PUT | `/api/blogs/:id` | **Yes** | Update a blog (owner only) |
| DELETE | `/api/blogs/:id` | **Yes** | Delete a blog (owner only) |

Protected routes require this header:
```
Authorization: Bearer <your_jwt_token>
```

### Example: Login response
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "665f1c...", "name": "Aditya Kasaudhan", "email": "aditya@example.com" }
}
```

### Example: calling a protected route with curl
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer PASTE_YOUR_TOKEN_HERE"
```

### Example error responses
```json
// No token at all
{ "success": false, "message": "No authentication token provided. Please log in." }

// Expired token
{ "success": false, "message": "Your session has expired. Please log in again." }

// Trying to edit someone else's blog
{ "success": false, "message": "You are not allowed to edit this blog." }
```

## Files Changed

| File | What changed |
|---|---|
| `backend/models/Blog.js` | Added `user` (ObjectId ref to `User`), not required (keeps old blogs working) |
| `backend/middleware/authMiddleware.js` | **New** — verifies JWT, attaches `req.user` |
| `backend/controllers/authController.js` | Added `generateToken()`, both register/login now return a token + `user.id`; added `getProfile()` |
| `backend/routes/authRoutes.js` | Added protected `GET /me` |
| `backend/controllers/blogController.js` | `createBlog` uses `req.user` instead of request body for identity; `updateBlog`/`deleteBlog` check `blog.user` instead of `authorEmail`; added `getMyBlogs` |
| `backend/routes/blogRoutes.js` | Added `authMiddleware` to POST/PUT/DELETE; added protected `GET /mine` |
| `backend/server.js` | Added a startup check that `JWT_SECRET` is set |
| `backend/package.json` | Added `jsonwebtoken` |
| `backend/.env` / `.env.example` | Added `JWT_SECRET`, `JWT_EXPIRES_IN` |
| `frontend/js/script.js` | Token storage, `Authorization` headers on protected calls, dashboard now uses `/blogs/mine`, ownership check uses `blog.user`, added Profile page logic, navbar shows Profile when logged in |
| `frontend/profile.html` | **New** — profile page |

## How to Run the Project

```bash
# Backend
cd backend
npm install                 # installs jsonwebtoken along with everything else
# Add JWT_SECRET (and confirm MONGO_URI) in backend/.env — see above
npm start                   # or: npm run dev

# Frontend
# Open the frontend folder in VS Code → right-click index.html → "Open with Live Server"
```

If `JWT_SECRET` is missing, the backend will print an error and exit immediately instead of starting in a broken state — check `backend/.env`.

## Testing Checklist (Module 5)

- [ ] Register a new user — response includes a `token`
- [ ] Log in — response includes a `token` and `user.id`
- [ ] Try `GET /api/auth/me` without a token → `401`
- [ ] Try `GET /api/auth/me` with your real token → your name, email, blog count
- [ ] Log in through the UI → land on Dashboard automatically
- [ ] Open Dashboard directly while logged out (clear localStorage first) → redirected to Login
- [ ] Create a blog while logged in → appears on Home and in your Dashboard
- [ ] Dashboard shows ONLY your own blogs, even if other users' blogs exist in the database
- [ ] Edit one of your blogs → changes save and reflect immediately
- [ ] Try editing a blog that belongs to another user by changing the ID in the URL → blocked with a clear message (frontend), and a direct API call with a mismatched token gets `403` (backend)
- [ ] Delete one of your blogs → confirmation prompt, then it disappears from Dashboard and Home
- [ ] Open Profile page → see your name, email, blog count, member-since date
- [ ] Click Logout → redirected to Login, and Dashboard/Profile/Create Blog are inaccessible again until you log back in
- [ ] Everything from Modules 1–4 (UI, public blog browsing, blog details, search/filter) still works unchanged

## Security & Quality Notes

- Passwords remain bcrypt-hashed and are never returned in any response.
- `JWT_SECRET` lives only in `backend/.env` (git-ignored) — never in frontend code or committed to GitHub.
- All blog IDs are validated with `mongoose.Types.ObjectId.isValid()` before querying.
- Every protected route returns clear, correct HTTP status codes: `401` (no/invalid/expired token or user no longer exists), `403` (valid token, but not the blog's owner), `404` (not found), `400` (bad input), `500` (unexpected server error).

## Future Improvements (Module 6+)

- Move the JWT from `localStorage` to an `httpOnly` cookie for stronger XSS protection
- Add refresh tokens so sessions can last longer without re-entering credentials, while keeping access tokens short-lived
- Add role-based access (e.g. an admin role that can moderate any blog)
- Add pagination to `GET /api/blogs`

---

Built for **Codomax Digital Solutions** — Full Stack Web Development Internship, Module 5.
