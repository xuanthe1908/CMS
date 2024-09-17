const express = require('express');
const mysql = require('mysql2');
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
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5000',
  credentials: true
}));

// Create connection for genesis_marketplace database
const db = mysql.createConnection({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.name,
});

// Create connection for users database
const usersDb = mysql.createConnection({
    host: config.usersDatabase.host,
    user: config.usersDatabase.user,
    password: config.usersDatabase.password,
    database: config.usersDatabase.name,
});

// Create connection for telegram_invite_logs database
const inviteLogsDb = mysql.createConnection({
    host: config.inviteLogsDatabase.host,
    user: config.inviteLogsDatabase.user,
    password: config.inviteLogsDatabase.password,
    database: config.inviteLogsDatabase.name,
});

inviteLogsDb.connect((err) => {
    if (err) throw err;
    console.log("Connected to MySQL - telegram_invite_logs");
});

app.get('/api/telegram-invite-logs', (req, res) => {
    const { code } = req.query;
    let sql = 'SELECT * FROM telegram_invite_logs';
    const params = [];
  
    if (code) {
      sql += ' WHERE code = ?';
      params.push(code);
    }
  
    inviteLogsDb.query(sql, params, (err, results) => {
      if (err) {
        console.error('Error fetching invite logs:', err);
        return res.status(500).json({ message: 'Error fetching invite logs', error: err.message });
      }
      res.json(results);
    });
});

db.connect((err) => {
    if (err) throw err;
    console.log("Connected to MySQL - genesis_marketplace");
});

usersDb.connect((err) => {
    if (err) throw err;
    console.log("Connected to MySQL - users");
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

app.use(session({ secret: config.sessionSecret, resave: false, saveUninitialized: true }));
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

// API routes for tasks
app.get('/api/tasks', (req, res) => {
    console.log('Received search request:', req.query);
    const { search, criteria } = req.query;
    
    let sql = 'SELECT * FROM telegram_tasks WHERE 1=1';
    let params = [];

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

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Error searching tasks:', err);
            return res.status(500).json({ message: 'Error searching tasks', error: err.message });
        }
        console.log('Search results:', results);
        res.json(results);
    });
});

app.post('/api/tasks', (req, res) => {
    console.log('Received POST request to /api/tasks');
    console.log('Request body:', req.body);

    const { task_id, title, content, type, point, start_time, end_time, picture } = req.body;

    if (!task_id || !title || !content) {
        console.log('Invalid input: missing required fields');
        return res.status(400).json({ message: 'Task ID, title, and content are required' });
    }
    
    const sql = 'INSERT INTO telegram_tasks (task_id, title, content, type, point, start_time, end_time, picture) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const params = [task_id, title, content, type, point, start_time, end_time, picture];
    
    console.log('Executing SQL:', sql);
    console.log('With parameters:', params);

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Error inserting task:', err);
            return res.status(500).json({ message: 'Error creating task', error: err.message });
        }
        console.log('Task created:', results);
        res.status(201).json({ message: 'Task created', id: results.insertId });
    });
});

app.put('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { task_id, title, content, type, point, start_time, end_time, picture } = req.body;
    const sql = 'UPDATE telegram_tasks SET task_id = ?, title = ?, content = ?, type = ?, point = ?, start_time = ?, end_time = ?, picture = ? WHERE id = ?';
    db.query(sql, [task_id, title, content, type, point, start_time, end_time, picture, id], (err, results) => {
      if (err) {
        console.error('Error updating task:', err);
        return res.status(500).json({ message: 'Error updating task', error: err.message });
      }
      res.json({ message: 'Task updated' });
    });
});
  
app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM telegram_tasks WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
          console.error('Error deleting task:', err);
          return res.status(500).json({ message: 'Error deleting task', error: err.message });
        }
        res.json({ message: 'Task deleted' });
    });
});

// API routes for users
app.get('/api/users', (req, res) => {
    const sql = 'SELECT * FROM users';
    usersDb.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ message: 'Error fetching users', error: err.message });
        }
        res.json(results);
    });
});

app.post('/api/users', (req, res) => {
    const { email, wallet_address, name } = req.body;
    
    const sql = 'INSERT INTO users (email, wallet_address, name) VALUES (?, ?, ?)';
    usersDb.query(sql, [email, wallet_address, name], (err, result) => {
        if (err) {
            console.error('Error creating user:', err);
            return res.status(500).json({ message: 'Error creating user', error: err.message });
        }
        res.status(201).json({ message: 'User created', id: result.insertId });
    });
});

// API routes for telegram users
app.get('/api/telegram-users', (req, res) => {
    const sql = 'SELECT * FROM telegram_users';
    usersDb.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching telegram users:', err);
            return res.status(500).json({ message: 'Error fetching telegram users', error: err.message });
        }
        res.json(results);
    });
});

app.post('/api/telegram-users', (req, res) => {
    const { telegram_id, bot_id, username, lastname, firstname } = req.body;
    const telegram_id_bot_id = `${telegram_id}_${bot_id}`;
    
    const sql = 'INSERT INTO telegram_users (telegram_id_bot_id, telegram_id, bot_id, username, lastname, firstname) VALUES (?, ?, ?, ?, ?, ?)';
    usersDb.query(sql, [telegram_id_bot_id, telegram_id, bot_id, username, lastname, firstname], (err, result) => {
        if (err) {
            console.error('Error creating telegram user:', err);
            return res.status(500).json({ message: 'Error creating telegram user', error: err.message });
        }
        res.status(201).json({ message: 'Telegram user created', id: result.insertId });
    });
});

app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});