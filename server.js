// ============================================================
//  DHANUSH S — Portfolio Backend (FINAL FIXED)
// ============================================================

require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 4000;

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==================== RATE LIMIT ====================
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many requests. Try again later.' },
});

// ==================== DATABASE ====================
const pool = mysql.createPool({
  host: process.env.TIDB_HOST,
  port: Number(process.env.TIDB_PORT) || 4000,
  user: process.env.TIDB_USER,
  password: process.env.TIDB_PASSWORD,
  database: process.env.TIDB_DATABASE,

  ssl: {
    rejectUnauthorized: false, // 🔥 FIX
  },

  connectTimeout: 10000, // 🔥 prevents hanging
  waitForConnections: true,
  connectionLimit: 10,
});

// ==================== TEST DB CONNECTION ====================
async function testDB() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ DB CONNECTED SUCCESSFULLY');
    conn.release();
  } catch (err) {
    console.error('❌ DB CONNECTION FAILED:', err.message);
    throw err;
  }
}

// ==================== INIT DB ====================
async function initDB() {
  const conn = await pool.getConnection();
  try {
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Database table ready.');
  } catch (err) {
    console.error('❌ DB Init Error:', err.message);
    throw err;
  } finally {
    conn.release();
  }
}

// ==================== ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Contact form API
app.post('/api/contact', contactLimiter, async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields required' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, message) VALUES (?, ?, ?)',
      [name.trim(), email.trim(), message.trim()]
    );

    res.status(201).json({
      success: true,
      id: result.insertId,
      message: 'Message saved!',
    });

  } catch (err) {
    console.error('❌ DB Error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get all messages
app.get('/api/messages', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('❌ Fetch Error:', err.message);
    res.status(500).json({ error: 'Fetch failed' });
  }
});

// ==================== FRONTEND ====================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==================== START SERVER ====================
async function start() {
  try {
    await testDB();   // 🔥 test connection first
    await initDB();   // 🔥 then init table

    app.listen(PORT, () => {
      console.log(`🚀 Server running → http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('❌ Server failed:', err.message);
  }
}

start();