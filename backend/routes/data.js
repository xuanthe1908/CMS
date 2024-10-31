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

// Get all data records
router.get('/api/data', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM data ORDER BY timestamp DESC');
    res.json(results);
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ message: 'Error fetching data', error: err.message });
  }
});

// Create new data record
router.post('/api/data', async (req, res) => {
  const {
    trading_pair,
    amount1,
    amount2,
    thor_trading_rate,
    binance_price,
    slippage_vs_binance,
    protocol_fee,
    affiliate_fee,
    affiliate_fee_amount,
    affiliate_fee_percentage,
    liquidity_fee,
    slippage,
    usd_worth,
    timestamp,
    time_till_completion,
    transaction_hash
  } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO data (
        trading_pair, amount1, amount2, thor_trading_rate, binance_price,
        slippage_vs_binance, protocol_fee, affiliate_fee, affiliate_fee_amount,
        affiliate_fee_percentage, liquidity_fee, slippage, usd_worth,
        timestamp, time_till_completion, transaction_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        trading_pair, amount1, amount2, thor_trading_rate, binance_price,
        slippage_vs_binance, protocol_fee, affiliate_fee, affiliate_fee_amount,
        affiliate_fee_percentage, liquidity_fee, slippage, usd_worth,
        timestamp, time_till_completion, transaction_hash
      ]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error('Error creating data record:', err);
    res.status(500).json({ message: 'Error creating data record', error: err.message });
  }
});

// Update data record
router.put('/api/data/:id', async (req, res) => {
  const { id } = req.params;
  const {
    trading_pair,
    amount1,
    amount2,
    thor_trading_rate,
    binance_price,
    slippage_vs_binance,
    protocol_fee,
    affiliate_fee,
    affiliate_fee_amount,
    affiliate_fee_percentage,
    liquidity_fee,
    slippage,
    usd_worth,
    timestamp,
    time_till_completion,
    transaction_hash
  } = req.body;

  try {
    await pool.query(
      `UPDATE data SET
        trading_pair = ?, amount1 = ?, amount2 = ?, thor_trading_rate = ?,
        binance_price = ?, slippage_vs_binance = ?, protocol_fee = ?,
        affiliate_fee = ?, affiliate_fee_amount = ?, affiliate_fee_percentage = ?,
        liquidity_fee = ?, slippage = ?, usd_worth = ?, timestamp = ?,
        time_till_completion = ?, transaction_hash = ?
      WHERE id = ?`,
      [
        trading_pair, amount1, amount2, thor_trading_rate, binance_price,
        slippage_vs_binance, protocol_fee, affiliate_fee, affiliate_fee_amount,
        affiliate_fee_percentage, liquidity_fee, slippage, usd_worth,
        timestamp, time_till_completion, transaction_hash, id
      ]
    );
    res.json({ message: 'Record updated successfully' });
  } catch (err) {
    console.error('Error updating data record:', err);
    res.status(500).json({ message: 'Error updating data record', error: err.message });
  }
});

// Delete data record
router.delete('/api/data/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM data WHERE id = ?', [id]);
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    console.error('Error deleting data record:', err);
    res.status(500).json({ message: 'Error deleting data record', error: err.message });
  }
});

module.exports = router;