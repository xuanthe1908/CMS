import React, { useState, useEffect } from 'react';
import { Table, message, Tag, Button } from 'antd';
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
      title: 'Telegram ID Bot ID',
      dataIndex: 'telegram_id_bot_id',
      key: 'telegram_id_bot_id',
    },
    {
      title: 'Telegram ID',
      dataIndex: 'telegram_id',
      key: 'telegram_id',
    },
    {
      title: 'Bot ID',
      dataIndex: 'bot_id',
      key: 'bot_id',
    },
    {
      title: 'Points',
      dataIndex: 'point',
      key: 'point',
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Last Name',
      dataIndex: 'lastname',
      key: 'lastname',
    },
    {
      title: 'First Name',
      dataIndex: 'firstname',
      key: 'firstname',
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
      title: 'Updated At',
      dataIndex: 'updated_timestamp',
      key: 'updated_timestamp',
      render: (timestamp) => new Date(timestamp).toLocaleString(),
    },
    {
      title: 'Nonce Charge',
      dataIndex: 'nonce_charge',
      key: 'nonce_charge',
    },
    {
      title: 'Nonce Mint',
      dataIndex: 'nonce_mint',
      key: 'nonce_mint',
    },
    {
      title: 'Checkin',
      dataIndex: 'checkin',
      key: 'checkin',
      render: (checkin) => <span>{checkin ? 'Yes' : 'No'}</span>,
    },
    {
      title: 'USDT',
      dataIndex: 'usdt',
      key: 'usdt',
    },
    {
      title: 'Data Popup',
      dataIndex: 'data_popup',
      key: 'data_popup',
      render: (data) => <span>{data ? JSON.stringify(data) : 'N/A'}</span>,
    },
    {
      title: 'Created At',
      dataIndex: 'created_timestamp',
      key: 'created_timestamp',
      render: (timestamp) => new Date(timestamp).toLocaleString(),
    },
    {
      title: 'Data Invite',
      dataIndex: 'data_invite',
      key: 'data_invite',
      render: (data) => <span>{data ? JSON.stringify(data) : 'N/A'}</span>,
    },
    {
      title: 'Invite Count',
      dataIndex: 'count_invite_event',
      key: 'count_invite_event',
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Telegram Users</h2>  
        <Button type="primary">
          <Link to="/create-telegram-user">Create Telegram User</Link>
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={telegramUsers}
        rowKey="id"
        loading={loading}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default TelegramUsers;