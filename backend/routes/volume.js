const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const config = require('../config');

const pool = mysql.createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  connectionLimit: 10,
});

// Get all volume records
router.get('/api/volume', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM volume ORDER BY date DESC');
    res.json(results);
  } catch (err) {
    console.error('Error fetching volume data:', err);
    res.status(500).json({ message: 'Error fetching volume data', error: err.message });
  }
});

// Create new volume record
router.post('/api/volume', async (req, res) => {
  const { date, total_btc_volume_usd } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO volume (date, total_btc_volume_usd) VALUES (?, ?)',
      [date, total_btc_volume_usd]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error('Error creating volume record:', err);
    res.status(500).json({ message: 'Error creating volume record', error: err.message });
  }
});

// Update volume record
router.put('/api/volume/:id', async (req, res) => {
  const { id } = req.params;
  const { date, total_btc_volume_usd } = req.body;

  try {
    await pool.query(
      'UPDATE volume SET date = ?, total_btc_volume_usd = ? WHERE id = ?',
      [date, total_btc_volume_usd, id]
    );
    res.json({ message: 'Record updated successfully' });
  } catch (err) {
    console.error('Error updating volume record:', err);
    res.status(500).json({ message: 'Error updating volume record', error: err.message });
  }
});

// Delete volume record
router.delete('/api/volume/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM volume WHERE id = ?', [id]);
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    console.error('Error deleting volume record:', err);
    res.status(500).json({ message: 'Error deleting volume record', error: err.message });
  }
});

module.exports = router;