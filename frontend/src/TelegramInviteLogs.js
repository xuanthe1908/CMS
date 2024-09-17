import React, { useState, useEffect } from 'react';
import { Table, Input, message } from 'antd';

const { Search } = Input;

const TelegramInviteLogs = () => {
  const [inviteLogs, setInviteLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInviteLogs();
  }, []);

  const fetchInviteLogs = (code = '') => {
    setLoading(true);
    fetch(`${process.env.REACT_APP_API_URL}/api/telegram-invite-logs?code=${code}`)
      .then((res) => res.json())
      .then((data) => {
        setInviteLogs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching invite logs:', err);
        message.error('Failed to fetch invite logs');
        setLoading(false);
      });
  };

  const handleSearch = (value) => {
    fetchInviteLogs(value);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Invite ID',
      dataIndex: 'invite_id',
      key: 'invite_id',
    },
    {
      title: 'Telegram ID',
      dataIndex: 'telegram_id',
      key: 'telegram_id',
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Bot ID',
      dataIndex: 'bot_id',
      key: 'bot_id',
    },
    {
      title: 'Is Premium',
      dataIndex: 'is_premium',
      key: 'is_premium',
      render: (isPremium) => (isPremium ? 'Yes' : 'No'),
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => new Date(timestamp).toLocaleString(),
    },
  ];

  return (
    <div>
      <h2>Telegram Invite Logs</h2>
      <Search
        placeholder="Search by code"
        onSearch={handleSearch}
        style={{ marginBottom: 16 }}
      />
      <Table
        columns={columns}
        dataSource={inviteLogs}
        rowKey="id"
        loading={loading}
      />
    </div>
  );
};

export default TelegramInviteLogs;