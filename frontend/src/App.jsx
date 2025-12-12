import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import ToastContainer from './components/ToastContainer';
import Login from './pages/Login';
import Register from './pages/Register';
import Tasks from './pages/Tasks';
import AdminDashboard from './pages/AdminDashboard';
import ApiTestPanel from './pages/ApiTestPanel';
import './App.css';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const { toasts, removeToast } = useToast();

  return (
    <>
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/tasks" replace /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/tasks" replace /> : <Register />} 
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        {import.meta.env.DEV && (
          <Route path="/api-test" element={<ApiTestPanel />} />
        )}
        <Route path="/" element={<Navigate to="/tasks" replace />} />
      </Routes>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
