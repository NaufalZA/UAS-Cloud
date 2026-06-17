const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// ─── PostgreSQL Connection ───────────────────────────────────────────────────
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'KaloriPass123!',
  database: process.env.DB_NAME || 'kalori_db',
  port: 5432,
});

// ─── Initialize Database Schema ──────────────────────────────────────────────
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS food_logs (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        calories INTEGER NOT NULL,
        protein DECIMAL(6,2) DEFAULT 0,
        carbs DECIMAL(6,2) DEFAULT 0,
        fat DECIMAL(6,2) DEFAULT 0,
        meal_type VARCHAR(50) DEFAULT 'snack',
        logged_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS daily_goals (
        id SERIAL PRIMARY KEY,
        date DATE UNIQUE DEFAULT CURRENT_DATE,
        calorie_goal INTEGER DEFAULT 2000,
        protein_goal DECIMAL(6,2) DEFAULT 150,
        carbs_goal DECIMAL(6,2) DEFAULT 250,
        fat_goal DECIMAL(6,2) DEFAULT 65
      );

      INSERT INTO daily_goals (date, calorie_goal, protein_goal, carbs_goal, fat_goal)
      VALUES (CURRENT_DATE, 2000, 150, 250, 65)
      ON CONFLICT (date) DO NOTHING;
    `);
    console.log('✅ Database schema initialized');
  } catch (err) {
    console.error('❌ DB init error:', err.message);
  } finally {
    client.release();
  }
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'OK' }));

// ─── Seed data (dummy food entries) ──────────────────────────────────────────
app.post('/api/seed', async (req, res) => {
  const seeds = [
    { name: 'Nasi Putih', calories: 204, protein: 4.2, carbs: 44.5, fat: 0.4, meal_type: 'lunch' },
    { name: 'Ayam Goreng', calories: 320, protein: 28.5, carbs: 8.2, fat: 18.6, meal_type: 'lunch' },
    { name: 'Telur Rebus', calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3, meal_type: 'breakfast' },
    { name: 'Roti Gandum', calories: 69, protein: 3.6, carbs: 12.4, fat: 1.1, meal_type: 'breakfast' },
  ];
  try {
    for (const s of seeds) {
      await pool.query(
        'INSERT INTO food_logs (name, calories, protein, carbs, fat, meal_type) VALUES ($1,$2,$3,$4,$5,$6)',
        [s.name, s.calories, s.protein, s.carbs, s.fat, s.meal_type]
      );
    }
    res.json({ message: 'Seed data inserted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── FOOD LOG CRUD ────────────────────────────────────────────────────────────
app.get('/api/logs', async (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  try {
    const result = await pool.query(
      `SELECT * FROM food_logs WHERE DATE(logged_at) = $1 ORDER BY logged_at DESC`,
      [date]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/logs', async (req, res) => {
  const { name, calories, protein = 0, carbs = 0, fat = 0, meal_type = 'snack' } = req.body;
  if (!name || !calories) return res.status(400).json({ error: 'name and calories are required' });
  try {
    const result = await pool.query(
      `INSERT INTO food_logs (name, calories, protein, carbs, fat, meal_type)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, calories, protein, carbs, fat, meal_type]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/logs/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM food_logs WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DAILY SUMMARY ────────────────────────────────────────────────────────────
app.get('/api/summary', async (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  try {
    const logsResult = await pool.query(
      `SELECT
        COALESCE(SUM(calories), 0) AS total_calories,
        COALESCE(SUM(protein), 0)  AS total_protein,
        COALESCE(SUM(carbs), 0)    AS total_carbs,
        COALESCE(SUM(fat), 0)      AS total_fat
       FROM food_logs WHERE DATE(logged_at) = $1`,
      [date]
    );
    const goalResult = await pool.query(
      `SELECT * FROM daily_goals WHERE date = $1`, [date]
    );
    const goal = goalResult.rows[0] || { calorie_goal: 2000, protein_goal: 150, carbs_goal: 250, fat_goal: 65 };
    res.json({ ...logsResult.rows[0], ...goal, date });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── UPDATE GOALS ─────────────────────────────────────────────────────────────
app.put('/api/goals', async (req, res) => {
  const { calorie_goal = 2000, protein_goal = 150, carbs_goal = 250, fat_goal = 65 } = req.body;
  const date = new Date().toISOString().split('T')[0];
  try {
    await pool.query(
      `INSERT INTO daily_goals (date, calorie_goal, protein_goal, carbs_goal, fat_goal)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (date) DO UPDATE SET
         calorie_goal = EXCLUDED.calorie_goal,
         protein_goal = EXCLUDED.protein_goal,
         carbs_goal   = EXCLUDED.carbs_goal,
         fat_goal     = EXCLUDED.fat_goal`,
      [date, calorie_goal, protein_goal, carbs_goal, fat_goal]
    );
    res.json({ message: 'Goals updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Weekly Stats ─────────────────────────────────────────────────────────────
app.get('/api/stats/weekly', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        DATE(logged_at) AS date,
        COALESCE(SUM(calories), 0) AS total_calories,
        COALESCE(SUM(protein), 0)  AS total_protein,
        COALESCE(SUM(carbs), 0)    AS total_carbs,
        COALESCE(SUM(fat), 0)      AS total_fat
      FROM food_logs
      WHERE logged_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(logged_at)
      ORDER BY date ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fallback – serve frontend for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 80;
app.listen(PORT, async () => {
  await initDB();
  console.log(`🚀 Kalori Tracker API running on port ${PORT}`);
});
