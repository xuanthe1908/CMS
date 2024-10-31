const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Hardcoded credentials - in production these should be in a secure database
const VALID_CREDENTIALS = {
    username: 'thorstats',
    password: '0987poiu"@&)'
};

// Use environment variables with fallback
const JWT_SECRET = process.env.JWT_SECRET || '67c5dca8f2b94e7d3c63b4c927f6924a8ec786f6b599f0934ac3c4c6116c44d1';
const TOKEN_EXPIRES_IN = '24h';

router.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Login attempt:', { username });

        // Input validation
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Credential check
        const isValidUsername = username === VALID_CREDENTIALS.username;
        const isValidPassword = password === VALID_CREDENTIALS.password;

        if (isValidUsername && isValidPassword) {
            const user = {
                id: 1,
                username: username,
                role: 'admin',
                displayName: 'Thor Stats Admin'
            };

            const token = jwt.sign(
                { userId: user.id, username: user.username, role: user.role },
                JWT_SECRET,
                { expiresIn: TOKEN_EXPIRES_IN }
            );

            // Set secure cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });

            console.log('Login successful for user:', username);
            
            return res.json({
                success: true,
                user: user,
                message: 'Login successful'
            });
        }

        console.log('Login failed for user:', username);
        
        return res.status(401).json({
            success: false,
            message: 'Invalid username or password'
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during login'
        });
    }
});

// Token verification middleware
const authenticateToken = (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            console.log('No token found in request');
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                console.error('Token verification failed:', err.message);
                return res.status(403).json({
                    success: false,
                    message: 'Invalid or expired token'
                });
            }

            req.user = decoded;
            console.log('Token verified for user:', decoded.username);
            next();
        });
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
};

// Auth check route
router.get('/api/auth/verify', authenticateToken, (req, res) => {
    return res.json({
        success: true,
        user: req.user
    });
});

// Logout route
router.post('/api/auth/logout', (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });
        
        console.log('User logged out successfully');
        
        return res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error during logout'
        });
    }
});

module.exports = {
    router,
    authenticateToken
};