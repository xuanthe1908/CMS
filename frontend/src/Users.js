import React, { useState, useEffect } from 'react';
import { Table, message, Tag, Button, Card, Space } from 'antd';
import { Link } from 'react-router-dom';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    fetch(`${process.env.REACT_APP_API_URL}/api/users`)
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching users:', err);
        message.error('Failed to fetch users');
        setLoading(false);
      });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Auth Account',
      dataIndex: 'is_auth_account',
      key: 'is_auth_account',
      render: (isAuth) => (
        <Tag color={isAuth ? 'green' : 'red'}>
          {isAuth ? 'Yes' : 'No'}
        </Tag>
      ),
    },
    {
      title: 'Telegram Premium',
      dataIndex: 'telegram_premium',
      key: 'telegram_premium',
      render: (premium) => (
        <Tag color={premium ? 'gold' : 'default'}>
          {premium ? 'Premium' : 'Standard'}
        </Tag>
      ),
    },
  ];

  return (
    <Card title="Users" style={{ margin: '10px' }} 
      extra={
        <Button type="primary">
          <Link to="/create-user">Create User</Link>
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        scroll={{ x: true }}
        size="small"
        pagination={{ pageSize: 10 }}
        expandable={{
          expandedRowRender: record => (
            <Space direction="vertical">
              <p><strong>Wallet Address:</strong> {record.wallet_address || 'N/A'}</p>
              <p><strong>Stripe Customer ID:</strong> {record.stripe_customer_id || 'N/A'}</p>
              <p><strong>Created At:</strong> {new Date(record.created_at).toLocaleString()}</p>
              <p><strong>Updated At:</strong> {new Date(record.updated_at).toLocaleString()}</p>
              <p><strong>Referral Code:</strong> {record.referral_code || 'N/A'}</p>
              <p><strong>Images Created:</strong> {record.number_image_created}</p>
              <p><strong>TMA Code:</strong> {record.tma_code || 'N/A'}</p>
            </Space>
          ),
        }}
      />
    </Card>
  );
};

export default Users;