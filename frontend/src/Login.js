import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = () => {
        fetch('/api/user')
            .then(res => {
                if (!res.ok) {
                    throw new Error('Not authenticated');
                }
                return res.json();
            })
            .then(data => {
                console.log('User data:', data);
                if (data.id) {
                    console.log('User is authenticated, redirecting to dashboard');
                    navigate('/dashboard');
                }
            })
            .catch(err => {
                console.error('Error checking auth status:', err);
            });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleGoogleLogin = () => {
        console.log('Initiating Google login');
        const baseUrl = process.env.NODE_ENV === 'production'
            ? window.location.origin
            : 'http://localhost:5000';
        const googleAuthUrl = `${baseUrl}/auth/google`;
        console.log('Redirecting to:', googleAuthUrl);
        window.location.href = googleAuthUrl;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        message.info('Username/password login is not implemented yet');
    };

    return (
        <div className="login-container">
            <h2>Welcome back</h2>
            <p>Don't have an account? <a href="/signup">Sign up.</a></p>

            <button className="google-btn" onClick={handleGoogleLogin}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png" alt="Google Logo" className="google-logo"/>
                Continue with Google
            </button>

            <div className="divider">Or continue with username/email</div>

            <form className="login-form" onSubmit={handleSubmit}>
                <label>
                    Username or email address
                    <input type="text" name="username" placeholder="Username or email" required />
                </label>

                <label>
                    Password
                    <div className="password-container">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            required
                        />
                        <span onClick={togglePasswordVisibility} className="password-toggle">
                            {showPassword ? "Hide" : "Show"}
                        </span>
                    </div>
                </label>

                <a href="#" className="forgot-password">Forgot your password?</a>

                <button type="submit" className="login-btn">Sign in</button>
            </form>
        </div>
    );
};

export default Login;