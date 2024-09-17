import React, { useState, useEffect } from 'react';
import { Table, message, Tag, Button } from 'antd';
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
      title: 'Wallet Address',
      dataIndex: 'wallet_address',
      key: 'wallet_address',
      render: (address) => address || 'N/A',
    },
    {
      title: 'Avatar',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (avatar) => avatar ? <img src={avatar} alt="avatar" style={{ width: 50, height: 50, borderRadius: '50%' }} /> : 'N/A',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Stripe Customer ID',
      dataIndex: 'stripe_customer_id',
      key: 'stripe_customer_id',
      render: (id) => id || 'N/A',
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Updated At',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Referral Code',
      dataIndex: 'referral_code',
      key: 'referral_code',
      render: (code) => code || 'N/A',
    },
    {
      title: 'Cover',
      dataIndex: 'cover',
      key: 'cover',
      render: (cover) => cover ? <img src={cover} alt="cover" style={{ width: 100 }} /> : 'N/A',
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
      title: 'Images Created',
      dataIndex: 'number_image_created',
      key: 'number_image_created',
    },
    {
      title: 'First Visit',
      dataIndex: 'is_first_visit',
      key: 'is_first_visit',
      render: (isFirst) => (
        <Tag color={isFirst ? 'blue' : 'gray'}>
          {isFirst ? 'Yes' : 'No'}
        </Tag>
      ),
    },
    {
      title: 'TMA Code',
      dataIndex: 'tma_code',
      key: 'tma_code',
      render: (code) => code || 'N/A',
    },
    {
      title: 'Web Timestamp',
      dataIndex: 'timestamp_web',
      key: 'timestamp_web',
      render: (timestamp) => timestamp ? new Date(timestamp).toLocaleString() : 'N/A',
    },
    {
      title: 'Miniapp Timestamp',
      dataIndex: 'timestamp_miniapp',
      key: 'timestamp_miniapp',
      render: (timestamp) => timestamp ? new Date(timestamp).toLocaleString() : 'N/A',
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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Users</h2>
        <Button type="primary">
          <Link to="/create-user">Create User</Link>
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default Users;