# DevBlog – Glassmorphism Blog Platform

A premium, dark-themed, glassmorphism blog platform built with pure HTML, CSS and JavaScript. DevBlog lets developers register, log in, write stories, save drafts, publish posts and manage everything from a personal dashboard — all powered by the browser's `localStorage`, with no backend required.

## Internship

**Codomax Digital Solutions**
Full Stack Web Development Internship — **Module 1**

## Features

- Responsive glassmorphism UI with glowing purple/blue accents and blurred background orbs
- Sticky, blurred navbar with a mobile hamburger menu
- Landing page with hero section, 6 sample blog cards and a call-to-action section
- User registration with full form validation
- User login with validation, error messages and session persistence
- Auth-protected Dashboard and Create Blog pages (redirects to Login if not signed in)
- Dashboard with live statistics: Total Posts, Published, Drafts, Total Views
- Full blog management: create, edit, delete and list your stories
- Blog editor with Save Draft / Publish Blog / Cancel actions and field validation
- Empty state shown when no blogs exist yet
- Logout clears the session and returns to the Login page
- Toast-style notifications for success and error states
- Fully responsive: desktop, tablet and mobile, with no horizontal scrolling

## Technologies Used

- HTML5 (semantic markup)
- CSS3 (Flexbox, Grid, backdrop-filter glassmorphism, animations, media queries)
- Vanilla JavaScript (ES6+)
- Browser `localStorage` for all data persistence (users, sessions, blogs)

No frameworks, no build tools, no libraries — everything runs directly in the browser.

## Pages

| Page | File | Description |
|---|---|---|
| Home | `index.html` | Landing page, hero section, latest stories, CTA |
| Login | `login.html` | User login with validation |
| Register | `register.html` | User registration with validation |
| Dashboard | `dashboard.html` | Stats + manage your blog posts (protected) |
| Create Blog | `create-blog.html` | Write, edit, publish or draft a story (protected) |

## Project Structure

```
DevBlog/
│
├── index.html
├── login.html
├── register.html
├── dashboard.html
├── create-blog.html
│
├── css/
│   └── style.css
│
├── js/
│   └── script.js
│
├── assets/
│   └── images/
│
└── README.md
```

## How to Run

1. Open the `DevBlog` folder in **VS Code**.
2. Install the **Live Server** extension if you don't already have it.
3. Right-click `index.html` in the file explorer and choose **"Open with Live Server"**.
4. The site will open in your browser at an address like `http://127.0.0.1:5500/index.html`.
5. Navigate the site: create an account on **Register**, then **Login**, and try creating a blog from the **Dashboard**.

You can also just double-click `index.html` to open it directly in a browser, but Live Server is recommended for the best experience (auto-reload, correct relative paths).

## How LocalStorage Works

The app stores everything in the browser's `localStorage` under a few keys:

- `devblog_users` – array of registered accounts (name, email, password)
- `devblog_currentUser` – the currently logged-in user's session info
- `devblog_blogs` – array of all blog posts (title, category, description, content, status, author, date, views)
- `devblog_seeded` – a flag so sample blog posts are only added once, on first load

Because this is frontend-only demo data, everything is stored **locally in your browser** — clearing your browser's site data will reset the app. There is no real backend, database or password encryption; this module focuses purely on frontend structure, UI and client-side logic.

## Future Improvements

- Connect to a real backend (Node.js/Express + database) for persistent, multi-device storage
- Add password hashing and secure authentication (JWT/sessions)
- Add a full blog reading page with comments and likes
- Add image upload instead of image URLs
- Add search and category filtering on the Home page
- Add pagination for large numbers of blog posts
- Add rich text formatting in the blog editor

---

Built for **Codomax Digital Solutions** — Full Stack Web Development Internship, Module 1.
