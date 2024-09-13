import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import Login from './Login';
import Dashboard from './Dashboard';
import Header from './Header';
import AuthContext from './AuthContext';

const { Content } = Layout;

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    fetch('/api/user')
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          setUser(data);
        }
      })
      .catch(err => console.error('Error checking auth status:', err));
  };

  const handleLogout = () => {
    fetch('/auth/logout')
      .then(() => {
        setUser(null);
      })
      .catch(err => console.error('Error during logout:', err));
  };

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Router>
        <Layout style={{ minHeight: '100vh' }}>
          <Header onLogout={handleLogout} />
          <Content style={{ padding: '24px' }}>
            <Routes>
              <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login />} />
              <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
            </Routes>
          </Content>
        </Layout>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;