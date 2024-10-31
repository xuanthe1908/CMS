import React, { useState, useEffect, useContext } from 'react';
import { message, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import AuthContext from './AuthContext';
import './Login.css';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { setUser } = useContext(AuthContext);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/verify`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.user) {
                    setUser(data.user);
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            console.error('Error checking auth status:', err);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleGoogleLogin = () => {
        window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
    };

    const handleAccountLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setUser(data.user);
                message.success('Login successful');
                navigate('/dashboard');
            } else {
                setError(data.message || 'Login failed');
                message.error(data.message || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Network error. Please try again.');
            message.error('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2>Welcome back</h2>
            <p>Please sign in to continue</p>

            <button 
                className="google-btn" 
                onClick={handleGoogleLogin}
                disabled={isLoading}
            >
                <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png" 
                    alt="Google Logo" 
                    className="google-logo"
                />
                Continue with Google
            </button>

            <div className="divider">Or sign in with username</div>

            {error && <div className="error-message">{error}</div>}

            <form className="login-form" onSubmit={handleAccountLogin}>
                <label>
                    Username
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username" 
                        disabled={isLoading}
                        required 
                    />
                </label>

                <label>
                    Password
                    <div className="password-container">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            disabled={isLoading}
                            required
                        />
                        <span 
                            onClick={togglePasswordVisibility} 
                            className="password-toggle"
                        >
                            {showPassword ? "Hide" : "Show"}
                        </span>
                    </div>
                </label>

                <button 
                    type="submit" 
                    className="login-btn" 
                    disabled={isLoading}
                >
                    {isLoading ? <Spin size="small" /> : 'Sign in'}
                </button>
            </form>
        </div>
    );
};

export default Login;