const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'spincycle-secret-key',
  resave: false,
  saveUninitialized: false
}));

let db;

(async () => {
  db = await open({
    filename: './database.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'customer'
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      service TEXT NOT NULL,
      weight REAL NOT NULL,
      notes TEXT,
      status TEXT DEFAULT 'Pending',
      price REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  const adminExists = await db.get(`SELECT * FROM users WHERE role = 'admin'`);
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.run(
      `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
      ['Manager Admin', 'admin@spincycle.com', hashedPassword, 'admin']
    );
  }
})();

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/register', (req, res) => res.render('register', { error: null }));
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run(
      `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'customer')`,
      [name, email, hashedPassword]
    );
    res.redirect('/login');
  } catch (err) {
    res.render('register', { error: 'Email already registered.' });
  }
});

app.get('/login', (req, res) => res.render('login', { error: null }));
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await db.get(`SELECT * FROM users WHERE email = ?`, [email]);
  if (user && await bcrypt.compare(password, user.password)) {
    req.session.user = { id: user.id, name: user.name, role: user.role };
    return res.redirect('/dashboard');
  }
  res.render('login', { error: 'Invalid email or password.' });
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/dashboard', requireAuth, async (req, res) => {
  let orders;
  if (req.session.user.role === 'admin') {
    orders = await db.all(`
      SELECT orders.*, users.name as customer_name 
      FROM orders 
      JOIN users ON orders.user_id = users.id 
      ORDER BY orders.id DESC
    `);
  } else {
    orders = await db.all(
      `SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC`,
      [req.session.user.id]
    );
  }
  res.render('dashboard', { orders });
});

app.post('/orders/create', requireAuth, async (req, res) => {
  const { service, weight, notes } = req.body;
  const estimatedPrice = parseFloat(weight) * 35;
  await db.run(
    `INSERT INTO orders (user_id, service, weight, notes, price) VALUES (?, ?, ?, ?, ?)`,
    [req.session.user.id, service, weight, notes, estimatedPrice]
  );
  res.redirect('/dashboard');
});

app.post('/orders/update/:id', requireAuth, async (req, res) => {
  if (req.session.user.role !== 'admin') return res.status(403).send('Forbidden');
  const { status, price } = req.body;
  await db.run(
    `UPDATE orders SET status = ?, price = ? WHERE id = ?`,
    [status, price, req.params.id]
  );
  res.redirect('/dashboard');
});

app.post('/orders/delete/:id', requireAuth, async (req, res) => {
  if (req.session.user.role !== 'admin') return res.status(403).send('Forbidden');
  await db.run(`DELETE FROM orders WHERE id = ?`, [req.params.id]);
  res.redirect('/dashboard');
});

app.listen(PORT, () => {
  console.log(`SpinCycle server running on http://localhost:${PORT}`);
});