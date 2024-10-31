import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, message, Space } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { confirm } = Modal;

const VolumeComponent = () => {
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
    fetch(`${process.env.REACT_APP_API_URL}/api/volume`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching volume data:', err);
        message.error('Failed to fetch volume data');
        setLoading(false);
      });
  };

  const handleCreate = (values) => {
    fetch(`${process.env.REACT_APP_API_URL}/api/volume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
      credentials: 'include'
    })
      .then(res => res.json())
      .then(() => {
        message.success('Volume record created successfully');
        fetchData();
        setIsModalVisible(false);
        form.resetFields();
      })
      .catch(err => {
        console.error('Error creating volume record:', err);
        message.error('Failed to create volume record');
      });
  };

  const handleUpdate = (values) => {
    fetch(`${process.env.REACT_APP_API_URL}/api/volume/${editingRecord.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
      credentials: 'include'
    })
      .then(res => res.json())
      .then(() => {
        message.success('Volume record updated successfully');
        fetchData();
        setIsModalVisible(false);
        setEditingRecord(null);
        form.resetFields();
      })
      .catch(err => {
        console.error('Error updating volume record:', err);
        message.error('Failed to update volume record');
      });
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Are you sure you want to delete this volume record?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone',
      onOk() {
        fetch(`${process.env.REACT_APP_API_URL}/api/volume/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        })
          .then(() => {
            message.success('Volume record deleted successfully');
            fetchData();
          })
          .catch(err => {
            console.error('Error deleting volume record:', err);
            message.error('Failed to delete volume record');
          });
      },
    });
  };

  const columns = [
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Total BTC Volume (USD)', dataIndex: 'total_btc_volume_usd', key: 'total_btc_volume_usd' },
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

  return (
    <Card title="Volume Data">
      <Button type="primary" onClick={() => {
        setEditingRecord(null);
        form.resetFields();
        setIsModalVisible(true);
      }} style={{ marginBottom: 16 }}>
        Add New Volume Record
      </Button>

      <ResponsiveContainer width="100%" height={400} style={{ marginBottom: 16 }}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="total_btc_volume_usd" 
            stroke="#8884d8" 
            name="Total BTC Volume (USD)" 
          />
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
        title={editingRecord ? 'Edit Volume Record' : 'Add New Volume Record'}
        visible={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingRecord(null);
          form.resetFields();
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingRecord ? handleUpdate : handleCreate}
        >
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true }]}
          >
            <Input type="date" />
          </Form.Item>
          <Form.Item
            name="total_btc_volume_usd"
            label="Total BTC Volume (USD)"
            rules={[{ required: true }]}
          >
            <Input type="number" step="0.01" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default VolumeComponent;