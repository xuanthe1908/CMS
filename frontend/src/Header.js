import React, { useContext } from 'react';
import { Layout, Avatar, Dropdown, Menu, Typography } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AuthContext from './AuthContext';

const { Header } = Layout;
const { Title } = Typography;

const AppHeader = ({ onLogout }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const menu = (
    <Menu>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Log Out
      </Menu.Item>
    </Menu>
  );

  return (
    <Header style={{ 
      background: '#000', 
      padding: '0 20px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      color: '#fff'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img 
          src="https://genesis-devv2.aielabs.io/images/common/logo-header.png" 
          alt="Genesis Logo" 
          style={{ height: '40px', marginRight: '10px' }}
        />
        <Title level={4} style={{ margin: 0, color: '#fff' }}>
          Genesis Marketplace CMS
        </Title>
      </div>
      {user && (
        <Dropdown overlay={menu} placement="bottomRight" arrow>
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
            <span style={{ marginLeft: 8, color: '#fff' }}>{user.displayName || user.email}</span>
          </div>
        </Dropdown>
      )}
    </Header>
  );
};

export default AppHeader;