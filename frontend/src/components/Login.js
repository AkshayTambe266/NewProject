import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, LogIn, AlertCircle, UserCheck, GraduationCap, Shield } from 'lucide-react';
import axios from 'axios';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    selectedRole: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    { 
      value: 'admin', 
      label: 'Administrator', 
      icon: Shield,
      color: 'from-red-500 to-red-600',
      description: 'Full system access and user management'
    },
    { 
      value: 'teacher', 
      label: 'Teacher', 
      icon: UserCheck,
      color: 'from-blue-500 to-blue-600',
      description: 'Manage attendance and view reports'
    },
    { 
      value: 'student', 
      label: 'Student', 
      icon: GraduationCap,
      color: 'from-green-500 to-green-600',
      description: 'View personal attendance records'
    }
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleRoleSelect = (role) => {
    setFormData({
      ...formData,
      selectedRole: role
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/login', {
        username: formData.username,
        password: formData.password
      });

      const { token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set axios default header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Call parent login handler
      onLogin(user);
      
      // Navigate based on role
      switch (user.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'teacher':
          navigate('/teacher/dashboard');
          break;
        case 'student':
          navigate('/student/dashboard');
          break;
        default:
          navigate('/');
      }
      
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-4 backdrop-blur-sm">
            <LogIn className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-blue-100">Sign in to Smart Attendance System</p>
        </div>

        {/* Role Selection */}
        <div className="mb-6">
          <p className="text-white text-sm font-medium mb-3">Select your role:</p>
          <div className="grid grid-cols-3 gap-2">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => handleRoleSelect(role.value)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    formData.selectedRole === role.value
                      ? 'border-white bg-white bg-opacity-20 backdrop-blur-sm'
                      : 'border-white border-opacity-30 hover:border-opacity-50'
                  }`}
                >
                  <Icon className="h-6 w-6 text-white mx-auto mb-1" />
                  <p className="text-xs text-white font-medium">{role.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white border-opacity-20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-400 text-white px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {error}
                </div>
              </div>
            )}

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white text-opacity-70" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent backdrop-blur-sm"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white text-opacity-70" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent backdrop-blur-sm"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-70 hover:text-opacity-100"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.username || !formData.password}
              className="w-full bg-white text-primary-600 font-semibold py-3 px-4 rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600 mr-2"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <LogIn className="h-5 w-5 mr-2" />
                  Sign In
                </div>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-black bg-opacity-20 rounded-lg">
            <p className="text-white text-sm font-medium mb-2">Demo Credentials:</p>
            <div className="text-xs text-white space-y-1">
              <p><strong>Admin:</strong> username: admin, password: admin123</p>
              <p className="text-blue-200">Create teacher and student accounts via admin panel</p>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-white text-sm">
              Need an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-blue-200 hover:text-white font-medium underline"
              >
                Contact Administrator
              </button>
            </p>
          </div>
        </div>

        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white opacity-10 rounded-full"></div>
          <div className="absolute top-32 right-20 w-16 h-16 border-2 border-white opacity-10 rounded-full"></div>
          <div className="absolute bottom-20 left-32 w-12 h-12 border-2 border-white opacity-10 rounded-full"></div>
          <div className="absolute bottom-32 right-10 w-24 h-24 border-2 border-white opacity-10 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

export default Login;