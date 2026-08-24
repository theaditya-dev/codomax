/**
 * data.js
 * ------------------------------------------------------------------
 * MODULE 2 uses simple in-memory JavaScript arrays instead of a real
 * database. This means all data (users + blogs) lives only in the
 * server's memory and RESETS every time the server restarts.
 *
 * Real database storage (MongoDB) is planned for Module 3 — do not
 * add a database here yet.
 * ------------------------------------------------------------------
 */

// Holds all registered users: { id, name, email, password }
// NOTE: passwords are stored as plain text for this learning module only.
// Real projects must hash passwords (e.g. with bcrypt) before storing them.
const users = [];

// Holds all blog posts: { id, title, category, description, content, author, status, date, views }
// Seeded with a few sample posts so the Home page isn't empty on first run.
const blogs = [
  {
    id: 'blog_seed_1',
    title: 'Why Every Developer Should Learn JavaScript in 2026',
    category: 'JavaScript',
    coverImage: '',
    description: 'JavaScript keeps evolving fast. Here is why it still deserves a spot at the top of your learning list.',
    content: 'JavaScript remains one of the most in-demand languages in the world. From frontend frameworks to backend runtimes, its reach keeps expanding every year.',
    author: 'Aditi Sharma',
    status: 'Published',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    views: 128
  },
  {
    id: 'blog_seed_2',
    title: 'Building Responsive Layouts with Modern CSS',
    category: 'Web Development',
    coverImage: '',
    description: 'A practical look at Grid, Flexbox and container queries for building interfaces that adapt to any screen.',
    content: 'Responsive design has changed a lot in the last few years. With CSS Grid and Flexbox working together, layouts are easier to reason about than ever.',
    author: 'Rohan Mehta',
    status: 'Published',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    views: 94
  },
  {
    id: 'blog_seed_3',
    title: 'A Beginner Friendly Guide to Clean Code',
    category: 'Programming',
    coverImage: '',
    description: 'Simple habits that make your code easier to read, easier to test, and easier to maintain over time.',
    content: 'Clean code is not about being clever. It is about being clear. Naming things well and keeping functions small goes a long way.',
    author: 'Sara Khan',
    status: 'Published',
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    views: 156
  },
  {
    id: 'blog_seed_4',
    title: 'How AI Tools Are Changing the Way We Write Code',
    category: 'AI',
    coverImage: '',
    description: 'From autocomplete to full pair-programming assistants, AI is reshaping daily developer workflows.',
    content: 'AI coding assistants have moved from novelty to necessity for many teams, speeding up boilerplate and helping with debugging.',
    author: 'Devansh Rao',
    status: 'Published',
    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    views: 87
  },
  {
    id: 'blog_seed_5',
    title: 'Landing Your First Internship as a Web Developer',
    category: 'Career',
    coverImage: '',
    description: 'Practical, honest advice on building a portfolio, applying smart, and standing out as a student.',
    content: 'Getting your first internship is often the hardest step. Recruiters are looking for curiosity and consistent effort, not perfection.',
    author: 'Priya Nair',
    status: 'Published',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    views: 61
  },
  {
    id: 'blog_seed_6',
    title: 'The Rise of Edge Computing and What It Means for You',
    category: 'Technology',
    coverImage: '',
    description: 'Edge computing is quietly changing how modern applications are built and deployed at scale.',
    content: 'Instead of sending every request to a distant server, edge computing brings logic closer to the user, reducing latency.',
    author: 'Karan Verma',
    status: 'Published',
    date: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    views: 73
  }
];

module.exports = { users, blogs };
