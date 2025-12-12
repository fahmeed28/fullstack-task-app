/**
 * Centralized API Client with Error Handling
 * Handles all HTTP errors consistently:
 * - 401: Redirects to login
 * - 403: Shows access denied message
 * - 404: Shows not found message
 * - 422: Shows validation errors
 * - 500: Shows server error
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Helper to get token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Helper to get auth headers
const getAuthHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Centralized error handler
const handleError = async (response, customMessage = null) => {
  let errorData = null;
  
  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      errorData = await response.json();
    } else {
      errorData = { message: response.statusText };
    }
  } catch (e) {
    errorData = { message: response.statusText || 'Unknown error' };
  }

  const error = new Error(customMessage || errorData.message || 'Request failed');
  error.status = response.status;
  error.data = errorData;
  error.errors = errorData.errors || null;
  
  // Handle specific status codes
  switch (response.status) {
    case 401:
      // Unauthenticated - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
      error.message = 'Session expired. Please login again.';
      break;
      
    case 403:
      // Forbidden
      error.message = errorData.message || 'Access denied. You do not have permission to perform this action.';
      break;
      
    case 404:
      // Not found
      error.message = errorData.message || 'Resource not found.';
      break;
      
    case 422:
      // Validation error
      if (errorData.errors) {
        const errorMessages = Object.entries(errorData.errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('; ');
        error.message = errorMessages || 'Validation failed.';
      } else {
        error.message = errorData.message || 'Validation failed.';
      }
      break;
      
    case 500:
    default:
      // Server error
      if (!error.message || error.message === 'Request failed') {
        error.message = 'Server error. Please try again later.';
      }
      break;
  }
  
  return error;
};

// Centralized fetch wrapper
const apiRequest = async (endpoint, options = {}) => {
  const {
    method = 'GET',
    body = null,
    headers = {},
    includeAuth = true,
    customErrorHandler = null,
  } = options;

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const config = {
    method,
    headers: {
      ...getAuthHeaders(includeAuth),
      ...headers,
    },
  };

  if (body && method !== 'GET' && method !== 'HEAD') {
    config.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    if (!response.ok) {
      const error = customErrorHandler 
        ? await customErrorHandler(response)
        : await handleError(response);
      throw error;
    }
    
    // Return parsed JSON or empty object
    if (isJson) {
      const data = await response.json();
      return data;
    }
    
    // For empty responses (like 204 No Content)
    if (response.status === 204) {
      return null;
    }
    
    // Fallback for non-JSON responses
    const text = await response.text();
    return text ? JSON.parse(text) : {};
    
  } catch (error) {
    // Network errors
    if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
      const networkError = new Error(
        `Network error: Could not connect to server at ${API_BASE_URL}. ` +
        `Please check:\n1. Backend is running (php artisan serve)\n2. Backend URL is correct\n3. No firewall blocking the connection`
      );
      networkError.status = 0;
      networkError.isNetworkError = true;
      throw networkError;
    }
    
    // Re-throw handled errors
    throw error;
  }
};

// Export API client with all methods
export const apiClient = {
  // GET request
  get: (endpoint, options = {}) => 
    apiRequest(endpoint, { ...options, method: 'GET' }),
  
  // POST request
  post: (endpoint, body, options = {}) => 
    apiRequest(endpoint, { ...options, method: 'POST', body }),
  
  // PUT request
  put: (endpoint, body, options = {}) => 
    apiRequest(endpoint, { ...options, method: 'PUT', body }),
  
  // PATCH request
  patch: (endpoint, body, options = {}) => 
    apiRequest(endpoint, { ...options, method: 'PATCH', body }),
  
  // DELETE request
  delete: (endpoint, options = {}) => 
    apiRequest(endpoint, { ...options, method: 'DELETE' }),
  
  // Raw request (for custom handling)
  request: apiRequest,
  
  // Get base URL
  getBaseUrl: () => API_BASE_URL,
};

export default apiClient;
