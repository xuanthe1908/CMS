const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const config = require('./config');
const app = express();

app.use(express.json());

app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using https
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackURL
  },
  (accessToken, refreshToken, profile, done) => {
    console.log('Google authentication successful:', profile);
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

app.get('/auth/google',
  (req, res, next) => {
    console.log('Initiating Google OAuth');
    next();
  },
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    console.log('Google OAuth callback successful');
    res.redirect('/dashboard');
  }
);

app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    console.log('User authenticated:', req.user);
    res.json(req.user);
  } else {
    console.log('User not authenticated');
    res.status(401).json({ message: 'Not authenticated' });
  }
});

app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) { 
      console.error('Error during logout:', err);
      return next(err); 
    }
    console.log('User logged out');
    res.redirect('/');
  });
});

module.exports = app;