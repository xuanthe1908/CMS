import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Layout, message } from 'antd';
import Login from './Login';
import Dashboard from './Dashboard';
import Header from './Header';
import AuthContext from './AuthContext';
import CreateUser from './CreateUser';
import CreateTelegramUser from './CreateTelegramUser';

const { Content } = Layout;

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    fetch(`${process.env.REACT_APP_API_URL}/api/user`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) {
          throw new Error('Not authenticated');
        }
        return res.json();
      })
      .then(data => {
        console.log('User data:', data);
        setUser(data);
      })
      .catch(err => {
        console.error('Error checking auth status:', err);
        setUser(null);
      });
  };

  const handleLogout = () => {
    fetch(`${process.env.REACT_APP_API_URL}/auth/logout`, { credentials: 'include' })
      .then(() => {
        setUser(null);
        message.success('Logged out successfully');
      })
      .catch(err => console.error(err));
  };

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Router>
        <Layout style={{ minHeight: '100vh' }}>
          {user && <Header onLogout={handleLogout} />}
          <Content style={{ padding: '0 50px', marginTop: 64 }}>
            <div style={{ background: '#fff', padding: 24, minHeight: 380 }}>
              <Routes>
                <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
                <Route 
                  path="/dashboard" 
                  element={user ? <Dashboard /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/create-user"
                  element={user ? <CreateUser /> : <Navigate to="/login" />}
                />
                <Route
                  path="/create-telegram-user" 
                  element={user ? <CreateTelegramUser /> : <Navigate to="/login" />}
                />
                <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
              </Routes>
            </div>
          </Content>
        </Layout>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;