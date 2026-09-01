/* ==========================================================================
   DevBlog — script.js  (MODULE 4: full CRUD)
   Codomax Digital Solutions — Full Stack Internship

   MODULE 4 CHANGES from Module 3:
   - Added updateBlogApi() and deleteBlogApi() → PUT/DELETE /api/blogs/:id
   - Create Blog page now also handles EDITING: create-blog.html?edit=<id>
     loads the existing blog, prefills the form, and submits a PUT
     instead of a POST.
   - Dashboard "Your Stories" list now shows Edit and Delete buttons
     again (removed in Module 2/3 because there was no backend support
     for them yet — now there is).
   - Blog Details page shows Edit/Delete buttons ONLY when the logged-in
     user is the blog's author (checked against `authorEmail`).
   - Home page adds a search box (by title) and a category filter.
   - Every blog the frontend creates now also sends `authorEmail`, and
     every edit/delete request sends `requesterEmail` — this is how the
     backend checks that you can only edit/delete your own blogs (see
     the big comment in blogController.js for the full explanation of
     why this is "good enough for now" but not real authentication).
   ========================================================================== */

/* -------------------- Backend API base URL -------------------- */
const API_BASE_URL = 'http://localhost:5000/api';

/* -------------------- localStorage keys (session only) -------------------- */
const STORAGE_KEYS = {
  CURRENT_USER: 'devblog_currentUser'
};

/* -------------------- Category icons (frontend display only) -------------------- */
const CATEGORY_ICONS = {
  'Web Development': '🌐',
  'JavaScript': '⚡',
  'Programming': '💻',
  'AI': '🤖',
  'Technology': '🚀',
  'Career': '🎯'
};

const ALL_CATEGORIES = ['Web Development', 'JavaScript', 'Programming', 'AI', 'Technology', 'Career'];

/* ==========================================================================
   SESSION HELPERS (localStorage — client-side only, no backend session yet)
   ========================================================================== */

function getCurrentUser() {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
}

function setCurrentUser(user) {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

function isLoggedIn() {
  return getCurrentUser() !== null;
}

function logoutUser() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  window.location.href = 'login.html';
}

function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
  }
}

function isOwner(blog) {
  const user = getCurrentUser();
  return !!(user && blog.authorEmail && user.email && blog.authorEmail.toLowerCase() === user.email.toLowerCase());
}

/* ==========================================================================
   VALIDATION HELPERS
   ========================================================================== */

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function setFieldError(inputEl, errorEl, message) {
  if (message) {
    inputEl.classList.add('error');
    errorEl.textContent = message;
    return false;
  }
  inputEl.classList.remove('error');
  errorEl.textContent = '';
  return true;
}

/* ==========================================================================
   API HELPERS
   ------------------------------------------------------------------------
   apiRequest() wraps fetch() so every API call in this file shares the
   same error handling: it always returns { success, message, ...data }
   even if the server is unreachable, so calling code never has to deal
   with a rejected promise directly.
   ========================================================================== */

async function apiRequest(path, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });

    // Try to parse JSON even for error responses (our backend always sends JSON)
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      data = { success: false, message: 'Received an unexpected response from the server.' };
    }

    if (!response.ok && data.success === undefined) {
      data.success = false;
    }

    return data;
  } catch (networkError) {
    // This runs if the backend server isn't running / unreachable
    console.error('Network error calling API:', networkError);
    return {
      success: false,
      message: 'Could not reach the server. Make sure the backend is running at ' + API_BASE_URL + '.'
    };
  }
}

/* ==========================================================================
   AUTH API CALLS
   ========================================================================== */

async function registerUser(name, email, password) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  });
}

async function loginUser(email, password) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

/* ==========================================================================
   BLOG API CALLS (full CRUD)
   ========================================================================== */

async function fetchBlogs(queryParams = {}) {
  const params = new URLSearchParams();
  if (queryParams.search) params.set('search', queryParams.search);
  if (queryParams.category) params.set('category', queryParams.category);
  const queryString = params.toString();

  const result = await apiRequest(`/blogs${queryString ? '?' + queryString : ''}`, { method: 'GET' });
  if (result.success) {
    return result.blogs || [];
  }
  showNotification(result.message || 'Could not load blogs.', 'error');
  return [];
}

async function fetchBlogById(id) {
  return apiRequest(`/blogs/${id}`, { method: 'GET' });
}

async function createBlogApi(blogData) {
  return apiRequest('/blogs', {
    method: 'POST',
    body: JSON.stringify(blogData)
  });
}

async function updateBlogApi(id, blogData) {
  return apiRequest(`/blogs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(blogData)
  });
}

async function deleteBlogApi(id, requesterEmail) {
  return apiRequest(`/blogs/${id}`, {
    method: 'DELETE',
    body: JSON.stringify({ requesterEmail })
  });
}

function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

/* ==========================================================================
   NOTIFICATIONS
   ========================================================================== */

function showNotification(message, type = 'info') {
  let container = document.getElementById('notification');

  if (!container) {
    container = document.createElement('div');
    container.id = 'notification';
    document.body.appendChild(container);
  }

  const icons = { success: '✅', error: '⚠️', info: 'ℹ️' };

  container.className = 'notification ' + type;
  container.innerHTML = `<span>${icons[type] || ''}</span><span>${escapeHtml(message)}</span>`;

  requestAnimationFrame(() => container.classList.add('show'));

  clearTimeout(container._timeout);
  container._timeout = setTimeout(() => {
    container.classList.remove('show');
  }, 3500);
}

/* ==========================================================================
   RENDER: HOME PAGE BLOG CARDS (GET /api/blogs) + search & category filter
   ========================================================================== */

let homeBlogsCache = [];

async function renderHomeBlogs(queryParams = {}) {
  const grid = document.getElementById('blogGrid');
  if (!grid) return;

  grid.innerHTML = `<p style="color:var(--text-muted); grid-column: 1/-1; text-align:center;">Loading stories...</p>`;

  const allBlogs = await fetchBlogs(queryParams);
  homeBlogsCache = allBlogs;
  const blogs = allBlogs.filter(b => b.status === 'Published').slice(0, 12);

  if (blogs.length === 0) {
    const hasFilters = queryParams.search || queryParams.category;
    grid.innerHTML = `<p style="color:var(--text-muted); grid-column: 1/-1; text-align:center;">${
      hasFilters ? 'No stories match your search or filter.' : 'No stories published yet. Be the first to write one!'
    }</p>`;
    return;
  }

  grid.innerHTML = blogs.map(blog => `
    <article class="glass blog-card fade-in">
      <div class="blog-card-cover">${CATEGORY_ICONS[blog.category] || '📝'}</div>
      <div class="blog-card-body">
        <span class="badge">${escapeHtml(blog.category)}</span>
        <h3>${escapeHtml(blog.title)}</h3>
        <p>${escapeHtml(blog.description)}</p>
        <div class="blog-meta">
          <span>${escapeHtml(blog.author)}</span>
          <span>${formatDate(blog.createdAt)}</span>
        </div>
        <a href="blog-details.html?id=${blog._id}" class="read-more">Read More →</a>
      </div>
    </article>
  `).join('');
}

function initHomeFilters() {
  const searchInput = document.getElementById('blogSearch');
  const categorySelect = document.getElementById('categoryFilter');
  if (!searchInput && !categorySelect) return;

  let debounceTimer;

  function runFilter() {
    const search = searchInput ? searchInput.value.trim() : '';
    const category = categorySelect ? categorySelect.value : '';
    renderHomeBlogs({ search, category });
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(runFilter, 300); // wait for typing to pause
    });
  }

  if (categorySelect) {
    categorySelect.innerHTML = '<option value="">All Categories</option>' +
      ALL_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');
    categorySelect.addEventListener('change', runFilter);
  }
}

/* ==========================================================================
   RENDER: DASHBOARD (GET /api/blogs, filtered to the logged-in user)
   ========================================================================== */

async function renderDashboard() {
  const listEl = document.getElementById('blogList');
  const emptyEl = document.getElementById('emptyState');
  if (!listEl) return;

  const user = getCurrentUser();
  listEl.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:20px 0;">Loading your stories...</p>`;

  const allBlogs = await fetchBlogs();
  const myBlogs = user ? allBlogs.filter(b => b.authorEmail && b.authorEmail.toLowerCase() === user.email.toLowerCase()) : [];

  const totalPosts = myBlogs.length;
  const published = myBlogs.filter(b => b.status === 'Published').length;
  const drafts = myBlogs.filter(b => b.status === 'Draft').length;
  const totalViews = myBlogs.reduce((sum, b) => sum + (b.views || 0), 0);

  setStat('statTotal', totalPosts);
  setStat('statPublished', published);
  setStat('statDrafts', drafts);
  setStat('statViews', totalViews);

  if (myBlogs.length === 0) {
    listEl.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';

  listEl.innerHTML = myBlogs.map(blog => `
    <div class="glass blog-list-item" data-id="${blog._id}">
      <div class="blog-list-info">
        <div class="list-icon">${CATEGORY_ICONS[blog.category] || '📝'}</div>
        <div>
          <h4>${escapeHtml(blog.title)}</h4>
          <div class="blog-list-meta">
            <span>${escapeHtml(blog.category)}</span>
            <span>•</span>
            <span>${formatDate(blog.createdAt)}</span>
            <span class="status-pill ${blog.status === 'Published' ? 'status-published' : 'status-draft'}">${blog.status}</span>
          </div>
        </div>
      </div>
      <div class="blog-list-actions">
        <a href="blog-details.html?id=${blog._id}" class="btn btn-glass btn-sm">View</a>
        <button class="btn btn-glass btn-sm edit-btn" data-id="${blog._id}">Edit</button>
        <button class="btn btn-danger btn-sm delete-btn" data-id="${blog._id}">Delete</button>
      </div>
    </div>
  `).join('');

  listEl.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = `create-blog.html?edit=${btn.dataset.id}`;
    });
  });

  listEl.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this blog post? This cannot be undone.')) return;

      const currentUser = getCurrentUser();
      const result = await deleteBlogApi(btn.dataset.id, currentUser ? currentUser.email : '');

      if (result.success) {
        showNotification('Blog deleted successfully.', 'success');
        renderDashboard();
      } else {
        showNotification(result.message || 'Could not delete this blog.', 'error');
      }
    });
  });
}

function setStat(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

/* ==========================================================================
   RENDER: BLOG DETAILS PAGE (GET /api/blogs/:id) + owner Edit/Delete
   ========================================================================== */

async function initBlogDetailsPage() {
  const container = document.getElementById('blogDetails');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const blogId = params.get('id');

  if (!blogId) {
    container.innerHTML = renderBlogDetailsError(
      'No blog was specified.',
      'This link is missing a blog ID.'
    );
    return;
  }

  container.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:60px 0;">Loading story...</p>`;

  const result = await fetchBlogById(blogId);

  if (!result.success) {
    container.innerHTML = renderBlogDetailsError(
      'Blog not found.',
      result.message || 'This story may have been removed or the link is incorrect.'
    );
    return;
  }

  const blog = result.blog;
  document.title = `${blog.title} – DevBlog`;
  const owner = isOwner(blog);

  container.innerHTML = `
    <div class="glass editor-card fade-in" style="max-width:820px;">
      <span class="badge">${escapeHtml(blog.category)}</span>
      <h1 style="margin-top:14px; font-size:2rem; line-height:1.3;">${escapeHtml(blog.title)}</h1>

      <div class="blog-meta" style="border:none; padding:0; margin:18px 0 0;">
        <span>By ${escapeHtml(blog.author)}</span>
        <span>${formatDate(blog.createdAt)}</span>
      </div>

      ${blog.coverImage ? `
        <div style="margin-top:26px; border-radius:var(--radius-md); overflow:hidden; border:1px solid var(--border);">
          <img src="${escapeHtml(blog.coverImage)}" alt="${escapeHtml(blog.title)}" style="width:100%; display:block;" onerror="this.parentElement.style.display='none';">
        </div>
      ` : ''}

      <p style="color:var(--text-muted); font-size:1.05rem; margin-top:26px; border-left:2px solid var(--accent); padding-left:16px;">
        ${escapeHtml(blog.description)}
      </p>

      <div style="margin-top:24px; white-space:pre-wrap; line-height:1.9; color:var(--text);">${escapeHtml(blog.content)}</div>

      <div style="margin-top:40px; display:flex; gap:14px; flex-wrap:wrap;">
        <a href="index.html" class="btn btn-glass">← Back to Blogs</a>
        ${owner ? `
          <button class="btn btn-primary" id="detailsEditBtn">Edit Blog</button>
          <button class="btn btn-danger" id="detailsDeleteBtn">Delete Blog</button>
        ` : ''}
      </div>
    </div>
  `;

  if (owner) {
    document.getElementById('detailsEditBtn').addEventListener('click', () => {
      window.location.href = `create-blog.html?edit=${blog._id}`;
    });

    document.getElementById('detailsDeleteBtn').addEventListener('click', async () => {
      if (!confirm('Delete this blog post? This cannot be undone.')) return;

      const currentUser = getCurrentUser();
      const deleteResult = await deleteBlogApi(blog._id, currentUser ? currentUser.email : '');

      if (deleteResult.success) {
        showNotification('Blog deleted successfully.', 'success');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
      } else {
        showNotification(deleteResult.message || 'Could not delete this blog.', 'error');
      }
    });
  }
}

function renderBlogDetailsError(heading, message) {
  return `
    <div class="glass empty-state fade-in" style="max-width:600px; margin:0 auto;">
      <div class="empty-icon">🔍</div>
      <h3>${escapeHtml(heading)}</h3>
      <p>${escapeHtml(message)}</p>
      <a href="index.html" class="btn btn-primary">← Back to Blogs</a>
    </div>
  `;
}

/* ==========================================================================
   NAVBAR: mobile menu + active link + auth-aware buttons
   ========================================================================== */

function initNavbar() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
  }

  // Highlight current page
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a[data-page]').forEach(link => {
    if (link.dataset.page === current) {
      link.classList.add('active');
    }
  });

  // Auth-aware nav actions
  const navActions = document.getElementById('navActions');
  const navActionsMobile = document.getElementById('navActionsMobile');
  const user = getCurrentUser();

  [navActions, navActionsMobile].forEach(container => {
    if (!container) return;
    if (user) {
      container.innerHTML = `
        <span style="color:var(--text-muted); font-size:0.85rem;">Hi, ${escapeHtml(user.name.split(' ')[0])}</span>
        <a href="dashboard.html" class="btn btn-glass btn-sm">Dashboard</a>
        <button class="btn btn-primary btn-sm" id="navLogout">Logout</button>
      `;
      const logoutBtn = container.querySelector('#navLogout');
      if (logoutBtn) logoutBtn.addEventListener('click', logoutUser);
    } else {
      container.innerHTML = `
        <a href="login.html" class="btn btn-glass btn-sm">Login</a>
        <a href="register.html" class="btn btn-primary btn-sm">Register</a>
      `;
    }
  });
}

/* ==========================================================================
   PAGE: LOGIN  →  POST /api/auth/login
   ========================================================================== */

function initLoginPage() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let valid = true;
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    valid = setFieldError(emailInput, emailError, email === '' ? 'Email is required.' : (!isValidEmail(email) ? 'Enter a valid email address.' : '')) && valid;
    valid = setFieldError(passwordInput, passwordError, password === '' ? 'Password is required.' : '') && valid;

    if (!valid) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    const result = await loginUser(email, password);

    submitBtn.disabled = false;
    submitBtn.textContent = 'Login';

    if (result.success) {
      showNotification(result.message || 'Login successful!', 'success');
      // Only safe user info (name + email) is stored — never the password.
      setCurrentUser(result.user);
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 800);
    } else {
      showNotification(result.message || 'Login failed.', 'error');
      setFieldError(passwordInput, passwordError, result.message || 'Invalid email or password.');
    }
  });
}

/* ==========================================================================
   PAGE: REGISTER  →  POST /api/auth/register
   ========================================================================== */

function initRegisterPage() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  const nameInput = document.getElementById('fullName');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmInput = document.getElementById('confirmPassword');
  const termsInput = document.getElementById('terms');

  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const confirmError = document.getElementById('confirmError');
  const termsError = document.getElementById('termsError');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let valid = true;
    const fullName = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;

    valid = setFieldError(nameInput, nameError, fullName === '' ? 'Full name is required.' : '') && valid;
    valid = setFieldError(emailInput, emailError, email === '' ? 'Email is required.' : (!isValidEmail(email) ? 'Enter a valid email address.' : '')) && valid;
    valid = setFieldError(passwordInput, passwordError, password === '' ? 'Password is required.' : (password.length < 6 ? 'Password must be at least 6 characters.' : '')) && valid;
    valid = setFieldError(confirmInput, confirmError, confirmPassword === '' ? 'Please confirm your password.' : (confirmPassword !== password ? 'Passwords do not match.' : '')) && valid;

    if (termsError) {
      if (!termsInput.checked) {
        termsError.textContent = 'You must agree to the Terms & Conditions.';
        valid = false;
      } else {
        termsError.textContent = '';
      }
    }

    if (!valid) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    const result = await registerUser(fullName, email, password);

    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Account';

    if (result.success) {
      showNotification(result.message || 'Account created!', 'success');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 900);
    } else {
      showNotification(result.message || 'Registration failed.', 'error');
      setFieldError(emailInput, emailError, result.message || '');
    }
  });
}

/* ==========================================================================
   PAGE: CREATE BLOG  →  POST /api/blogs   (or EDIT →  PUT /api/blogs/:id)
   ========================================================================== */

function initCreateBlogPage() {
  const form = document.getElementById('blogForm');
  if (!form) return;

  const titleInput = document.getElementById('blogTitle');
  const categoryInput = document.getElementById('blogCategory');
  const coverInput = document.getElementById('blogCover');
  const descInput = document.getElementById('blogDescription');
  const contentInput = document.getElementById('blogContent');

  const titleError = document.getElementById('titleError');
  const categoryError = document.getElementById('categoryError');
  const descError = document.getElementById('descError');
  const contentError = document.getElementById('contentError');

  const publishBtn = document.getElementById('publishBtn');
  const draftBtn = document.getElementById('draftBtn');
  const cancelBtn = document.getElementById('cancelBtn');

  const params = new URLSearchParams(window.location.search);
  const editId = params.get('edit');
  let editingBlog = null;

  // ---------- If ?edit=<id>, load the existing blog and prefill the form ----------
  async function loadBlogForEditing() {
    const result = await fetchBlogById(editId);

    if (!result.success) {
      showNotification(result.message || 'Could not load this blog for editing.', 'error');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 1200);
      return;
    }

    const blog = result.blog;

    if (!isOwner(blog)) {
      showNotification('You are not allowed to edit this blog.', 'error');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 1200);
      return;
    }

    editingBlog = blog;
    const titleEl = document.getElementById('editorTitle');
    if (titleEl) titleEl.textContent = 'Edit Your Story';
    if (publishBtn) publishBtn.textContent = 'Update Blog';

    titleInput.value = blog.title;
    categoryInput.value = blog.category;
    coverInput.value = blog.coverImage || '';
    descInput.value = blog.description;
    contentInput.value = blog.content;
  }

  if (editId) {
    loadBlogForEditing();
  }

  function validateFields() {
    let valid = true;
    valid = setFieldError(titleInput, titleError, titleInput.value.trim() === '' ? 'Blog title is required.' : '') && valid;
    valid = setFieldError(categoryInput, categoryError, categoryInput.value === '' ? 'Please select a category.' : '') && valid;
    valid = setFieldError(descInput, descError, descInput.value.trim() === '' ? 'Short description is required.' : '') && valid;
    valid = setFieldError(contentInput, contentError, contentInput.value.trim() === '' ? 'Blog content is required.' : '') && valid;
    return valid;
  }

  function collectData(status) {
    const user = getCurrentUser();
    return {
      title: titleInput.value.trim(),
      category: categoryInput.value,
      coverImage: coverInput.value.trim(),
      description: descInput.value.trim(),
      content: contentInput.value.trim(),
      author: user ? user.name : 'Guest Author',
      authorEmail: user ? user.email : '',
      status
    };
  }

  async function submitBlog(status, triggerBtn, loadingText, successMessage) {
    const originalText = triggerBtn.textContent;
    triggerBtn.disabled = true;
    triggerBtn.textContent = loadingText;

    const data = collectData(status);
    const user = getCurrentUser();

    const result = editingBlog
      ? await updateBlogApi(editingBlog._id, { ...data, requesterEmail: user ? user.email : '' })
      : await createBlogApi(data);

    triggerBtn.disabled = false;
    triggerBtn.textContent = originalText;

    if (result.success) {
      showNotification(successMessage, 'success');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 900);
    } else {
      showNotification(result.message || 'Could not save the blog.', 'error');
    }
  }

  publishBtn.addEventListener('click', () => {
    if (!validateFields()) {
      showNotification('Please fill in all required fields.', 'error');
      return;
    }
    submitBlog('Published', publishBtn, editingBlog ? 'Updating...' : 'Publishing...', editingBlog ? 'Blog updated successfully!' : 'Blog published successfully!');
  });

  draftBtn.addEventListener('click', () => {
    if (titleInput.value.trim() === '') {
      setFieldError(titleInput, titleError, 'Blog title is required.');
      showNotification('Please add a title before saving as draft.', 'error');
      return;
    }
    submitBlog('Draft', draftBtn, 'Saving...', editingBlog ? 'Draft updated!' : 'Draft saved!');
  });

  cancelBtn.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });
}

/* ==========================================================================
   INIT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHomeFilters();
  renderHomeBlogs();
  renderDashboard();
  initLoginPage();
  initRegisterPage();
  initCreateBlogPage();
  initBlogDetailsPage();

  // Dashboard / Create Blog auth guard (client-side only, no backend session yet)
  if (document.body.dataset.requireAuth === 'true') {
    requireAuth();
  }

  // Logout buttons (dashboard header)
  document.querySelectorAll('[data-logout]').forEach(btn => {
    btn.addEventListener('click', logoutUser);
  });
});
