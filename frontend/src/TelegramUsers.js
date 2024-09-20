import React, { useState, useEffect } from 'react';
import { Table, message, Tag, Button, Card, Space } from 'antd';
import { Link } from 'react-router-dom';

const TelegramUsers = () => {
  const [telegramUsers, setTelegramUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTelegramUsers();
  }, []);

  const fetchTelegramUsers = () => {
    setLoading(true);
    fetch(`${process.env.REACT_APP_API_URL}/api/telegram-users`)
      .then((res) => res.json())
      .then((data) => {
        setTelegramUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching telegram users:', err);
        message.error('Failed to fetch telegram users');
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
      title: 'Telegram ID',
      dataIndex: 'telegram_id',
      key: 'telegram_id',
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Premium',
      dataIndex: 'is_premium',
      key: 'is_premium',
      render: (isPremium) => (
        <Tag color={isPremium ? 'gold' : 'default'}>
          {isPremium ? 'Premium' : 'Standard'}
        </Tag>
      ),
    },
    {
      title: 'Points',
      dataIndex: 'point',
      key: 'point',
    },
    {
      title: 'Invite Count',
      dataIndex: 'count_invite_event',
      key: 'count_invite_event',
    },
  ];

  return (
    <Card title="Telegram Users" style={{ margin: '10px' }} 
      extra={
        <Button type="primary">
          <Link to="/create-telegram-user">Create User</Link>
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={telegramUsers}
        rowKey="id"
        loading={loading}
        scroll={{ x: true }}
        size="small"
        pagination={{ pageSize: 10 }}
        expandable={{
          expandedRowRender: record => (
            <Space direction="vertical">
              <p><strong>Bot ID:</strong> {record.bot_id}</p>
              <p><strong>Last Name:</strong> {record.lastname}</p>
              <p><strong>First Name:</strong> {record.firstname}</p>
              <p><strong>Updated At:</strong> {new Date(record.updated_timestamp).toLocaleString()}</p>
              <p><strong>Created At:</strong> {new Date(record.created_timestamp).toLocaleString()}</p>
            </Space>
          ),
        }}
      />
    </Card>
  );
};

export default TelegramUsers;