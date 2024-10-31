import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, Select, Modal, Form, message, Tabs, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import Users from './Users';
import TelegramUsers from './TelegramUsers';
import TelegramInviteLogs from './TelegramInviteLogs';
import Data from './components/Data';
import Volume from './components/Volume';
import { useNavigate } from 'react-router-dom';
import AuthContext from './AuthContext';
import './Dashboard.css';

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
  const [activeTab, setActiveTab] = useState('1');
 
  useEffect(() => {
    if (activeTab === '1') {
      fetchData();
    }
  }, [activeTab]);

  const fetchData = () => {
    setLoading(true);
    fetch(`${process.env.REACT_APP_API_URL}/api/tasks`, { credentials: 'include' })
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
    fetch(`${process.env.REACT_APP_API_URL}/api/tasks`, {
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
    fetch(`${process.env.REACT_APP_API_URL}/api/tasks/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
      .then((res) => res.json())
      .then((result) => {
        message.success('Task deleted successfully');
        fetchData();
      })
      .catch((err) => {
        console.error('Delete error:', err);
        message.error(`Error deleting task: ${err.message}`);
      });
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setIsModalVisible(true);
  };

  const handleUpdate = (values) => {
    fetch(`${process.env.REACT_APP_API_URL}/api/tasks/${editingTask.id}`, {
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
      .catch((err) => {
        console.error('Update error:', err);
        message.error(`Error updating task: ${err.message}`);
      });
  };

  const handleSearch = (value) => {
    console.log('Searching with:', { value, criteria: searchCriteria });
    setLoading(true);
    fetch(`${process.env.REACT_APP_API_URL}/api/tasks?search=${encodeURIComponent(value)}&criteria=${encodeURIComponent(searchCriteria)}`, { credentials: 'include' })
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

  const handleTabChange = (key) => {
    setActiveTab(key);
  };
  
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
      width: 70,
    },
    {
      title: 'Task ID',
      dataIndex: 'task_id',
      key: 'task_id',
      width: 100,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 150,
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
    },
    {
      title: 'Point',
      dataIndex: 'point',
      key: 'point',
      width: 80,
    },
    {
      title: 'Start Time',
      dataIndex: 'start_time',
      key: 'start_time',
      width: 150,
      render: (time) => time ? new Date(time).toLocaleString() : '-',
    },
    {
      title: 'End Time',
      dataIndex: 'end_time',
      key: 'end_time',
      width: 150,
      render: (time) => time ? new Date(time).toLocaleString() : '-',
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (text, record) => (
        <Space size="small">
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button type="primary" danger icon={<DeleteOutlined />} onClick={() => showDeleteConfirm(record.id)} />
        </Space>
      ),
    },
  ];

  const renderTasksTab = () => (
    <Card>
      <Space direction="vertical" style={{ width: '100%', marginBottom: '16px' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Select 
            value={searchCriteria}
            style={{ width: 120 }} 
            onChange={(value) => setSearchCriteria(value)}
          >
            <Option value="ID">ID</Option>
            <Option value="Task ID">Task ID</Option>
            <Option value="Title">Title</Option>
          </Select>
          <Search 
            placeholder="Search..." 
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => setIsCreateModalVisible(true)}
          >
            Create New Task
          </Button>
        </Space>
      </Space>
      
      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="id" 
        loading={loading} 
        scroll={{ x: 1200 }}
        size="small"
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`
        }}
      />
    </Card>
  );

  return (
    <div style={{ padding: '10px' }}>
      <Tabs 
        activeKey={activeTab}
        onChange={handleTabChange}
        tabPosition="top" 
        style={{ marginBottom: '20px' }}
      >
        <TabPane tab="Tasks" key="1">
          {renderTasksTab()}
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
        <TabPane tab="Trading Data" key="5">
          <Data />
        </TabPane>
        <TabPane tab="Volume Data" key="6">
          <Volume />
        </TabPane>
      </Tabs>

      {/* Create Task Modal */}
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
          <Form.Item 
            name="task_id" 
            label="Task ID"
            rules={[{ required: true, message: 'Please input task ID!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item 
            name="title" 
            label="Title"
            rules={[{ required: true, message: 'Please input title!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item 
            name="content" 
            label="Content"
            rules={[{ required: true, message: 'Please input content!' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item 
            name="type" 
            label="Type"
            rules={[{ required: true, message: 'Please input type!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item 
            name="point" 
            label="Point"
            rules={[{ required: true, message: 'Please input points!' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item 
            name="start_time" 
            label="Start Time"
          >
            <Input type="datetime-local" />
          </Form.Item>
          <Form.Item 
            name="end_time" 
            label="End Time"
          >
            <Input type="datetime-local" />
          </Form.Item>
          <Form.Item name="picture" label="Picture URL">
            <Input />
          </Form.Item>
          <Form.Item name="bot_id" label="Bot ID">
            <Input />
          </Form.Item>
          <Form.Item name="link" label="Link">
            <Input />
          </Form.Item>
          <Form.Item name="partner_code" label="Partner Code">
            <Input />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create Task
              </Button>
              <Button onClick={() => setIsCreateModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Task Modal */}
      {editingTask && (
        <Modal
          title="Edit Task"
          visible={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingTask(null);
          }}
          footer={null}
        >
          <Form
            initialValues={{
              ...editingTask,
              start_time: editingTask.start_time ? new Date(editingTask.start_time).toISOString().slice(0, 16) : null,
              end_time: editingTask.end_time ? new Date(editingTask.end_time).toISOString().slice(0, 16) : null,
            }}
            onFinish={handleUpdate}
            layout="vertical"
          >
            <Form.Item 
              name="task_id" 
              label="Task ID"
              rules={[{ required: true, message: 'Please input task ID!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item 
              name="title" 
              label="Title"
              rules={[{ required: true, message: 'Please input title!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item 
              name="content" 
              label="Content"
              rules={[{ required: true, message: 'Please input content!' }]}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item 
              name="type" 
              label="Type"
              rules={[{ required: true, message: 'Please input type!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item 
              name="point" 
              label="Point"
              rules={[{ required: true, message: 'Please input points!' }]}
            >
              <Input type="number" />
            </Form.Item>
            <Form.Item 
              name="start_time" 
              label="Start Time"
            >
              <Input type="datetime-local" />
            </Form.Item>
            <Form.Item 
              name="end_time" 
              label="End Time"
            >
              <Input type="datetime-local" />
            </Form.Item>
            <Form.Item name="picture" label="Picture URL">
              <Input />
            </Form.Item>
            <Form.Item name="bot_id" label="Bot ID">
              <Input />
            </Form.Item>
            <Form.Item name="link" label="Link">
              <Input />
            </Form.Item>
            <Form.Item name="partner_code" label="Partner Code">
              <Input />
            </Form.Item>
            <Form.Item>
              <Space>
              <Button type="primary" htmlType="submit">
                  Update Task
                </Button>
                <Button onClick={() => {
                  setIsModalVisible(false);
                  setEditingTask(null);
                }}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      )}

      {/* Confirm Delete Modal - Modal này sẽ được gọi từ showDeleteConfirm */}
      <Modal
        title="Delete Task"
        visible={false} // Controlled by confirm()
        onOk={() => {}} // Handled by confirm()
        onCancel={() => {}} // Handled by confirm()
      >
        <p>Are you sure you want to delete this task?</p>
      </Modal>

      {/* Error Modal - Optional, for displaying errors */}
      <Modal
        title="Error"
        visible={false} // Control this with a new state if needed
        onOk={() => {}}
        onCancel={() => {}}
      >
        <p>An error occurred.</p>
      </Modal>
    </div>
  );
};

// Style constants
const styles = {
  tabContent: {
    padding: '20px',
    minHeight: '500px',
  },
  searchSection: {
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
  },
  cardStyle: {
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  },
};

// PropTypes for type checking (if you're using prop-types)
Dashboard.propTypes = {
  // Add your propTypes here if needed
};

export default Dashboard;