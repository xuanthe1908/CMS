const express = require('express');
const mysql = require('mysql2/promise');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const cors = require('cors');
const config = require('./config');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.REACT_APP_API_URL,
  credentials: true
}));

// Create connection pool for genesis_marketplace database
const pool = mysql.createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  connectionLimit: 10, // Adjust the connection limit as needed
});

passport.use(new GoogleStrategy({
  clientID: config.google.clientID,
  clientSecret: config.google.clientSecret,
  callbackURL: config.google.callbackURL
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using https
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    console.log('Google authentication successful, redirecting to dashboard');
    res.redirect('/dashboard');
  }
);

app.get('/api/user', (req, res) => {
  console.log('Checking user authentication status');
  if (req.isAuthenticated()) {
    console.log('User is authenticated:', req.user);
    res.json(req.user);
  } else {
    console.log('User is not authenticated');
    res.status(401).json({ message: 'Not authenticated' });
  }
});

app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) { 
      console.error('Error during logout:', err);
      return res.status(500).json({ message: 'Error logging out' });
    }
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ message: 'Error destroying session' });
      }
      res.clearCookie('connect.sid'); 
      return res.json({ message: 'Logged out successfully' });
    });
  });
});

// API routes for telegram_tasks
app.get('/api/tasks', async (req, res) => {
  console.log('Received search request:', req.query);
  const { search, criteria } = req.query;
  
  let sql = 'SELECT * FROM telegram_tasks WHERE 1=1';
  const params = [];

  if (search) {
    switch(criteria) {
      case 'ID':
        sql += ' AND id = ?';
        params.push(search);
        break;
      case 'Task ID':
        sql += ' AND task_id LIKE ?';
        params.push(`%${search}%`);
        break;
      case 'Title':
        sql += ' AND title LIKE ?';
        params.push(`%${search}%`);
        break;
      default:
        sql += ' AND (id LIKE ? OR task_id LIKE ? OR title LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
  }
  
  console.log('Executing SQL:', sql);
  console.log('With parameters:', params);

  try {
    const [results] = await pool.query(sql, params);
    console.log('Search results:', results);
    res.json(results);
  } catch (err) {
    console.error('Error searching tasks:', err);
    return res.status(500).json({ message: 'Error searching tasks', error: err.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  console.log('Received POST request to /api/tasks');
  console.log('Request body:', req.body);

  const { task_id, title, content, type, point, start_time, end_time, picture, bot_id, link, partner_code } = req.body;

  if (!task_id || !title || !content) {
    console.log('Invalid input: missing required fields');
    return res.status(400).json({ message: 'Task ID, title, and content are required' });
  }
  
  const sql = 'INSERT INTO telegram_tasks (task_id, title, content, type, point, start_time, end_time, picture, bot_id, link, partner_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const params = [task_id, title, content, type, point, start_time, end_time, picture, bot_id, link, partner_code];
  
  console.log('Executing SQL:', sql);
  console.log('With parameters:', params);

  try {
    const [result] = await pool.query(sql, params);
    console.log('Task created:', result);
    res.status(201).json({ message: 'Task created', id: result.insertId });
  } catch (err) {
    console.error('Error inserting task:', err);
    return res.status(500).json({ message: 'Error creating task', error: err.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { task_id, title, content, type, point, start_time, end_time, picture, bot_id, link, partner_code } = req.body;
  const sql = 'UPDATE telegram_tasks SET task_id = ?, title = ?, content = ?, type = ?, point = ?, start_time = ?, end_time = ?, picture = ?, bot_id = ?, link = ?, partner_code = ? WHERE id = ?';
  
  try {
    await pool.query(sql, [task_id, title, content, type, point, start_time, end_time, picture, bot_id, link, partner_code, id]);
    res.json({ message: 'Task updated' });
  } catch (err) {
    console.error('Error updating task:', err);
    return res.status(500).json({ message: 'Error updating task', error: err.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM telegram_tasks WHERE id = ?';
  
  try {
    await pool.query(sql, [id]);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('Error deleting task:', err);
    return res.status(500).json({ message: 'Error deleting task', error: err.message });
  }
});

app.get('/api/users', async (req, res) => {
  const sql = 'SELECT * FROM users';
  try {
    const [results] = await pool.query(sql);
    res.json(results);
  } catch (err) {
    console.error('Error fetching users:', err);
    return res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  const { email, wallet_address, name } = req.body;
  const sql = 'INSERT INTO users (email, wallet_address, name) VALUES (?, ?, ?)';
  try {
    const [result] = await pool.query(sql, [email, wallet_address, name]);
    res.status(201).json({ message: 'User created', id: result.insertId });
  } catch (err) {
    console.error('Error creating user:', err);
    return res.status(500).json({ message: 'Error creating user', error: err.message });
  }
});

app.get('/api/telegram-users', async (req, res) => {
  const sql = 'SELECT * FROM telegram_users';
  try {
    const [results] = await pool.query(sql);
    res.json(results);
  } catch (err) {
    console.error('Error fetching telegram users:', err);
    return res.status(500).json({ message: 'Error fetching telegram users', error: err.message });
  }
});

app.post('/api/telegram-users', async (req, res) => {
  const { telegram_id, bot_id, username, lastname, firstname } = req.body;
  const telegram_id_bot_id = `${telegram_id}_${bot_id}`;
  const sql = 'INSERT INTO telegram_users (telegram_id_bot_id, telegram_id, bot_id, username, lastname, firstname) VALUES (?, ?, ?, ?, ?, ?)';
  try {
    const [result] = await pool.query(sql, [telegram_id_bot_id, telegram_id, bot_id, username, lastname, firstname]);
    res.status(201).json({ message: 'Telegram user created', id: result.insertId });
  } catch (err) {
    console.error('Error creating telegram user:', err);
    return res.status(500).json({ message: 'Error creating telegram user', error: err.message });
  }
});

app.get('/api/telegram-invite-logs', async (req, res) => {
  const { code } = req.query;
  let sql = 'SELECT * FROM telegram_invite_logs';
  const params = [];

  if (code) {
    sql += ' WHERE code = ?';
    params.push(code);
  }

  try {
    const [results] = await pool.query(sql, params);
    res.json(results);
  } catch (err) {
    console.error('Error fetching invite logs:', err);
    return res.status(500).json({ message: 'Error fetching invite logs', error: err.message });
  }
});

app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html'));
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});