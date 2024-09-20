import React, { useContext } from 'react';
import { Layout, Avatar, Dropdown, Menu, Typography } from 'antd';
import { UserOutlined, LogoutOutlined, MenuOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AuthContext from './AuthContext';
import Title from 'antd/es/skeleton/Title';

const { Header } = Layout;
const { Text } = Typography;

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
      padding: '0 10px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      position: 'fixed',
      width: '100%',
      zIndex: 1000,
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <MenuOutlined style={{ color: '#fff', fontSize: '20px', marginRight: '10px' }} />
        <img 
          src="https://genesis-devv2.aielabs.io/images/common/logo-header.png" 
          alt="Genesis Logo" 
          style={{ height: '30px' }}
        />
        <Title level={4} style={{margin:0, color:'#fff'}}>
          Genesis Marketplace CMS
        </Title>
      </div>
      {user && (
        <Dropdown overlay={menu} placement="bottomRight" arrow>
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
            <Text ellipsis style={{ color: '#fff', marginLeft: '8px', maxWidth: '100px' }}>
              {user.displayName || user.email}
            </Text>
          </div>
        </Dropdown>
      )}
    </Header>
  );
};

export default AppHeader;