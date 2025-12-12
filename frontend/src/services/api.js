const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Helper function to get auth token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// API service functions
export const api = {
  // Auth endpoints
  async register(name, email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
      
      // Check if response is ok before trying to parse JSON
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // If response is not JSON, it's likely a server error
        throw new Error(`Server error: ${response.status} ${response.statusText}. Make sure the backend is running on ${API_BASE_URL.replace('/api', '')}`);
      }
      
      if (!response.ok) {
        // Handle Laravel validation errors
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(', ');
          throw new Error(errorMessages || data.message || 'Registration failed');
        }
        throw new Error(data.message || 'Registration failed');
      }
      
      return data;
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        throw new Error(`Network error: Could not connect to server at ${API_BASE_URL}. Please check:\n1. Backend is running (php artisan serve)\n2. Backend URL is correct\n3. No firewall blocking the connection`);
      }
      throw error;
    }
  },

  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      // Check if response is ok before trying to parse JSON
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // If response is not JSON, it's likely a server error
        throw new Error(`Server error: ${response.status} ${response.statusText}. Make sure the backend is running on ${API_BASE_URL.replace('/api', '')}`);
      }
      
      if (!response.ok) {
        // Handle Laravel validation errors
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(', ');
          throw new Error(errorMessages || data.message || 'Login failed');
        }
        throw new Error(data.message || 'Login failed');
      }
      
      return data;
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        throw new Error(`Network error: Could not connect to server at ${API_BASE_URL}. Please check:\n1. Backend is running (php artisan serve)\n2. Backend URL is correct\n3. No firewall blocking the connection`);
      }
      throw error;
    }
  },

  async logout() {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Logout failed');
    }
    
    return response.json();
  },

  // Categories endpoints
  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    return response.json();
  },

  async createCategory(name) {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create category');
    }
    
    return response.json();
  },

  // Tasks endpoints
  async getTasks() {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    
    return response.json();
  },

  async getTask(id) {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch task');
    }
    
    return response.json();
  },

  async createTask(taskData) {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create task');
    }
    
    return response.json();
  },

  async updateTask(id, taskData) {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update task');
    }
    
    return response.json();
  },

  async deleteTask(id) {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete task');
    }
    
    return response.json();
  },

  // Admin endpoints
  async getAdminDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard-stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }
    
    return response.json();
  },

  async getAdminUsers() {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    return response.json();
  },

  async createAdminUser(userData) {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create user');
    }
    
    return response.json();
  },

  async getAdminUser(id) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    
    return response.json();
  },

  async updateAdminUser(id, userData) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update user');
    }
    
    return response.json();
  },

  async deleteAdminUser(id) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete user');
    }
    
    return response.json();
  },

  async getAdminTasks() {
    const response = await fetch(`${API_BASE_URL}/admin/tasks`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    
    return response.json();
  },

  async getAdminTask(id) {
    const response = await fetch(`${API_BASE_URL}/admin/tasks/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch task');
    }
    
    return response.json();
  },

  async updateAdminTask(id, taskData) {
    const response = await fetch(`${API_BASE_URL}/admin/tasks/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update task');
    }
    
    return response.json();
  },

  async deleteAdminTask(id) {
    const response = await fetch(`${API_BASE_URL}/admin/tasks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete task');
    }
    
    return response.json();
  },
};

