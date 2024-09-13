import React from 'react';
import { Form, Input, Button, message, Checkbox, InputNumber } from 'antd';
import { useNavigate } from 'react-router-dom';

const CreateTelegramUser = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = (values) => {
    fetch('/api/telegram-users', {
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
    <div>
      <h2>Create Telegram User</h2>
      <Form form={form} onFinish={onFinish}>
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
        <Form.Item name="is_premium" label="Premium" valuePropName="checked">
          <Checkbox />
        </Form.Item>
        <Form.Item name="point" label="Points">
          <InputNumber min={0} />
        </Form.Item>
        <Form.Item name="checkin" label="Checkin" valuePropName="checked">
          <Checkbox />
        </Form.Item>
        <Form.Item name="usdt" label="USDT">
          <InputNumber min={0} />
        </Form.Item>
        <Form.Item name="count_invite_event" label="Invite Count">
          <InputNumber min={0} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">Create</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateTelegramUser;