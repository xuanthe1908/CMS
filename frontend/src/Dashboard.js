import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, Select, Modal, Form, message, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import Users from './Users';
import TelegramUsers from './TelegramUsers';
import TelegramInviteLogs from './TelegramInviteLogs';
import { useNavigate } from 'react-router-dom';
import AuthContext from './AuthContext';

const { Search } = Input;
const { Option } = Select;
const { confirm } = Modal;
const { TabPane } = Tabs;

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState('ID');
 
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    fetch('/api/tasks', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('Fetched data:', data);
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setLoading(false);
        message.error(`Error fetching tasks: ${err.message}`);
      });
  };

  const handleCreate = (values) => {
    console.log('Creating task with:', values);
    fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
      credentials: 'include'
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then(err => { throw err; });
        }
        return res.json();
      })
      .then((data) => {
        console.log('Task created:', data);
        message.success('Task created successfully');
        fetchData();
        setIsCreateModalVisible(false);
      })
      .catch((err) => {
        console.error('Create error:', err);
        message.error(`Error creating task: ${err.message}`);
      });
  };

  const showDeleteConfirm = (id) => {
    confirm({
      title: 'Are you sure delete this task?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        handleDelete(id);
      },
    });
  };

  const handleDelete = (id) => {
    fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
      .then((res) => res.json())
      .then((result) => {
        message.success('Task deleted successfully');
        fetchData();
      })
      .catch((err) => console.error(err));
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setIsModalVisible(true);
  };

  const handleUpdate = (values) => {
    fetch(`/api/tasks/${editingTask.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
      credentials: 'include'
    })
      .then((res) => res.json())
      .then(() => {
        message.success('Task updated successfully');
        fetchData();
        setIsModalVisible(false);
      })
      .catch((err) => console.error(err));
  };

  const handleSearch = (value) => {
    console.log('Searching with:', { value, criteria: searchCriteria });
    setLoading(true);
    fetch(`/api/tasks?search=${encodeURIComponent(value)}&criteria=${encodeURIComponent(searchCriteria)}`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('Search results:', data);
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Search error:', err);
        setLoading(false);
        message.error(`Error searching tasks: ${err.message}`);
      });
  };
  
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Task ID',
      dataIndex: 'task_id',
      key: 'task_id',
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Point',
      dataIndex: 'point',
      key: 'point',
    },
    {
      title: 'Start Time',
      dataIndex: 'start_time',
      key: 'start_time',
      render: (time) => new Date(time).toLocaleString(),
    },
    {
      title: 'End Time',
      dataIndex: 'end_time',
      key: 'end_time',
      render: (time) => new Date(time).toLocaleString(),
    },
    {
      title: 'Picture',
      dataIndex: 'picture',
      key: 'picture',
      render: (text) => <img src={text} alt="task" style={{ width: '50px', height: '50px' }} />,
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button type="danger" icon={<DeleteOutlined />} onClick={() => showDeleteConfirm(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Tasks" key="1">
          <div style={{ marginBottom: 16 }}>
            <Space>
              <Select 
                defaultValue="ID" 
                style={{ width: 120 }} 
                onChange={(value) => setSearchCriteria(value)}
              >
                <Option value="ID">ID</Option>
                <Option value="Task ID">Task ID</Option>
                <Option value="Title">Title</Option>
              </Select>
              <Search 
                placeholder="Search..." 
                enterButton 
                onSearch={handleSearch}
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalVisible(true)}>
                Create
              </Button>
            </Space>
          </div>
          <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />
        </TabPane>
        <TabPane tab="Users" key="2">
          <Users />
        </TabPane>
        <TabPane tab="Telegram Users" key="3">
          <TelegramUsers />
        </TabPane>
        <TabPane tab="Telegram Invite Logs" key="4">
          <TelegramInviteLogs />
        </TabPane>
      </Tabs>

      <Modal
        title="Create Task"
        visible={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
      >
        <Form
          onFinish={handleCreate}
          layout="vertical"
        >
          <Form.Item name="task_id" label="Task ID">
            <Input />
          </Form.Item>
          <Form.Item name="title" label="Title">
            <Input />
          </Form.Item>
          <Form.Item name="content" label="Content">
            <Input />
          </Form.Item>
          <Form.Item name="type" label="Type">
            <Input />
          </Form.Item>
          <Form.Item name="point" label="Point">
            <Input />
          </Form.Item>
          <Form.Item name="start_time" label="Start Time">
            <Input type="number" />
          </Form.Item>
          <Form.Item name="end_time" label="End Time">
            <Input type="number" />
          </Form.Item>
          <Form.Item name="picture" label="Picture URL">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create Task
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {editingTask && (
        <Modal
          title="Edit Task"
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
        >
          <Form
            initialValues={editingTask}
            onFinish={handleUpdate}
            layout="vertical"
          >
            <Form.Item name="task_id" label="Task ID">
              <Input />
            </Form.Item>
            <Form.Item name="title" label="Title">
              <Input />
            </Form.Item>
            <Form.Item name="content" label="Content">
              <Input />
            </Form.Item>
            <Form.Item name="type" label="Type">
              <Input />
            </Form.Item>
            <Form.Item name="point" label="Point">
              <Input />
            </Form.Item>
            <Form.Item name="start_time" label="Start Time">
              <Input type="number" />
            </Form.Item>
            <Form.Item name="end_time" label="End Time">
              <Input type="number" />
            </Form.Item>
            <Form.Item name="picture" label="Picture URL">
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Update Task
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;