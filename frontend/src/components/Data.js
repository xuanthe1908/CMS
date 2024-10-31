import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, message, Space } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { confirm } = Modal;

const DataComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    fetch(`${process.env.REACT_APP_API_URL}/api/data`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        message.error('Failed to fetch data');
        setLoading(false);
      });
  };

  const handleCreate = (values) => {
    fetch(`${process.env.REACT_APP_API_URL}/api/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
      credentials: 'include'
    })
      .then(res => res.json())
      .then(() => {
        message.success('Record created successfully');
        fetchData();
        setIsModalVisible(false);
        form.resetFields();
      })
      .catch(err => {
        console.error('Error creating record:', err);
        message.error('Failed to create record');
      });
  };

  const handleUpdate = (values) => {
    fetch(`${process.env.REACT_APP_API_URL}/api/data/${editingRecord.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
      credentials: 'include'
    })
      .then(res => res.json())
      .then(() => {
        message.success('Record updated successfully');
        fetchData();
        setIsModalVisible(false);
        setEditingRecord(null);
        form.resetFields();
      })
      .catch(err => {
        console.error('Error updating record:', err);
        message.error('Failed to update record');
      });
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Are you sure you want to delete this record?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone',
      onOk() {
        fetch(`${process.env.REACT_APP_API_URL}/api/data/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        })
          .then(() => {
            message.success('Record deleted successfully');
            fetchData();
          })
          .catch(err => {
            console.error('Error deleting record:', err);
            message.error('Failed to delete record');
          });
      },
    });
  };

  const columns = [
    { title: 'Trading Pair', dataIndex: 'trading_pair', key: 'trading_pair' },
    { title: 'Amount 1', dataIndex: 'amount1', key: 'amount1' },
    { title: 'Amount 2', dataIndex: 'amount2', key: 'amount2' },
    { title: 'Thor Trading Rate', dataIndex: 'thor_trading_rate', key: 'thor_trading_rate' },
    { title: 'Binance Price', dataIndex: 'binance_price', key: 'binance_price' },
    { title: 'Slippage vs Binance', dataIndex: 'slippage_vs_binance', key: 'slippage_vs_binance' },
    { title: 'Protocol Fee', dataIndex: 'protocol_fee', key: 'protocol_fee' },
    { title: 'Affiliate Fee', dataIndex: 'affiliate_fee', key: 'affiliate_fee' },
    { title: 'Affiliate Fee Amount', dataIndex: 'affiliate_fee_amount', key: 'affiliate_fee_amount' },
    { title: 'Affiliate Fee Percentage', dataIndex: 'affiliate_fee_percentage', key: 'affiliate_fee_percentage' },
    { title: 'Liquidity Fee', dataIndex: 'liquidity_fee', key: 'liquidity_fee' },
    { title: 'Slippage', dataIndex: 'slippage', key: 'slippage' },
    { title: 'USD Worth', dataIndex: 'usd_worth', key: 'usd_worth' },
    { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp' },
    { title: 'Time Till Completion', dataIndex: 'time_till_completion', key: 'time_till_completion' },
    { title: 'Transaction Hash', dataIndex: 'transaction_hash', key: 'transaction_hash' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => {
            setEditingRecord(record);
            form.setFieldsValue(record);
            setIsModalVisible(true);
          }} />
          <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} danger />
        </Space>
      ),
    },
  ];

  const formItems = [
    { name: 'trading_pair', label: 'Trading Pair', rules: [{ required: true }] },
    { name: 'amount1', label: 'Amount 1', rules: [{ required: true }] },
    { name: 'amount2', label: 'Amount 2', rules: [{ required: true }] },
    { name: 'thor_trading_rate', label: 'Thor Trading Rate', rules: [{ required: true }] },
    { name: 'binance_price', label: 'Binance Price', rules: [{ required: true }] },
    { name: 'slippage_vs_binance', label: 'Slippage vs Binance' },
    { name: 'protocol_fee', label: 'Protocol Fee' },
    { name: 'affiliate_fee', label: 'Affiliate Fee' },
    { name: 'affiliate_fee_amount', label: 'Affiliate Fee Amount' },
    { name: 'affiliate_fee_percentage', label: 'Affiliate Fee Percentage' },
    { name: 'liquidity_fee', label: 'Liquidity Fee' },
    { name: 'slippage', label: 'Slippage' },
    { name: 'usd_worth', label: 'USD Worth' },
    { name: 'timestamp', label: 'Timestamp' },
    { name: 'time_till_completion', label: 'Time Till Completion' },
    { name: 'transaction_hash', label: 'Transaction Hash' },
  ];

  return (
    <Card title="Trading Data">
      <Button type="primary" onClick={() => {
        setEditingRecord(null);
        form.resetFields();
        setIsModalVisible(true);
      }} style={{ marginBottom: 16 }}>
        Add New Record
      </Button>

      <ResponsiveContainer width="100%" height={400} style={{ marginBottom: 16 }}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="usd_worth" stroke="#8884d8" name="USD Worth" />
          <Line type="monotone" dataKey="amount1" stroke="#82ca9d" name="Amount 1" />
        </LineChart>
      </ResponsiveContainer>

      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        scroll={{ x: true }}
        rowKey="id"
      />

      <Modal
        title={editingRecord ? 'Edit Record' : 'Add New Record'}
        visible={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingRecord(null);
          form.resetFields();
        }}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingRecord ? handleUpdate : handleCreate}
        >
          {formItems.map(item => (
            <Form.Item
              key={item.name}
              name={item.name}
              label={item.label}
              rules={item.rules}
            >
              <Input />
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </Card>
  );
};

export default DataComponent;