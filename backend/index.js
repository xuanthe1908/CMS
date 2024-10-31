const express = require('express');
const mysql = require('mysql2/promise');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { router: authRouter, authenticateToken } = require('./routes/auth');
const config = require('./config');
require('dotenv').config();

const app = express();

// Middleware for parsing JSON and cookies
app.use(express.json());
app.use(cookieParser());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

// Enable pre-flight requests for all routes
app.options('*', cors());

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    console.log(`Connected to MySQL at ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    connection.release();
    return true;
  } catch (err) {
    console.error('Database connection failed:', err);
    return false;
  }
};

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Auth routes
app.use('/', authRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Protected routes
app.use('/api/tasks', authenticateToken);
app.use('/api/users', authenticateToken);
app.use('/api/data', authenticateToken);

// Error handling
app.use((err, req, res, next) => {
  console.error('Error occurred:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  // Test database connection before starting server
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    console.error('Could not establish database connection. Exiting...');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`CORS origin: ${process.env.CORS_ORIGIN}`);
    console.log(`Server URL: ${process.env.SERVER_URL}`);
  });
};

startServer().catch(console.error);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.info('SIGTERM signal received.');
  app.close(() => {
    console.log('HTTP server closed');
    pool.end(() => {
      console.log('Database connections closed');
      process.exit(0);
    });
  });
});

module.exports = app;