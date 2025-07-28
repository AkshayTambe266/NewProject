import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Users, Camera, BarChart3, UserPlus, Home, LogOut, User, Settings } from 'lucide-react';
import axios from 'axios';

// Import all components
import Dashboard from './components/Dashboard';
import StudentRegistration from './components/StudentRegistration';
import AttendanceCapture from './components/AttendanceCapture';
import AttendanceRecords from './components/AttendanceRecords';
import StudentList from './components/StudentList';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import './index.css';

// Protected Route Component
function ProtectedRoute({ children, requiredRole, currentUser }) {
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && !requiredRole.includes(currentUser.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
}

function Navigation({ currentUser, onLogout }) {
  const location = useLocation();
  
  // Don't show navigation on login page
  if (location.pathname === '/login') {
    return null;
  }

  // Define navigation items based on user role
  const getNavItems = () => {
    if (!currentUser) return [];
    
    const baseItems = [
      { path: `/${currentUser.role}/dashboard`, icon: Home, label: 'Dashboard' }
    ];
    
    switch (currentUser.role) {
      case 'admin':
        return [
          ...baseItems,
          { path: '/register', icon: UserPlus, label: 'Register Student' },
          { path: '/attendance', icon: Camera, label: 'Mark Attendance' },
          { path: '/records', icon: BarChart3, label: 'View Records' },
          { path: '/students', icon: Users, label: 'Manage Students' }
        ];
      case 'teacher':
        return [
          ...baseItems,
          { path: '/attendance', icon: Camera, label: 'Mark Attendance' },
          { path: '/records', icon: BarChart3, label: 'View Records' },
          { path: '/students', icon: Users, label: 'View Students' }
        ];
      case 'student':
        return [
          ...baseItems,
          { path: '/attendance', icon: Camera, label: 'Mark Attendance' },
          { path: '/records', icon: BarChart3, label: 'My Records' }
        ];
      default:
        return baseItems;
    }
  };

  const navItems = getNavItems();

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'from-red-500 to-red-600';
      case 'teacher': return 'from-blue-500 to-blue-600';
      case 'student': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${getRoleColor(currentUser?.role)} mr-3`}>
                <Camera className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-xl text-gray-900">Smart Attendance</span>
                <span className="block text-xs text-gray-500 capitalize">
                  {currentUser?.role} Portal
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getRoleColor(currentUser?.role)} flex items-center justify-center`}>
                <span className="text-white text-sm font-medium">
                  {currentUser?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{currentUser?.full_name}</p>
                <p className="text-xs text-gray-500 capitalize">{currentUser?.role}</p>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
        <Link
          to="/login"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        setCurrentUser(parsedUser);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      setCurrentUser(null);
    }
  };

  const getDashboardComponent = (role) => {
    switch (role) {
      case 'admin':
        return AdminDashboard;
      case 'teacher':
        return TeacherDashboard;
      case 'student':
        return StudentDashboard;
      default:
        return Dashboard;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation currentUser={currentUser} onLogout={handleLogout} />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                currentUser ? 
                <Navigate to={`/${currentUser.role}/dashboard`} replace /> : 
                <Login onLogin={handleLogin} />
              } 
            />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Default redirect */}
            <Route 
              path="/" 
              element={
                currentUser ? 
                <Navigate to={`/${currentUser.role}/dashboard`} replace /> : 
                <Navigate to="/login" replace />
              } 
            />

            {/* Role-specific Dashboard Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute requiredRole={['admin']} currentUser={currentUser}>
                  {React.createElement(getDashboardComponent('admin'), { user: currentUser })}
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teacher/dashboard" 
              element={
                <ProtectedRoute requiredRole={['teacher']} currentUser={currentUser}>
                  {React.createElement(getDashboardComponent('teacher'), { user: currentUser })}
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/dashboard" 
              element={
                <ProtectedRoute requiredRole={['student']} currentUser={currentUser}>
                  {React.createElement(getDashboardComponent('student'), { user: currentUser })}
                </ProtectedRoute>
              } 
            />

            {/* Shared Routes with Role-based Access */}
            <Route 
              path="/register" 
              element={
                <ProtectedRoute requiredRole={['admin']} currentUser={currentUser}>
                  <StudentRegistration />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/attendance" 
              element={
                <ProtectedRoute requiredRole={['admin', 'teacher', 'student']} currentUser={currentUser}>
                  <AttendanceCapture />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/records" 
              element={
                <ProtectedRoute requiredRole={['admin', 'teacher', 'student']} currentUser={currentUser}>
                  <AttendanceRecords />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/students" 
              element={
                <ProtectedRoute requiredRole={['admin', 'teacher']} currentUser={currentUser}>
                  <StudentList />
                </ProtectedRoute>
              } 
            />

            {/* Fallback route */}
            <Route 
              path="*" 
              element={
                currentUser ? 
                <Navigate to={`/${currentUser.role}/dashboard`} replace /> : 
                <Navigate to="/login" replace />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;