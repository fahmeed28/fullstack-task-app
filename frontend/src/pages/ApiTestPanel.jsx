import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { apiClient } from '../services/apiClient';
import './ApiTestPanel.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function ApiTestPanel() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [userToken, setUserToken] = useState('');
  const [createdUserId, setCreatedUserId] = useState(null);
  const [createdTaskId, setCreatedTaskId] = useState(null);

  useEffect(() => {
    // Load tokens from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.is_admin) {
        setAdminToken(token);
      } else {
        setUserToken(token);
      }
    }
  }, []);

  const addResult = (testName, status, response, error = null, expectedStatus = null, actualStatusCode = null) => {
    const statusCode = actualStatusCode || error?.status || response?.status || (status === 'success' ? 200 : 'N/A');
    const result = {
      id: Date.now() + Math.random(),
      testName,
      status,
      statusCode,
      response: response?.data || response || null,
      error: error?.message || null,
      errorData: error?.data || null,
      expectedStatus,
      passed: expectedStatus 
        ? (statusCode === expectedStatus) 
        : (status === 'success' && (statusCode >= 200 && statusCode < 300)),
      timestamp: new Date().toLocaleTimeString(),
    };
    setResults(prev => [result, ...prev]);
  };

  const runTest = async (testName, testFn, expectedStatus = null) => {
    setLoading(true);
    try {
      const response = await testFn();
      // If we expected an error status but got success, that's a failure
      if (expectedStatus && expectedStatus >= 400) {
        addResult(testName, 'error', null, { status: 200, message: 'Expected error but got success' }, expectedStatus, 200);
      } else {
        addResult(testName, 'success', { status: 200, data: response }, null, expectedStatus, 200);
      }
    } catch (error) {
      // If we expected an error status and got it, that's a pass
      addResult(testName, 'error', null, error, expectedStatus, error.status);
    } finally {
      setLoading(false);
    }
  };

  // Test Functions
  const testRegister = async () => {
    const email = `test${Date.now()}@example.com`;
    setTestEmail(email);
    const response = await apiClient.post('/register', {
      name: 'Test User',
      email,
      password: 'password123',
    }, { includeAuth: false });
    if (response.token) {
      setUserToken(response.token);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  };

  const testRegisterDuplicate = async () => {
    if (!testEmail) {
      throw new Error('Please run "Test Register" first to get a test email');
    }
    await apiClient.post('/register', {
      name: 'Test User',
      email: testEmail,
      password: 'password123',
    }, { includeAuth: false });
  };

  const testLoginValid = async () => {
    const email = testEmail || 'test@example.com';
    const password = testPassword || 'password123';
    const response = await apiClient.post('/login', {
      email,
      password,
    }, { includeAuth: false });
    if (response.token) {
      setUserToken(response.token);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  };

  const testLoginInvalid = async () => {
    await apiClient.post('/login', {
      email: 'nonexistent@example.com',
      password: 'wrongpassword',
    }, { includeAuth: false });
  };

  const testLogoutWithoutToken = async () => {
    await apiClient.post('/logout', null, { includeAuth: false });
  };

  const testLogoutWithToken = async () => {
    if (!userToken && !adminToken) {
      throw new Error('Please login first');
    }
    const token = userToken || adminToken;
    await apiClient.post('/logout', null, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const testTasksListWithoutToken = async () => {
    await apiClient.get('/tasks', { includeAuth: false });
  };

  const testTasksListWithToken = async () => {
    if (!userToken) {
      throw new Error('Please login first');
    }
    const response = await apiClient.get('/tasks', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    return response;
  };

  const testCreateTask = async () => {
    if (!userToken) {
      throw new Error('Please login first');
    }
    // First get categories
    const categories = await apiClient.get('/categories', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (!categories || categories.length === 0) {
      // Create a category first
      const category = await apiClient.post('/categories', { name: 'Test Category' }, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const task = await apiClient.post('/tasks', {
        category_id: category.id,
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
      }, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      setCreatedTaskId(task.id);
      return task;
    }
    const task = await apiClient.post('/tasks', {
      category_id: categories[0].id,
      title: 'Test Task',
      description: 'Test Description',
      status: 'pending',
    }, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    setCreatedTaskId(task.id);
    return task;
  };

  const testUpdateTask = async () => {
    if (!userToken) {
      throw new Error('Please login first');
    }
    if (!createdTaskId) {
      throw new Error('Please create a task first');
    }
    const response = await apiClient.put(`/tasks/${createdTaskId}`, {
      category_id: 1,
      title: 'Updated Test Task',
      description: 'Updated Description',
      status: 'completed',
    }, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    return response;
  };

  const testDeleteTask = async () => {
    if (!userToken) {
      throw new Error('Please login first');
    }
    if (!createdTaskId) {
      throw new Error('Please create a task first');
    }
    await apiClient.delete(`/tasks/${createdTaskId}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    setCreatedTaskId(null);
  };

  const testAdminEndpointsWithNormalToken = async () => {
    if (!userToken) {
      throw new Error('Please login first (as normal user)');
    }
    await apiClient.get('/admin/users', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
  };

  const testAdminEndpointsWithAdminToken = async () => {
    if (!adminToken) {
      throw new Error('Please login as admin first');
    }
    const response = await apiClient.get('/admin/users', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    return response;
  };

  const testAdminCreateUser = async () => {
    if (!adminToken) {
      throw new Error('Please login as admin first');
    }
    const email = `admincreated${Date.now()}@example.com`;
    const response = await apiClient.post('/admin/users', {
      name: 'Admin Created User',
      email,
      password: 'password123',
      is_admin: false,
    }, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (response.user) {
      setCreatedUserId(response.user.id);
    }
    return response;
  };

  const testAdminSetAdminRole = async () => {
    if (!adminToken) {
      throw new Error('Please login as admin first');
    }
    if (!createdUserId) {
      throw new Error('Please create a user first');
    }
    const response = await apiClient.put(`/admin/users/${createdUserId}/admin`, {
      is_admin: true,
    }, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    return response;
  };

  const testAdminDeleteSelf = async () => {
    if (!adminToken) {
      throw new Error('Please login as admin first');
    }
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      throw new Error('User ID not found');
    }
    await apiClient.delete(`/admin/users/${user.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
  };

  const testAdminGetDashboardStats = async () => {
    if (!adminToken) {
      throw new Error('Please login as admin first');
    }
    const response = await apiClient.get('/admin/dashboard-stats', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    return response;
  };

  const testTaskNotFound = async () => {
    if (!userToken) {
      throw new Error('Please login first');
    }
    await apiClient.get('/tasks/99999', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
  };

  const testUserNotFound = async () => {
    if (!adminToken) {
      throw new Error('Please login as admin first');
    }
    await apiClient.get('/admin/users/99999', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="api-test-panel">
      <div className="test-panel-header">
        <h1>🔧 API Test Panel</h1>
        <p>Test all API endpoints through the UI</p>
        <div className="test-panel-actions">
          <button onClick={clearResults} className="btn-clear">
            Clear Results
          </button>
        </div>
      </div>

      <div className="test-panel-content">
        <div className="test-sections">
          {/* Public Routes */}
          <section className="test-section">
            <h2>🌐 Public Routes</h2>
            <div className="test-buttons">
              <button onClick={() => runTest('Register (unique email)', testRegister)} disabled={loading}>
                Test Register (unique email)
              </button>
              <button onClick={() => runTest('Register (duplicate email)', testRegisterDuplicate, 422)} disabled={loading}>
                Test Register duplicate email (expect 422)
              </button>
              <button onClick={() => runTest('Login (valid)', testLoginValid)} disabled={loading}>
                Test Login valid
              </button>
              <button onClick={() => runTest('Login (invalid password)', testLoginInvalid, 401)} disabled={loading}>
                Test Login invalid password (expect 401)
              </button>
            </div>
          </section>

          {/* Protected Routes */}
          <section className="test-section">
            <h2>🔒 Protected Routes</h2>
            <div className="test-buttons">
              <button onClick={() => runTest('Logout without token', testLogoutWithoutToken, 401)} disabled={loading}>
                Test Logout without token (expect 401)
              </button>
              <button onClick={() => runTest('Logout with token', testLogoutWithToken)} disabled={loading}>
                Test Logout with token (expect 200)
              </button>
              <button onClick={() => runTest('Tasks list without token', testTasksListWithoutToken, 401)} disabled={loading}>
                Test Tasks list without token (expect 401)
              </button>
              <button onClick={() => runTest('Tasks list with token', testTasksListWithToken)} disabled={loading}>
                Test Tasks list with token
              </button>
              <button onClick={() => runTest('Create Task', testCreateTask)} disabled={loading}>
                Test Create Task
              </button>
              <button onClick={() => runTest('Update Task', testUpdateTask)} disabled={loading}>
                Test Update Task
              </button>
              <button onClick={() => runTest('Delete Task', testDeleteTask)} disabled={loading}>
                Test Delete Task
              </button>
              <button onClick={() => runTest('Task Not Found', testTaskNotFound, 404)} disabled={loading}>
                Test Task Not Found (expect 404)
              </button>
            </div>
          </section>

          {/* Admin Routes */}
          <section className="test-section">
            <h2>👑 Admin Routes</h2>
            <div className="test-buttons">
              <button onClick={() => runTest('Admin endpoints with normal token', testAdminEndpointsWithNormalToken, 403)} disabled={loading}>
                Test Admin endpoints with normal token (expect 403)
              </button>
              <button onClick={() => runTest('Admin endpoints with admin token', testAdminEndpointsWithAdminToken)} disabled={loading}>
                Test Admin endpoints with admin token (expect 200)
              </button>
              <button onClick={() => runTest('Admin Create User', testAdminCreateUser)} disabled={loading}>
                Test Admin Create User
              </button>
              <button onClick={() => runTest('Admin Set Admin Role', testAdminSetAdminRole)} disabled={loading}>
                Test Admin Set Admin Role
              </button>
              <button onClick={() => runTest('Admin Delete Self', testAdminDeleteSelf, 403)} disabled={loading}>
                Test Admin Delete Self (expect 403)
              </button>
              <button onClick={() => runTest('Admin Get Dashboard Stats', testAdminGetDashboardStats)} disabled={loading}>
                Test Admin Get Dashboard Stats
              </button>
              <button onClick={() => runTest('User Not Found', testUserNotFound, 404)} disabled={loading}>
                Test User Not Found (expect 404)
              </button>
            </div>
          </section>
        </div>

        <div className="test-results">
          <h2>📊 Test Results</h2>
          {loading && <div className="loading-indicator">Running test...</div>}
          {results.length === 0 && !loading && (
            <div className="no-results">No tests run yet. Click a test button above to start.</div>
          )}
          <div className="results-list">
            {results.map((result) => (
              <div key={result.id} className={`result-item ${result.passed ? 'passed' : 'failed'}`}>
                <div className="result-header">
                  <span className="result-name">{result.testName}</span>
                  <span className={`result-status ${result.passed ? 'status-pass' : 'status-fail'}`}>
                    {result.passed ? '✓ PASS' : '✗ FAIL'}
                  </span>
                  <span className="result-code">Status: {result.statusCode}</span>
                  <span className="result-time">{result.timestamp}</span>
                </div>
                {result.expectedStatus && (
                  <div className="result-expected">
                    Expected: {result.expectedStatus} | Got: {result.statusCode}
                  </div>
                )}
                {result.error && (
                  <div className="result-error">
                    <strong>Error:</strong> {result.error}
                  </div>
                )}
                {result.errorData && (
                  <details className="result-details">
                    <summary>Error Details</summary>
                    <pre>{JSON.stringify(result.errorData, null, 2)}</pre>
                  </details>
                )}
                {result.response && (
                  <details className="result-details">
                    <summary>Response Data</summary>
                    <pre>{JSON.stringify(result.response, null, 2)}</pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApiTestPanel;
