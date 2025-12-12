import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import './AdminDashboard.css';

function AdminDashboard() {
  const { user, logout } = useAuth();
  const { success, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [userFormData, setUserFormData] = useState({ name: '', email: '', is_admin: false });
  const [createAdminFormData, setCreateAdminFormData] = useState({ name: '', email: '', password: '', is_admin: true });
  const [taskFormData, setTaskFormData] = useState({ title: '', description: '', status: 'pending', category_id: '' });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'tasks') {
      loadTasks();
    }
  }, [activeTab]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const statsData = await api.getAdminDashboardStats();
      setStats(statsData);
    } catch (err) {
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await api.getAdminUsers();
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      showError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      const [tasksData, categoriesData] = await Promise.all([
        api.getAdminTasks(),
        api.getCategories(),
      ]);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      showError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      is_admin: user.is_admin || false,
    });
    setShowUserModal(true);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This will also delete all their tasks.')) {
      return;
    }

    try {
      await api.deleteAdminUser(id);
      success('User deleted successfully');
      loadUsers();
      if (activeTab === 'dashboard') loadDashboardData();
    } catch (err) {
      showError(err.message || 'Failed to delete user');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await api.updateAdminUser(selectedUser.id, userFormData);
      success('User updated successfully');
      setShowUserModal(false);
      setSelectedUser(null);
      setUserFormData({ name: '', email: '', is_admin: false });
      loadUsers();
      if (activeTab === 'dashboard') loadDashboardData();
    } catch (err) {
      showError(err.message || 'Failed to update user');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await api.createAdminUser(createAdminFormData);
      success('Admin user created successfully');
      setShowCreateAdminModal(false);
      setCreateAdminFormData({ name: '', email: '', password: '', is_admin: true });
      loadUsers();
      if (activeTab === 'dashboard') loadDashboardData();
    } catch (err) {
      showError(err.message || 'Failed to create admin user');
    }
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setTaskFormData({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'pending',
      category_id: task.category_id || '',
    });
    setShowTaskModal(true);
  };

  const handleCreateAdminClick = () => {
    setCreateAdminFormData({ name: '', email: '', password: '', is_admin: true });
    setShowCreateAdminModal(true);
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await api.deleteAdminTask(id);
      success('Task deleted successfully');
      loadTasks();
      if (activeTab === 'dashboard') loadDashboardData();
    } catch (err) {
      showError(err.message || 'Failed to delete task');
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      await api.updateAdminTask(selectedTask.id, taskFormData);
      success('Task updated successfully');
      setShowTaskModal(false);
      setSelectedTask(null);
      setTaskFormData({ title: '', description: '', status: 'pending', category_id: '' });
      loadTasks();
      if (activeTab === 'dashboard') loadDashboardData();
    } catch (err) {
      showError(err.message || 'Failed to update task');
    }
  };

  if (loading && !stats) {
    return (
      <div className="admin-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome, {user?.name}!</p>
        </div>
        <div className="admin-header-actions">
          <a href="/tasks" className="btn-link">Go to Tasks</a>
          <button onClick={logout} className="btn-secondary">
            Logout
          </button>
        </div>
      </header>

      <div className="admin-tabs">
        <button
          className={activeTab === 'dashboard' ? 'tab-active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={activeTab === 'users' ? 'tab-active' : ''}
          onClick={() => setActiveTab('users')}
        >
          👥 Users ({users.length || stats?.total_users || 0})
        </button>
        <button
          className={activeTab === 'tasks' ? 'tab-active' : ''}
          onClick={() => setActiveTab('tasks')}
        >
          📋 All Tasks ({tasks.length || stats?.total_tasks || 0})
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'dashboard' && stats && (
          <div className="dashboard-stats">
            <div className="stat-card-large">
              <div className="stat-icon-large">👥</div>
              <div className="stat-content-large">
                <div className="stat-value-large">{stats.total_users}</div>
                <div className="stat-label-large">Total Users</div>
                <div className="stat-subtext">+{stats.new_users_today} today</div>
              </div>
            </div>
            <div className="stat-card-large">
              <div className="stat-icon-large">📋</div>
              <div className="stat-content-large">
                <div className="stat-value-large">{stats.total_tasks}</div>
                <div className="stat-label-large">Total Tasks</div>
                <div className="stat-subtext">+{stats.new_tasks_today} today</div>
              </div>
            </div>
            <div className="stat-card-large">
              <div className="stat-icon-large">✅</div>
              <div className="stat-content-large">
                <div className="stat-value-large">{stats.completed_tasks}</div>
                <div className="stat-label-large">Completed Tasks</div>
                <div className="stat-subtext">
                  {stats.total_tasks > 0
                    ? Math.round((stats.completed_tasks / stats.total_tasks) * 100)
                    : 0}% completion rate
                </div>
              </div>
            </div>
            <div className="stat-card-large">
              <div className="stat-icon-large">⏳</div>
              <div className="stat-content-large">
                <div className="stat-value-large">{stats.pending_tasks}</div>
                <div className="stat-label-large">Pending Tasks</div>
                <div className="stat-subtext">In progress</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="admin-table-container">
            <div className="table-header-actions">
              <button
                onClick={handleCreateAdminClick}
                className="btn-primary btn-create"
              >
                ➕ Create New Admin
              </button>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={u.is_admin ? 'badge-admin' : 'badge-user'}>
                        {u.is_admin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button onClick={() => handleEditUser(u)} className="btn-icon-small" title="Edit">
                          ✏️
                        </button>
                        {u.id !== user?.id && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="btn-icon-small btn-danger"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="admin-tasks-grid">
            {tasks.map((task) => (
              <div key={task.id} className="admin-task-card">
                <div className="admin-task-header">
                  <h3>{task.title}</h3>
                  <div className="admin-task-actions">
                    <button
                      onClick={() => handleEditTask(task)}
                      className="btn-icon-small"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="btn-icon-small btn-danger"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <p className="admin-task-description">{task.description || 'No description'}</p>
                <div className="admin-task-meta">
                  <div>
                    <strong>User:</strong> {task.user?.name || 'Unknown'}
                  </div>
                  <div>
                    <strong>Category:</strong> {task.category?.name || 'Uncategorized'}
                  </div>
                  <div>
                    <span className={`status-badge ${task.status === 'completed' ? 'status-completed' : 'status-pending'}`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Admin Modal */}
      {showCreateAdminModal && (
        <div className="modal-overlay" onClick={() => setShowCreateAdminModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Admin User</h2>
              <button onClick={() => setShowCreateAdminModal(false)} className="btn-close">
                ×
              </button>
            </div>
            <form onSubmit={handleCreateAdmin}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={createAdminFormData.name}
                  onChange={(e) => setCreateAdminFormData({ ...createAdminFormData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={createAdminFormData.email}
                  onChange={(e) => setCreateAdminFormData({ ...createAdminFormData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={createAdminFormData.password}
                  onChange={(e) => setCreateAdminFormData({ ...createAdminFormData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={createAdminFormData.is_admin}
                    onChange={(e) => setCreateAdminFormData({ ...createAdminFormData, is_admin: e.target.checked })}
                  />
                  Admin User
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateAdminModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Edit Modal */}
      {showUserModal && (
        <div className="modal-overlay" onClick={() => {
          setShowUserModal(false);
          setSelectedUser(null);
          setUserFormData({ name: '', email: '', is_admin: false });
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit User</h2>
              <button onClick={() => {
                setShowUserModal(false);
                setSelectedUser(null);
                setUserFormData({ name: '', email: '', is_admin: false });
              }} className="btn-close">
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateUser}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={userFormData.is_admin}
                    onChange={(e) => setUserFormData({ ...userFormData, is_admin: e.target.checked })}
                  />
                  Admin User
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                  setUserFormData({ name: '', email: '', is_admin: false });
                }} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Edit Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => {
          setShowTaskModal(false);
          setSelectedTask(null);
          setTaskFormData({ title: '', description: '', status: 'pending', category_id: '' });
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Task</h2>
              <button onClick={() => {
                setShowTaskModal(false);
                setSelectedTask(null);
                setTaskFormData({ title: '', description: '', status: 'pending', category_id: '' });
              }} className="btn-close">
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateTask}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={taskFormData.description}
                  onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={taskFormData.status}
                  onChange={(e) => setTaskFormData({ ...taskFormData, status: e.target.value })}
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              {categories.length > 0 && (
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={taskFormData.category_id}
                    onChange={(e) => setTaskFormData({ ...taskFormData, category_id: e.target.value })}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="modal-actions">
                <button type="button" onClick={() => {
                  setShowTaskModal(false);
                  setSelectedTask(null);
                  setTaskFormData({ title: '', description: '', status: 'pending', category_id: '' });
                }} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;

