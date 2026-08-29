# DevBlog – Glassmorphism Blog Platform

A dark-themed, glassmorphism blog platform, built in three stages:
**Module 1** (frontend UI) → **Module 2** (Express REST API + in-memory data) → **Module 3** (MongoDB Atlas database, secure passwords, individual blog pages).

## Internship

**Codomax Digital Solutions** — Full Stack Web Development Internship
**Module 3 — Database Integration (Day 9 – Day 12)**

Repository: https://github.com/theaditya-dev/codomax

## What's New in Module 3

- Connected the backend to **MongoDB Atlas** using **Mongoose**
- Replaced the Module 2 in-memory `users` and `blogs` arrays with real **User** and **Blog** collections in MongoDB
- Passwords are now **hashed with bcrypt** before being saved — plain-text passwords are never stored or returned
- Added `GET /api/blogs/:id` and a new **Blog Details** page (`blog-details.html`) so each story has its own shareable page
- Home page "Read More" and the Dashboard's story list now link to `blog-details.html?id=<mongoId>`
- The old `backend/data/data.js` (Module 2's in-memory storage) has been **removed** — see "About the old `data.js`" below for why that was safe to do
- The dark glassmorphism UI, layout, navbar, pages and design from Modules 1–2 are **unchanged**

## Technologies

**Frontend:** HTML5, CSS3 (glassmorphism, responsive design), Vanilla JavaScript (`fetch()`)
**Backend:** Node.js, Express.js, Mongoose, bcrypt, cors, dotenv
**Database:** MongoDB Atlas (cloud-hosted MongoDB)

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
│   ├── blog-details.html      ← NEW in Module 3
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── script.js          ← updated for MongoDB fields + blog details
│   └── assets/
│
├── backend/
│   ├── server.js               ← now connects to MongoDB before listening
│   ├── package.json            ← added mongoose + bcrypt
│   ├── .env                    ← your local secrets (never committed)
│   ├── .env.example
│   ├── config/
│   │   └── db.js               ← NEW: Mongoose connection logic
│   ├── models/
│   │   ├── User.js             ← NEW: Mongoose User schema
│   │   └── Blog.js             ← NEW: Mongoose Blog schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── blogRoutes.js       ← added GET /:id
│   └── controllers/
│       ├── authController.js   ← rewritten to use MongoDB + bcrypt
│       └── blogController.js   ← rewritten to use MongoDB + getBlogById
│
├── .gitignore                  ← NEW: protects .env and node_modules
└── README.md
```

### About the old `data.js`

Module 2's `backend/data/data.js` held the in-memory `users` and `blogs` arrays. After switching the controllers to use the `User` and `Blog` Mongoose models, nothing in the project imports `data.js` anymore — it was fully dead code, so it has been deleted rather than left behind. If you ever want to double-check that yourself in the future, `grep -r "data/data" backend` is a quick way to confirm nothing references it.

## Database Models

### User (`backend/models/User.js`)
| Field | Type | Notes |
|---|---|---|
| `name` | String | required |
| `email` | String | required, unique, lowercase, validated format |
| `password` | String | required, stores a **bcrypt hash**, never plain text |
| `createdAt` | Date | defaults to now |

### Blog (`backend/models/Blog.js`)
| Field | Type | Notes |
|---|---|---|
| `title` | String | required |
| `category` | String | required, one of: Web Development, JavaScript, Programming, AI, Technology, Career |
| `description` | String | required |
| `content` | String | required |
| `author` | String | required |
| `coverImage` | String | optional |
| `status` | String | `Published` or `Draft`, defaults to `Published` |
| `views` | Number | defaults to `0` |
| `createdAt` / `updatedAt` | Date | added automatically by Mongoose (`timestamps: true`) |

## Environment Variables

`backend/.env` (this file is **git-ignored** and never uploaded):

```
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

`backend/.env.example` (safe to commit — shows the shape without real values):

```
MONGO_URI=
PORT=5000
```

## MongoDB Atlas Setup (Beginner-Friendly)

1. **Create an account:** Go to https://www.mongodb.com/cloud/atlas/register and sign up (email or Google).
2. **Create a free cluster:** Click **"Build a Database"**, choose the **free M0 tier**, pick any cloud provider/region close to you, and click **Create**.
3. **Create a database user:** In the setup wizard (or later under **Database Access**), click **Add New Database User**. Choose a username, then click **Autogenerate Secure Password** and copy it somewhere safe. This is the password for your database, not your Atlas account.
4. **Set Network Access:** Under **Network Access**, click **Add IP Address**. For learning/development, choose **"Allow Access from Anywhere"** (`0.0.0.0/0`). For real production apps you'd restrict this later.
5. **Get your connection string:** Go to **Database** → click **Connect** on your cluster → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Add it to `.env`:** Open `backend/.env`, replace `<username>` and `<password>` with your real database username/password, and add a database name before the `?`, e.g.:
   ```
   MONGO_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/devblog?retryWrites=true&w=majority
   PORT=5000
   ```
   *(Never paste this real string into a chat, GitHub issue, or public repo — it contains your database password.)*
7. **Run the backend** (see below) and check the terminal.
8. **Confirm the connection:** You should see:
   ```
   ✅ MongoDB connected successfully
   DevBlog API is running at http://localhost:5000
   ```
   If instead you see `❌ MongoDB connection failed`, double-check your username, password, and that your IP is allowed under Network Access.

## Installation & How to Run the Backend

```bash
# 1. Move into the backend folder
cd backend

# 2. Install all dependencies (express, cors, dotenv, mongoose, bcrypt, nodemon)
npm install

# 3. Make sure backend/.env has your real MONGO_URI (see setup steps above)

# 4. Start the server
npm start

# or, for auto-restart during development:
npm run dev
```

## How to Run the Frontend

1. Open the `frontend` folder in VS Code.
2. Install the **Live Server** extension if you don't have it.
3. Right-click `index.html` → **"Open with Live Server."**
4. Keep the backend running in a separate terminal at the same time.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check — confirms the API is running |
| POST | `/api/auth/register` | Register a new user (saved to MongoDB, password hashed) |
| POST | `/api/auth/login` | Log in (verifies hashed password with bcrypt) |
| POST | `/api/blogs` | Create a new blog post (saved to MongoDB) |
| GET | `/api/blogs` | Get all blog posts, newest first |
| GET | `/api/blogs/:id` | Get one blog post by its MongoDB `_id` |

### `POST /api/auth/register`
```json
{ "name": "Aditya Kasaudhan", "email": "aditya@example.com", "password": "123456" }
```
**201 success:** `{ "success": true, "message": "Registration successful" }`
**409 duplicate email:** `{ "success": false, "message": "An account with this email already exists." }`

### `POST /api/auth/login`
```json
{ "email": "aditya@example.com", "password": "123456" }
```
**200 success:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": { "name": "Aditya Kasaudhan", "email": "aditya@example.com" }
}
```
**401 wrong credentials:** `{ "success": false, "message": "Invalid email or password." }`

### `POST /api/blogs`
```json
{
  "title": "My First Blog",
  "category": "Web Development",
  "description": "Short description",
  "content": "Blog content",
  "author": "Aditya Kasaudhan"
}
```
**201 success:** `{ "success": true, "message": "Blog created successfully", "blog": { "_id": "...", "title": "...", "createdAt": "...", "...": "..." } }`

### `GET /api/blogs`
**200 success:** `{ "success": true, "count": 3, "blogs": [ { "_id": "...", "...": "..." } ] }`

### `GET /api/blogs/:id`
**200 success:** `{ "success": true, "blog": { "_id": "...", "...": "..." } }`
**400 invalid id format:** `{ "success": false, "message": "Invalid blog ID." }`
**404 not found:** `{ "success": false, "message": "Blog not found." }`

## How to Test Each API

You can use **Postman**, **Thunder Client** (VS Code extension), or `curl`.

```bash
# Health check
curl http://localhost:5000/

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"123456\"}"

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"123456\"}"

# Create a blog
curl -X POST http://localhost:5000/api/blogs \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"My First Blog\",\"category\":\"Web Development\",\"description\":\"A test post\",\"content\":\"Hello world\",\"author\":\"Test User\"}"

# Get all blogs
curl http://localhost:5000/api/blogs

# Get one blog (replace with a real _id from the response above)
curl http://localhost:5000/api/blogs/PASTE_BLOG_ID_HERE
```

You can also just use the DevBlog UI itself: register → log in → create a blog → see it on Home and Dashboard → click "Read More" to open its details page.

## Security Notes

- Passwords are hashed with **bcrypt** (10 salt rounds) before being saved — the plain-text password is never stored or logged.
- Login responses only ever include `name` and `email` — the password/hash is never sent back to the frontend.
- `.env` (with your real MongoDB connection string) is listed in `.gitignore` and must never be committed or shared.
- `.env.example` is the safe, credential-free template that IS meant to be committed.

## Testing Checklist (Module 3)

- [x] MongoDB connection succeeds on server start
- [x] User registration saves a new document in the `users` collection
- [x] Stored password is a bcrypt hash, not plain text
- [x] Login verifies the hash with `bcrypt.compare()`
- [x] Duplicate email returns `409` on register
- [x] Wrong credentials return `401` on login
- [x] Create Blog saves a document in the `blogs` collection
- [x] Get All Blogs returns blogs sorted newest-first
- [x] Home page renders blogs fetched from MongoDB
- [x] Dashboard renders and calculates stats from MongoDB data
- [x] "Read More" links to `blog-details.html?id=...`
- [x] Blog Details page fetches and displays the correct blog
- [x] Invalid/malformed blog ID returns `400`
- [x] Non-existent blog ID returns `404`
- [x] CORS allows the frontend (Live Server origin) to call the API
- [x] Responsive layout and glassmorphism styling unchanged
- [x] No `.env` or credentials committed to Git

## What to Screenshot for Your Codomax Module 3 Submission

1. Terminal showing `✅ MongoDB connected successfully` and `DevBlog API is running at http://localhost:5000`
2. MongoDB Atlas dashboard showing your cluster and the `devblog` database with `users` and `blogs` collections populated
3. A user document in Atlas showing the hashed password (proves it isn't plain text)
4. Postman/Thunder Client/browser screenshot of a successful `POST /api/auth/register` response
5. Postman/Thunder Client/browser screenshot of a successful `POST /api/auth/login` response
6. The Home page showing blogs loaded from the database
7. The Dashboard page showing your stats and story list
8. The new **Blog Details page** open for a specific blog (showing the full content and the "Back to Blogs" button)
9. A `GET /api/blogs/:id` request with an invalid ID, showing the `400`/`404` error response

## Future Improvements (Module 4+)

- Add PUT `/api/blogs/:id` and DELETE `/api/blogs/:id` so Dashboard editing/deleting works against the database
- Add JWT-based authentication for protected routes instead of a client-only session
- Add pagination and search/category filtering to `GET /api/blogs`
- Add image upload instead of raw cover-image URLs

---

Built for **Codomax Digital Solutions** — Full Stack Web Development Internship, Module 3.
