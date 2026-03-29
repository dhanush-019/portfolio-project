// ============================================================
//  DHANUSH S — Portfolio Backend (server.js)
//  Node.js + Express + TiDB Cloud (MySQL)
// ============================================================

require('dotenv').config();
const express    = require('express');
const mysql      = require('mysql2/promise');
const cors       = require('cors');
const path       = require('path');
const rateLimit  = require('express-rate-limit');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rate limit contact endpoint (10 req / 15 min per IP)
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many requests. Please try again later.' },
});

// ── TiDB Cloud Connection Pool ──────────────────────────────
const pool = mysql.createPool({
  host:            process.env.TIDB_HOST,
  port:            parseInt(process.env.TIDB_PORT || '4000'),
  user:            process.env.TIDB_USER,
  password:        process.env.TIDB_PASSWORD,
  database:        process.env.TIDB_DATABASE || 'portfolio_db',
  ssl:             { rejectUnauthorized: true },
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
});

// ── DB Init ─────────────────────────────────────────────────
async function initDB() {
  const conn = await pool.getConnection();
  try {
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        name       VARCHAR(100)  NOT NULL,
        email      VARCHAR(150)  NOT NULL,
        message    TEXT          NOT NULL,
        created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Database table ready.');
  } finally {
    conn.release();
  }
}

// ── Routes ──────────────────────────────────────────────────

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// POST /api/contact — store message
app.post('/api/contact', contactLimiter, async (req, res) => {
  const { name, email, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }
  if (name.length > 100 || email.length > 150 || message.length > 2000) {
    return res.status(400).json({ error: 'Input too long.' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, message) VALUES (?, ?, ?)',
      [name.trim(), email.trim(), message.trim()]
    );
    res.status(201).json({
      success: true,
      id: result.insertId,
      message: 'Message received! I will get back to you soon.',
    });
  } catch (err) {
    console.error('DB Error:', err.message);
    res.status(500).json({ error: 'Database error. Please try again.' });
  }
});

// GET /api/messages — retrieve all (admin/dev use)
app.get('/api/messages', async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, message, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ count: rows.length, data: rows });
  } catch (err) {
    console.error('DB Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
});

// SPA fallback — serve index.html for all other routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ────────────────────────────────────────────────────
async function start() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running → http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Startup failed:', err.message);
    process.exit(1);
  }
}
start();