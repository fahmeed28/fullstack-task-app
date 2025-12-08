import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import './Tasks.css';

function Tasks() {
  const { user, logout } = useAuth();
  const { success, error: showError } = useToast();
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    category_id: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksData, categoriesData] = await Promise.all([
        api.getTasks(),
        api.getCategories(),
      ]);
      setTasks(Array.isArray(tasksData) ? tasksData : tasksData.data || []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : categoriesData.data || []);
    } catch (err) {
      showError('Failed to load data. Please try again.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = [...tasks];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((task) => task.category_id === parseInt(categoryFilter));
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'category':
          return getCategoryName(a.category_id).localeCompare(getCategoryName(b.category_id));
        default:
          return 0;
      }
    });

    return filtered;
  }, [tasks, searchQuery, statusFilter, categoryFilter, sortBy]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const pending = tasks.filter((t) => t.status === 'pending').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, completionRate };
  }, [tasks]);

  const handleOpenModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending',
        category_id: task.category_id || '',
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        category_id: categories[0]?.id || '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      status: 'pending',
      category_id: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingTask) {
        await api.updateTask(editingTask.id, formData);
        success('Task updated successfully!');
      } else {
        await api.createTask(formData);
        success('Task created successfully!');
      }
      handleCloseModal();
      loadData();
    } catch (err) {
      showError(err.message || 'Failed to save task');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await api.deleteTask(id);
      success('Task deleted successfully!');
      loadData();
    } catch (err) {
      showError(err.message || 'Failed to delete task');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      showError('Category name is required');
      return;
    }

    try {
      await api.createCategory(newCategoryName.trim());
      success('Category created successfully!');
      setNewCategoryName('');
      setShowCategoryModal(false);
      loadData();
    } catch (err) {
      showError(err.message || 'Failed to create category');
    }
  };

  const getStatusClass = (status) => {
    return status === 'completed' ? 'status-completed' : 'status-pending';
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="tasks-container">
        <div className="loading-skeleton">
          <div className="skeleton-header"></div>
          <div className="skeleton-stats">
            <div className="skeleton-stat"></div>
            <div className="skeleton-stat"></div>
            <div className="skeleton-stat"></div>
          </div>
          <div className="skeleton-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-card"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tasks-container">
      <header className="tasks-header">
        <div>
          <h1>My Tasks</h1>
          <p>Welcome, {user?.name}!</p>
        </div>
        <div className="header-actions">
          {user?.is_admin && (
            <a href="/admin" className="btn-admin">
              🔐 Admin Panel
            </a>
          )}
          <button onClick={() => handleOpenModal()} className="btn-primary">
            + New Task
          </button>
          <button onClick={logout} className="btn-secondary">
            Logout
          </button>
        </div>
      </header>

      {/* Statistics Dashboard */}
      <div className="stats-dashboard">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{stats.completionRate}%</div>
            <div className="stat-label">Completion Rate</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="filters-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filters">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="title">Sort by Title</option>
            <option value="status">Sort by Status</option>
            <option value="category">Sort by Category</option>
          </select>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="btn-category"
            title="Add Category"
          >
            + Category
          </button>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="tasks-grid">
        {filteredAndSortedTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>
              {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'No tasks match your filters'
                : 'No tasks yet'}
            </h3>
            <p>
              {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first task to get started!'}
            </p>
            {(!searchQuery && statusFilter === 'all' && categoryFilter === 'all') && (
              <button onClick={() => handleOpenModal()} className="btn-primary">
                Create Your First Task
              </button>
            )}
          </div>
        ) : (
          filteredAndSortedTasks.map((task) => (
            <div key={task.id} className="task-card">
              <div className="task-header">
                <h3>{task.title}</h3>
                <div className="task-actions">
                  <button
                    onClick={() => handleOpenModal(task)}
                    className="btn-icon"
                    title="Edit"
                    aria-label="Edit task"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="btn-icon"
                    title="Delete"
                    aria-label="Delete task"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <p className="task-description">{task.description || 'No description'}</p>
              <div className="task-footer">
                <span className={`status-badge ${getStatusClass(task.status)}`}>
                  {task.status}
                </span>
                <span className="category-badge">
                  {getCategoryName(task.category_id)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
              <button onClick={handleCloseModal} className="btn-close" aria-label="Close">
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Enter task title"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter task description"
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="category_id">Category *</label>
                <select
                  id="category_id"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingTask ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Category</h2>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="btn-close"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateCategory}>
              <div className="form-group">
                <label htmlFor="category-name">Category Name</label>
                <input
                  type="text"
                  id="category-name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  required
                  placeholder="Enter category name"
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;
