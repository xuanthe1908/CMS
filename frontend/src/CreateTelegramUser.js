import React from 'react';
import { Form, Input, Button, message, Checkbox, InputNumber } from 'antd';
import { useNavigate } from 'react-router-dom';

const CreateTelegramUser = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = (values) => {
    fetch(`${process.env.REACT_APP_API_URL}/api/telegram-users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
      .then((res) => res.json())
      .then((data) => {
        message.success('Telegram user created successfully');
        form.resetFields();
        navigate('/dashboard');
      })
      .catch((err) => {
        console.error('Error creating telegram user:', err);
        message.error('Failed to create telegram user');
      });
  };

  return (
    <div style={{ padding: '10px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Create Telegram User</h2>
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item name="telegram_id" label="Telegram ID" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="bot_id" label="Bot ID" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="username" label="Username">
          <Input />
        </Form.Item>
        <Form.Item name="lastname" label="Last Name">
          <Input />
        </Form.Item>
        <Form.Item name="firstname" label="First Name">
          <Input />
        </Form.Item>
        <Form.Item name="is_premium" valuePropName="checked">
          <Checkbox>Premium</Checkbox>
        </Form.Item>
        <Form.Item name="point" label="Points">
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="checkin" valuePropName="checked">
          <Checkbox>Checkin</Checkbox>
        </Form.Item>
        <Form.Item name="usdt" label="USDT">
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="count_invite_event" label="Invite Count">
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>Create</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateTelegramUser;