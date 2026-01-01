require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Initialize PostgreSQL Database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Create Tables
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('owner', 'worker')) NOT NULL,
        worker_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS workers (
        id SERIAL PRIMARY KEY,
        owner_id INTEGER NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        phone TEXT,
        daily_rate DECIMAL NOT NULL DEFAULT 500,
        photo TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        worker_id INTEGER NOT NULL REFERENCES workers(id),
        date TEXT NOT NULL,
        status TEXT CHECK(status IN ('present', 'absent', 'half-day')) NOT NULL,
        check_in_time TEXT,
        check_out_time TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(worker_id, date)
      );

      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        worker_id INTEGER NOT NULL REFERENCES workers(id),
        amount DECIMAL NOT NULL,
        type TEXT CHECK(type IN ('advance', 'payment', 'bonus', 'deduction')) NOT NULL,
        date TEXT NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Database initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

initDB();

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ==================== AUTH ROUTES ====================

// Register Owner
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, phone, password, role } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ error: 'Name, phone, and password are required' });
    }

    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE phone = $1', [phone]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      'INSERT INTO users (name, phone, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, phone, role',
      [name, phone, hashedPassword, role || 'owner']
    );

    const user = result.rows[0];

    // Generate token
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password are required' });
    }

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid phone or password' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid phone or password' });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        worker_id: user.worker_id
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, phone, role, worker_id FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// ==================== WORKERS ROUTES ====================

// Get all workers (owner only)
app.get('/api/workers', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT w.*, 
        (SELECT COUNT(*) FROM attendance a WHERE a.worker_id = w.id AND a.status = 'present') as days_present,
        (SELECT COALESCE(SUM(amount), 0) FROM payments p WHERE p.worker_id = w.id AND p.type IN ('advance', 'payment')) as total_paid
      FROM workers w 
      WHERE w.owner_id = $1 AND w.is_active = 1
      ORDER BY w.created_at DESC
    `, [req.user.id]);
    
    res.json({ workers: result.rows });
  } catch (error) {
    console.error('Get workers error:', error);
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
});

// Add worker
app.post('/api/workers', authenticateToken, async (req, res) => {
  try {
    const { name, phone, daily_rate, photo } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Worker name is required' });
    }

    const result = await pool.query(
      'INSERT INTO workers (owner_id, name, phone, daily_rate, photo) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, name, phone || null, daily_rate || 500, photo || null]
    );

    res.status(201).json({ worker: result.rows[0] });
  } catch (error) {
    console.error('Add worker error:', error);
    res.status(500).json({ error: 'Failed to add worker' });
  }
});

// Get single worker
app.get('/api/workers/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT w.*,
        (SELECT COUNT(*) FROM attendance a WHERE a.worker_id = w.id AND a.status = 'present') as days_present,
        (SELECT COUNT(*) FROM attendance a WHERE a.worker_id = w.id AND a.status = 'half-day') as days_half,
        (SELECT COALESCE(SUM(amount), 0) FROM payments p WHERE p.worker_id = w.id AND p.type IN ('advance', 'payment')) as total_paid
      FROM workers w 
      WHERE w.id = $1 AND w.owner_id = $2
    `, [req.params.id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    res.json({ worker: result.rows[0] });
  } catch (error) {
    console.error('Get worker error:', error);
    res.status(500).json({ error: 'Failed to fetch worker' });
  }
});

// Update worker
app.put('/api/workers/:id', authenticateToken, async (req, res) => {
  try {
    const { name, phone, daily_rate, photo, is_active } = req.body;

    const result = await pool.query(`
      UPDATE workers 
      SET name = COALESCE($1, name),
          phone = COALESCE($2, phone),
          daily_rate = COALESCE($3, daily_rate),
          photo = COALESCE($4, photo),
          is_active = COALESCE($5, is_active)
      WHERE id = $6 AND owner_id = $7
      RETURNING *
    `, [name, phone, daily_rate, photo, is_active, req.params.id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    res.json({ worker: result.rows[0] });
  } catch (error) {
    console.error('Update worker error:', error);
    res.status(500).json({ error: 'Failed to update worker' });
  }
});

// Delete worker (soft delete)
app.delete('/api/workers/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE workers SET is_active = 0 WHERE id = $1 AND owner_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    res.json({ message: 'Worker deleted successfully' });
  } catch (error) {
    console.error('Delete worker error:', error);
    res.status(500).json({ error: 'Failed to delete worker' });
  }
});

// ==================== ATTENDANCE ROUTES ====================

// Get attendance for a date range
app.get('/api/attendance', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date, worker_id } = req.query;

    let query = `
      SELECT a.*, w.name as worker_name, w.daily_rate
      FROM attendance a
      JOIN workers w ON a.worker_id = w.id
      WHERE w.owner_id = $1
    `;
    const params = [req.user.id];
    let paramIndex = 2;

    if (start_date) {
      query += ` AND a.date >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }
    if (end_date) {
      query += ` AND a.date <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }
    if (worker_id) {
      query += ` AND a.worker_id = $${paramIndex}`;
      params.push(worker_id);
      paramIndex++;
    }

    query += ' ORDER BY a.date DESC';

    const result = await pool.query(query, params);
    res.json({ attendance: result.rows });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// Mark attendance
app.post('/api/attendance', authenticateToken, async (req, res) => {
  try {
    const { worker_id, date, status, check_in_time, check_out_time, notes } = req.body;

    if (!worker_id || !date || !status) {
      return res.status(400).json({ error: 'Worker ID, date, and status are required' });
    }

    // Verify worker belongs to owner
    const workerCheck = await pool.query('SELECT id FROM workers WHERE id = $1 AND owner_id = $2', [worker_id, req.user.id]);
    if (workerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    const result = await pool.query(`
      INSERT INTO attendance (worker_id, date, status, check_in_time, check_out_time, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT(worker_id, date) DO UPDATE SET
        status = EXCLUDED.status,
        check_in_time = EXCLUDED.check_in_time,
        check_out_time = EXCLUDED.check_out_time,
        notes = EXCLUDED.notes
      RETURNING *
    `, [worker_id, date, status, check_in_time || null, check_out_time || null, notes || null]);

    res.status(201).json({ attendance: result.rows[0] });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

// ==================== PAYMENTS ROUTES ====================

// Get payments
app.get('/api/payments', authenticateToken, async (req, res) => {
  try {
    const { worker_id, start_date, end_date } = req.query;

    let query = `
      SELECT p.*, w.name as worker_name
      FROM payments p
      JOIN workers w ON p.worker_id = w.id
      WHERE w.owner_id = $1
    `;
    const params = [req.user.id];
    let paramIndex = 2;

    if (worker_id) {
      query += ` AND p.worker_id = $${paramIndex}`;
      params.push(worker_id);
      paramIndex++;
    }
    if (start_date) {
      query += ` AND p.date >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }
    if (end_date) {
      query += ` AND p.date <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    query += ' ORDER BY p.date DESC, p.created_at DESC';

    const result = await pool.query(query, params);
    res.json({ payments: result.rows });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Add payment
app.post('/api/payments', authenticateToken, async (req, res) => {
  try {
    const { worker_id, amount, type, date, notes } = req.body;

    if (!worker_id || !amount || !type || !date) {
      return res.status(400).json({ error: 'Worker ID, amount, type, and date are required' });
    }

    // Verify worker belongs to owner
    const workerCheck = await pool.query('SELECT id FROM workers WHERE id = $1 AND owner_id = $2', [worker_id, req.user.id]);
    if (workerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    const result = await pool.query(
      'INSERT INTO payments (worker_id, amount, type, date, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [worker_id, amount, type, date, notes || null]
    );

    res.status(201).json({ payment: result.rows[0] });
  } catch (error) {
    console.error('Add payment error:', error);
    res.status(500).json({ error: 'Failed to add payment' });
  }
});

// ==================== REPORTS ROUTES ====================

// Get dashboard stats
app.get('/api/reports/dashboard', authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    const [workersResult, presentResult, earningsResult, paymentsResult] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM workers WHERE owner_id = $1 AND is_active = 1', [req.user.id]),
      pool.query(`
        SELECT COUNT(*) as count FROM attendance a
        JOIN workers w ON a.worker_id = w.id
        WHERE w.owner_id = $1 AND a.date = $2 AND a.status = 'present'
      `, [req.user.id, today]),
      pool.query(`
        SELECT COALESCE(SUM(
          CASE 
            WHEN a.status = 'present' THEN w.daily_rate
            WHEN a.status = 'half-day' THEN w.daily_rate / 2
            ELSE 0
          END
        ), 0) as total
        FROM attendance a
        JOIN workers w ON a.worker_id = w.id
        WHERE w.owner_id = $1 AND a.date >= $2
      `, [req.user.id, monthStart]),
      pool.query(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM payments p
        JOIN workers w ON p.worker_id = w.id
        WHERE w.owner_id = $1 AND p.date >= $2 AND p.type IN ('advance', 'payment')
      `, [req.user.id, monthStart])
    ]);

    const stats = {
      total_workers: parseInt(workersResult.rows[0].count),
      present_today: parseInt(presentResult.rows[0].count),
      month_earnings: parseFloat(earningsResult.rows[0].total),
      month_payments: parseFloat(paymentsResult.rows[0].total)
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 KaamTrack API running on port ${PORT}`);
});
