import React from 'react';
import { Form, Input, Button, message, Upload } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UploadOutlined } from '@ant-design/icons';

const CreateUser = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = (values) => {
    const { avatar, cover, ...rest } = values;
    const formData = {
      ...rest,
      avatar: avatar ? avatar[0].response.url : null,
      cover: cover ? cover[0].response.url : null,
    };
    
    fetch(`${process.env.REACT_APP_API_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        message.success('User created successfully');
        form.resetFields();
        navigate('/dashboard');
      })
      .catch((err) => {
        console.error('Error creating user:', err);
        message.error('Failed to create user');
      });
  };

  return (
    <div style={{ padding: '10px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Create User</h2>
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="wallet_address" label="Wallet Address">
          <Input />
        </Form.Item>
        <Form.Item name="name" label="Name">
          <Input />
        </Form.Item>
        <Form.Item name="stripe_customer_id" label="Stripe Customer ID">
          <Input />
        </Form.Item>
        <Form.Item name="referral_code" label="Referral Code">
          <Input />
        </Form.Item>
        <Form.Item name="avatar" label="Avatar">
          <Upload
            name="avatar"
            action={`${process.env.REACT_APP_API_URL}/api/upload`}
            listType="picture"
            maxCount={1}
          >
            <Button icon={<UploadOutlined />} block>Upload Avatar</Button>
          </Upload>
        </Form.Item>
        <Form.Item name="cover" label="Cover">
          <Upload
            name="cover"
            action={`${process.env.REACT_APP_API_URL}/api/upload`}
            listType="picture"
            maxCount={1}
          >
            <Button icon={<UploadOutlined />} block>Upload Cover</Button>
          </Upload>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>Create User</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateUser;