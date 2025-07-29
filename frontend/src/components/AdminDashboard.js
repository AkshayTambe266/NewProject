import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Settings, BarChart3, Shield, Clock, Activity, Database } from 'lucide-react';
import axios from 'axios';

function AdminDashboard({ user }) {
  const [stats, setStats] = useState({
    total_students: 0,
    present_today: 0,
    absent_today: 0,
    attendance_rate: 0
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [systemStats, setSystemStats] = useState({
    total_users: 0,
    active_sessions: 0,
    db_size: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [attendanceResponse, usersResponse] = await Promise.all([
        axios.get('/api/attendance/summary'),
        axios.get('/api/users')
      ]);
      
      setStats(attendanceResponse.data);
      setUsers(usersResponse.data);
      
      // Calculate system stats
      setSystemStats({
        total_users: usersResponse.data.length,
        active_sessions: usersResponse.data.filter(u => u.last_login).length,
        db_size: Math.floor(Math.random() * 100) + 50 // Mock data
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "primary", change }) => (
    <div className="card hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${
            color === 'blue' ? 'from-blue-500 to-blue-600' :
            color === 'green' ? 'from-green-500 to-green-600' :
            color === 'red' ? 'from-red-500 to-red-600' :
            color === 'purple' ? 'from-purple-500 to-purple-600' :
            'from-primary-500 to-primary-600'
          } shadow-lg mr-4`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>
        {change && (
          <div className={`flex items-center text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <Activity className="h-4 w-4 mr-1" />
            {change > 0 ? '+' : ''}{change}%
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <span className="text-gray-600">Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-700 to-red-800 rounded-2xl shadow-2xl">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative px-8 py-12">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-4 backdrop-blur-sm">
                <Shield className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Admin Dashboard
            </h1>
            <p className="text-xl md:text-2xl text-red-100 mb-8 max-w-2xl mx-auto">
              Welcome back, {user.full_name}. Manage your attendance system
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center px-6 py-3 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <UserPlus className="h-5 w-5 mr-2" />
                Add New User
              </button>
              <button className="inline-flex items-center px-6 py-3 bg-red-500 bg-opacity-20 text-white font-semibold rounded-lg hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm border border-white border-opacity-20">
                <Settings className="h-5 w-5 mr-2" />
                System Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total Students"
          value={stats.total_students}
          subtitle="Registered"
          color="blue"
          change={5}
        />
        <StatCard
          icon={Activity}
          title="Present Today"
          value={stats.present_today}
          subtitle={`${stats.attendance_rate}% rate`}
          color="green"
          change={stats.attendance_rate > 80 ? 2 : -1}
        />
        <StatCard
          icon={Clock}
          title="System Users"
          value={systemStats.total_users}
          subtitle="All roles"
          color="purple"
          change={3}
        />
        <StatCard
          icon={Database}
          title="Active Sessions"
          value={systemStats.active_sessions}
          subtitle="Online users"
          color="red"
        />
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Management */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              User Management
            </h3>
            <button className="btn-primary text-sm">
              <UserPlus className="h-4 w-4 mr-1" />
              Add User
            </button>
          </div>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {users.slice(0, 5).map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    user.role === 'admin' ? 'bg-red-100 text-red-600' :
                    user.role === 'teacher' ? 'bg-blue-100 text-blue-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {user.role === 'admin' ? <Shield className="h-5 w-5" /> :
                     user.role === 'teacher' ? <Users className="h-5 w-5" /> :
                     <Users className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.full_name}</p>
                    <p className="text-sm text-gray-500">{user.role} • {user.department}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {users.length > 5 && (
            <div className="mt-4 text-center">
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View all {users.length} users →
              </button>
            </div>
          )}
        </div>

        {/* System Health */}
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            System Health
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-sm font-medium text-gray-900">Database Status</span>
              </div>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                Healthy
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-sm font-medium text-gray-900">Face Recognition</span>
              </div>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                Online
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-sm font-medium text-gray-900">Server Load</span>
              </div>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                Normal
              </span>
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Quick Stats</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Uptime</p>
                  <p className="font-semibold">99.9%</p>
                </div>
                <div>
                  <p className="text-gray-600">Response Time</p>
                  <p className="font-semibold">120ms</p>
                </div>
                <div>
                  <p className="text-gray-600">Storage Used</p>
                  <p className="font-semibold">2.4 GB</p>
                </div>
                <div>
                  <p className="text-gray-600">Daily Requests</p>
                  <p className="font-semibold">1,234</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Quick Actions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-200 group">
            <div className="p-2 bg-blue-100 rounded-lg mr-4 group-hover:bg-blue-200">
              <UserPlus className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900">Create User Account</h4>
              <p className="text-sm text-gray-600">Add new admin, teacher, or student</p>
            </div>
          </button>
          
          <button className="flex items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all duration-200 group">
            <div className="p-2 bg-green-100 rounded-lg mr-4 group-hover:bg-green-200">
              <BarChart3 className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900">Generate Reports</h4>
              <p className="text-sm text-gray-600">System and attendance analytics</p>
            </div>
          </button>
          
          <button className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all duration-200 group">
            <div className="p-2 bg-purple-100 rounded-lg mr-4 group-hover:bg-purple-200">
              <Settings className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900">System Settings</h4>
              <p className="text-sm text-gray-600">Configure system parameters</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;