import React, { useState, useEffect } from 'react';
import { Users, Calendar, TrendingUp, Clock, Camera, UserPlus, BarChart3, Shield, Zap, Eye } from 'lucide-react';
import axios from 'axios';

function Dashboard() {
  const [stats, setStats] = useState({
    total_students: 0,
    present_today: 0,
    absent_today: 0,
    attendance_rate: 0
  });
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchTodayAttendance();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/attendance/summary');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const response = await axios.get('/api/attendance');
      setTodayAttendance(response.data.records);
    } catch (error) {
      console.error('Error fetching today attendance:', error);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "primary", trend }) => (
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
        {trend && (
          <div className={`flex items-center text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className="h-4 w-4 mr-1" />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );

  const FeatureCard = ({ icon: Icon, title, description, color }) => (
    <div className="card hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className="text-center">
        <div className={`inline-flex p-4 rounded-full bg-gradient-to-r ${color} shadow-lg mb-4`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-700 to-blue-800 rounded-2xl shadow-2xl">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative px-8 py-12">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-4 backdrop-blur-sm">
                <Camera className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Smart Attendance System
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Revolutionary face recognition technology for automated attendance tracking
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/register"
                className="inline-flex items-center px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Register Student
              </a>
              <a
                href="/attendance"
                className="inline-flex items-center px-6 py-3 bg-primary-500 bg-opacity-20 text-white font-semibold rounded-lg hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm border border-white border-opacity-20"
              >
                <Camera className="h-5 w-5 mr-2" />
                Mark Attendance
              </a>
            </div>
          </div>
        </div>
        {/* Background Pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full"></div>
          <div className="absolute top-32 right-20 w-16 h-16 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-20 left-32 w-12 h-12 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-32 right-10 w-24 h-24 border-2 border-white rounded-full"></div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total Students"
          value={stats.total_students}
          subtitle="Registered"
          color="blue"
          trend={5}
        />
        <StatCard
          icon={Calendar}
          title="Present Today"
          value={stats.present_today}
          subtitle={`${stats.attendance_rate}% attendance rate`}
          color="green"
          trend={stats.attendance_rate > 80 ? 2 : -1}
        />
        <StatCard
          icon={Clock}
          title="Absent Today"
          value={stats.absent_today}
          subtitle="Students"
          color="red"
        />
        <StatCard
          icon={TrendingUp}
          title="Attendance Rate"
          value={`${stats.attendance_rate}%`}
          subtitle="Overall"
          color="purple"
          trend={stats.attendance_rate > 75 ? 3 : -2}
        />
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard
          icon={Eye}
          title="Face Recognition"
          description="Advanced AI-powered facial recognition technology for accurate student identification"
          color="from-purple-500 to-purple-600"
        />
        <FeatureCard
          icon={Zap}
          title="Real-time Processing"
          description="Instant attendance marking with lightning-fast face detection and recognition"
          color="from-yellow-500 to-orange-600"
        />
        <FeatureCard
          icon={Shield}
          title="Secure & Reliable"
          description="Enterprise-grade security with encrypted face data and reliable attendance tracking"
          color="from-green-500 to-green-600"
        />
      </div>

      {/* Today's Attendance */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Today's Attendance</h2>
            <p className="text-gray-600">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live Updates</span>
          </div>
        </div>

        {todayAttendance.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Attendance Yet</h3>
            <p className="text-gray-500 mb-6">Be the first to mark attendance today!</p>
            <a
              href="/attendance"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              <Camera className="h-4 w-4 mr-2" />
              Mark Attendance
            </a>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {todayAttendance.slice(0, 10).map((record, index) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-500 to-blue-600 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {record.student_name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{record.student_name}</div>
                            <div className="text-sm text-gray-500">{record.student_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.time_in}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1 mt-0.5"></div>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {todayAttendance.length > 10 && (
              <div className="bg-gray-50 px-6 py-3 text-center">
                <a
                  href="/records"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View all {todayAttendance.length} attendance records →
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Quick Actions
          </h3>
          <div className="space-y-4">
            <a
              href="/register"
              className="flex items-center p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg hover:from-primary-100 hover:to-blue-100 transition-all duration-200 group"
            >
              <div className="p-2 bg-primary-100 rounded-lg mr-4 group-hover:bg-primary-200">
                <UserPlus className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Register New Student</h4>
                <p className="text-sm text-gray-600">Add students to the system with face enrollment</p>
              </div>
            </a>
            <a
              href="/attendance"
              className="flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-all duration-200 group"
            >
              <div className="p-2 bg-green-100 rounded-lg mr-4 group-hover:bg-green-200">
                <Camera className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Mark Attendance</h4>
                <p className="text-sm text-gray-600">Use face recognition for instant attendance</p>
              </div>
            </a>
            <a
              href="/records"
              className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg hover:from-purple-100 hover:to-indigo-100 transition-all duration-200 group"
            >
              <div className="p-2 bg-purple-100 rounded-lg mr-4 group-hover:bg-purple-200">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">View Reports</h4>
                <p className="text-sm text-gray-600">Analyze attendance data and generate reports</p>
              </div>
            </a>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            System Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-sm font-medium text-gray-900">Face Recognition Engine</span>
              </div>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                Online
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-sm font-medium text-gray-900">Database Connection</span>
              </div>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-sm font-medium text-gray-900">Camera Access</span>
              </div>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                Available
              </span>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center text-sm text-blue-700">
                <TrendingUp className="h-4 w-4 mr-2" />
                <span>System running optimally with 99.9% uptime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;