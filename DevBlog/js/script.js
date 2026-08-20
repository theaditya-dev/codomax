/* ==========================================================================
   DevBlog — script.js
   Codomax Digital Solutions — Full Stack Internship — Module 1
   All app logic: auth, blog CRUD, dashboard stats, notifications, nav menu
   ========================================================================== */

/* -------------------- Storage Keys -------------------- */
const STORAGE_KEYS = {
  USERS: 'devblog_users',
  CURRENT_USER: 'devblog_currentUser',
  BLOGS: 'devblog_blogs',
  SEEDED: 'devblog_seeded'
};

/* -------------------- Sample Blog Categories -------------------- */
const CATEGORIES = ['Web Development', 'JavaScript', 'Programming', 'AI', 'Technology', 'Career'];
const CATEGORY_ICONS = {
  'Web Development': '🌐',
  'JavaScript': '⚡',
  'Programming': '💻',
  'AI': '🤖',
  'Technology': '🚀',
  'Career': '🎯'
};

/* ==========================================================================
   USER / AUTH FUNCTIONS
   ========================================================================== */

function getUsers() {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

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

function registerUser(fullName, email, password) {
  const users = getUsers();

  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, message: 'An account with this email already exists.' };
  }

  const newUser = {
    id: 'user_' + Date.now(),
    fullName,
    email,
    password
  };

  users.push(newUser);
  saveUsers(users);

  return { success: true, message: 'Account created successfully!' };
}

function loginUser(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

  if (!user) {
    return { success: false, message: 'Invalid email or password.' };
  }

  setCurrentUser({ id: user.id, fullName: user.fullName, email: user.email });
  return { success: true, message: 'Login successful! Redirecting...' };
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
   BLOG FUNCTIONS
   ========================================================================== */

function getBlogs() {
  const data = localStorage.getItem(STORAGE_KEYS.BLOGS);
  return data ? JSON.parse(data) : [];
}

function saveBlogs(blogs) {
  localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(blogs));
}

function createBlog(blogData) {
  const blogs = getBlogs();
  const user = getCurrentUser();

  const newBlog = {
    id: 'blog_' + Date.now(),
    title: blogData.title,
    category: blogData.category,
    coverImage: blogData.coverImage || '',
    description: blogData.description,
    content: blogData.content,
    status: blogData.status,
    author: user ? user.fullName : 'Guest Author',
    date: new Date().toISOString(),
    views: Math.floor(Math.random() * 40)
  };

  blogs.unshift(newBlog);
  saveBlogs(blogs);
  return newBlog;
}

function editBlog(blogId, updates) {
  const blogs = getBlogs();
  const index = blogs.findIndex(b => b.id === blogId);

  if (index === -1) return false;

  blogs[index] = { ...blogs[index], ...updates };
  saveBlogs(blogs);
  return true;
}

function deleteBlog(blogId) {
  let blogs = getBlogs();
  blogs = blogs.filter(b => b.id !== blogId);
  saveBlogs(blogs);
}

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* -------------------- Seed sample blogs on first run -------------------- */
function seedSampleBlogs() {
  if (localStorage.getItem(STORAGE_KEYS.SEEDED)) return;

  const samples = [
    {
      title: 'Why Every Developer Should Learn JavaScript in 2026',
      category: 'JavaScript',
      description: 'JavaScript keeps evolving fast. Here is why it still deserves a spot at the top of your learning list.',
      content: 'JavaScript remains one of the most in-demand languages in the world. From frontend frameworks to backend runtimes, its reach keeps expanding every year...',
      author: 'Aditi Sharma',
      daysAgo: 2
    },
    {
      title: 'Building Responsive Layouts with Modern CSS',
      category: 'Web Development',
      description: 'A practical look at Grid, Flexbox and container queries for building interfaces that adapt to any screen.',
      content: 'Responsive design has changed a lot in the last few years. With CSS Grid and Flexbox working together, and container queries now widely supported...',
      author: 'Rohan Mehta',
      daysAgo: 4
    },
    {
      title: 'A Beginner Friendly Guide to Clean Code',
      category: 'Programming',
      description: 'Simple habits that make your code easier to read, easier to test, and easier to maintain over time.',
      content: 'Clean code is not about being clever. It is about being clear. Naming things well, keeping functions small, and avoiding duplication go a long way...',
      author: 'Sara Khan',
      daysAgo: 6
    },
    {
      title: 'How AI Tools Are Changing the Way We Write Code',
      category: 'AI',
      description: 'From autocomplete to full pair-programming assistants, AI is reshaping daily developer workflows.',
      content: 'AI coding assistants have moved from novelty to necessity for many teams. They speed up boilerplate, help with debugging, and act as a rubber duck...',
      author: 'Devansh Rao',
      daysAgo: 8
    },
    {
      title: 'Landing Your First Internship as a Web Developer',
      category: 'Career',
      description: 'Practical, honest advice on building a portfolio, applying smart, and standing out as a student.',
      content: 'Getting your first internship is often the hardest step. Recruiters are not expecting perfection, they are looking for curiosity and consistent effort...',
      author: 'Priya Nair',
      daysAgo: 10
    },
    {
      title: 'The Rise of Edge Computing and What It Means for You',
      category: 'Technology',
      description: 'Edge computing is quietly changing how modern applications are built and deployed at scale.',
      content: 'Instead of sending every request to a distant server, edge computing brings logic closer to the user. This reduces latency and improves reliability...',
      author: 'Karan Verma',
      daysAgo: 13
    }
  ];

  const seeded = samples.map((s, i) => {
    const date = new Date();
    date.setDate(date.getDate() - s.daysAgo);
    return {
      id: 'seed_' + i + '_' + Date.now(),
      title: s.title,
      category: s.category,
      coverImage: '',
      description: s.description,
      content: s.content,
      status: 'Published',
      author: s.author,
      date: date.toISOString(),
      views: 40 + Math.floor(Math.random() * 200)
    };
  });

  const existing = getBlogs();
  saveBlogs([...seeded, ...existing]);
  localStorage.setItem(STORAGE_KEYS.SEEDED, 'true');
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
  container.innerHTML = `<span>${icons[type] || ''}</span><span>${message}</span>`;

  requestAnimationFrame(() => container.classList.add('show'));

  clearTimeout(container._timeout);
  container._timeout = setTimeout(() => {
    container.classList.remove('show');
  }, 3200);
}

/* ==========================================================================
   RENDER: HOME PAGE BLOG CARDS
   ========================================================================== */

function renderHomeBlogs() {
  const grid = document.getElementById('blogGrid');
  if (!grid) return;

  const blogs = getBlogs()
    .filter(b => b.status === 'Published')
    .slice(0, 6);

  if (blogs.length === 0) {
    grid.innerHTML = `<p style="color:var(--text-muted); grid-column: 1/-1; text-align:center;">No stories published yet. Be the first to write one!</p>`;
    return;
  }

  grid.innerHTML = blogs.map(blog => `
    <article class="glass blog-card fade-in">
      <div class="blog-card-cover">${CATEGORY_ICONS[blog.category] || '📝'}</div>
      <div class="blog-card-body">
        <span class="badge">${blog.category}</span>
        <h3>${escapeHtml(blog.title)}</h3>
        <p>${escapeHtml(blog.description)}</p>
        <div class="blog-meta">
          <span>${escapeHtml(blog.author)}</span>
          <span>${formatDate(blog.date)}</span>
        </div>
        <a href="#" class="read-more" data-blog-id="${blog.id}">Read More →</a>
      </div>
    </article>
  `).join('');

  grid.querySelectorAll('.read-more').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const blog = getBlogs().find(b => b.id === link.dataset.blogId);
      if (blog) {
        showNotification(`Opening "${blog.title}" — full reading view coming in a future module.`, 'info');
      }
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

/* ==========================================================================
   RENDER: DASHBOARD
   ========================================================================== */

function renderDashboard() {
  const listEl = document.getElementById('blogList');
  const emptyEl = document.getElementById('emptyState');
  if (!listEl) return;

  const user = getCurrentUser();
  const allBlogs = getBlogs();
  const myBlogs = allBlogs.filter(b => !user || b.author === user.fullName || b.id.startsWith('blog_'));

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
    <div class="glass blog-list-item" data-id="${blog.id}">
      <div class="blog-list-info">
        <div class="list-icon">${CATEGORY_ICONS[blog.category] || '📝'}</div>
        <div>
          <h4>${escapeHtml(blog.title)}</h4>
          <div class="blog-list-meta">
            <span>${escapeHtml(blog.category)}</span>
            <span>•</span>
            <span>${formatDate(blog.date)}</span>
            <span class="status-pill ${blog.status === 'Published' ? 'status-published' : 'status-draft'}">${blog.status}</span>
          </div>
        </div>
      </div>
      <div class="blog-list-actions">
        <button class="btn btn-glass btn-sm edit-btn" data-id="${blog.id}">Edit</button>
        <button class="btn btn-danger btn-sm delete-btn" data-id="${blog.id}">Delete</button>
      </div>
    </div>
  `).join('');

  listEl.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Delete this blog post? This cannot be undone.')) {
        deleteBlog(btn.dataset.id);
        showNotification('Blog post deleted.', 'success');
        renderDashboard();
      }
    });
  });

  listEl.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = `create-blog.html?edit=${btn.dataset.id}`;
    });
  });
}

function setStat(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
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
        <span style="color:var(--text-muted); font-size:0.85rem;">Hi, ${escapeHtml(user.fullName.split(' ')[0])}</span>
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
   PAGE: LOGIN
   ========================================================================== */

function initLoginPage() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    valid = setFieldError(emailInput, emailError, email === '' ? 'Email is required.' : (!isValidEmail(email) ? 'Enter a valid email address.' : '')) && valid;
    valid = setFieldError(passwordInput, passwordError, password === '' ? 'Password is required.' : '') && valid;

    if (!valid) return;

    const result = loginUser(email, password);

    if (result.success) {
      showNotification(result.message, 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 900);
    } else {
      showNotification(result.message, 'error');
      setFieldError(passwordInput, passwordError, result.message);
    }
  });
}

/* ==========================================================================
   PAGE: REGISTER
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

  form.addEventListener('submit', (e) => {
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

    const result = registerUser(fullName, email, password);

    if (result.success) {
      showNotification(result.message, 'success');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1000);
    } else {
      showNotification(result.message, 'error');
      setFieldError(emailInput, emailError, result.message);
    }
  });
}

/* ==========================================================================
   PAGE: CREATE BLOG
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

  // Check if editing an existing blog
  const params = new URLSearchParams(window.location.search);
  const editId = params.get('edit');
  let editingBlog = null;

  if (editId) {
    editingBlog = getBlogs().find(b => b.id === editId);
    if (editingBlog) {
      document.getElementById('editorTitle').textContent = 'Edit Your Story';
      titleInput.value = editingBlog.title;
      categoryInput.value = editingBlog.category;
      coverInput.value = editingBlog.coverImage || '';
      descInput.value = editingBlog.description;
      contentInput.value = editingBlog.content;
    }
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
    return {
      title: titleInput.value.trim(),
      category: categoryInput.value,
      coverImage: coverInput.value.trim(),
      description: descInput.value.trim(),
      content: contentInput.value.trim(),
      status
    };
  }

  publishBtn.addEventListener('click', () => {
    if (!validateFields()) {
      showNotification('Please fill in all required fields.', 'error');
      return;
    }

    const data = collectData('Published');

    if (editingBlog) {
      editBlog(editingBlog.id, data);
      showNotification('Blog updated and published!', 'success');
    } else {
      createBlog(data);
      showNotification('Blog published successfully!', 'success');
    }

    setTimeout(() => { window.location.href = 'dashboard.html'; }, 900);
  });

  draftBtn.addEventListener('click', () => {
    if (titleInput.value.trim() === '') {
      setFieldError(titleInput, titleError, 'Blog title is required.');
      showNotification('Please add a title before saving as draft.', 'error');
      return;
    }

    const data = collectData('Draft');

    if (editingBlog) {
      editBlog(editingBlog.id, data);
      showNotification('Draft updated!', 'success');
    } else {
      createBlog(data);
      showNotification('Draft saved!', 'success');
    }

    setTimeout(() => { window.location.href = 'dashboard.html'; }, 900);
  });

  cancelBtn.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });
}

/* ==========================================================================
   INIT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  seedSampleBlogs();
  initNavbar();
  renderHomeBlogs();
  renderDashboard();
  initLoginPage();
  initRegisterPage();
  initCreateBlogPage();

  // Dashboard-only auth guard
  if (document.body.dataset.requireAuth === 'true') {
    requireAuth();
  }

  // Logout buttons (dashboard header)
  document.querySelectorAll('[data-logout]').forEach(btn => {
    btn.addEventListener('click', logoutUser);
  });

  // Redirect "Create New Blog" auth guard could go here if needed
});
