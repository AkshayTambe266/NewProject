import React, { useState, useEffect } from 'react';
import { Calendar, Clock, TrendingUp, User, CheckCircle, XCircle, BarChart3, Camera } from 'lucide-react';
import axios from 'axios';

function StudentDashboard({ user }) {
  const [stats, setStats] = useState({
    total_attendance_days: 0,
    present_today: 0,
    student_name: '',
    department: ''
  });
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryResponse, attendanceResponse] = await Promise.all([
        axios.get('/api/attendance/summary'),
        axios.get('/api/attendance')
      ]);
      
      setStats(summaryResponse.data);
      setAttendanceHistory(attendanceResponse.data.records);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "primary" }) => (
    <div className="card hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
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
    </div>
  );

  // Calculate weekly attendance pattern
  const getWeeklyPattern = () => {
    const today = new Date();
    const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 1);
    const pattern = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const hasAttendance = attendanceHistory.some(record => record.date === dateStr);
      
      pattern.push({
        day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        date: date.getDate(),
        hasAttendance,
        isToday: date.toDateString() === today.toDateString()
      });
    }
    
    return pattern;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <span className="text-gray-600">Loading student dashboard...</span>
        </div>
      </div>
    );
  }

  const weeklyPattern = getWeeklyPattern();
  const attendanceRate = stats.total_attendance_days > 0 ? 
    Math.round((stats.total_attendance_days / 30) * 100) : 0; // Assuming 30 days in a month

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-green-700 to-emerald-800 rounded-2xl shadow-2xl">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative px-8 py-12">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-4 backdrop-blur-sm">
                <User className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Student Dashboard
            </h1>
            <p className="text-xl md:text-2xl text-green-100 mb-2 max-w-2xl mx-auto">
              Welcome, {stats.student_name || user.full_name}
            </p>
            <p className="text-lg text-green-200 mb-8">
              {stats.department} Department
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/attendance"
                className="inline-flex items-center px-6 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <Camera className="h-5 w-5 mr-2" />
                Mark Attendance
              </a>
              <button className="inline-flex items-center px-6 py-3 bg-green-500 bg-opacity-20 text-white font-semibold rounded-lg hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm border border-white border-opacity-20">
                <BarChart3 className="h-5 w-5 mr-2" />
                View History
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={Calendar}
          title="Total Days Present"
          value={stats.total_attendance_days}
          subtitle="This semester"
          color="blue"
        />
        <StatCard
          icon={CheckCircle}
          title="Today's Status"
          value={stats.present_today ? 'Present' : 'Absent'}
          subtitle={stats.present_today ? 'Marked' : 'Not marked yet'}
          color={stats.present_today ? 'green' : 'red'}
        />
        <StatCard
          icon={TrendingUp}
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          subtitle="Overall performance"
          color="purple"
        />
      </div>

      {/* Weekly Attendance Pattern and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Pattern */}
        <div className="lg:col-span-2 card">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            This Week's Attendance
          </h3>
          
          <div className="grid grid-cols-7 gap-2">
            {weeklyPattern.map((day) => (
              <div 
                key={day.day} 
                className={`text-center p-4 rounded-lg transition-all duration-200 ${
                  day.isToday 
                    ? 'bg-primary-100 border-2 border-primary-300 transform scale-105' 
                    : day.hasAttendance 
                      ? 'bg-green-100 border border-green-300' 
                      : 'bg-gray-100 border border-gray-200'
                }`}
              >
                <p className={`text-sm font-medium ${
                  day.isToday ? 'text-primary-800' : 
                  day.hasAttendance ? 'text-green-800' : 'text-gray-600'
                }`}>
                  {day.day}
                </p>
                <p className="text-lg font-bold mt-1 text-gray-900">{day.date}</p>
                <div className="mt-2 flex justify-center">
                  {day.hasAttendance ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : day.isToday ? (
                    <Clock className="h-5 w-5 text-primary-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <p className="text-xs mt-1 text-gray-500">
                  {day.hasAttendance ? 'Present' : day.isToday ? 'Today' : 'Absent'}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Week Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {weeklyPattern.filter(d => d.hasAttendance).length}
                </p>
                <p className="text-sm text-gray-600">Days Present</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {weeklyPattern.filter(d => !d.hasAttendance && !d.isToday).length}
                </p>
                <p className="text-sm text-gray-600">Days Absent</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round((weeklyPattern.filter(d => d.hasAttendance).length / 7) * 100)}%
                </p>
                <p className="text-sm text-gray-600">Week Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Student Info
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Personal Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{stats.student_name || user.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium">{stats.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Student ID:</span>
                  <span className="font-medium">{user.student_id || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Attendance Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Today:</span>
                  <span className={`font-medium ${stats.present_today ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.present_today ? 'Present' : 'Not Marked'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">This Week:</span>
                  <span className="font-medium">
                    {weeklyPattern.filter(d => d.hasAttendance).length}/7 days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Overall Rate:</span>
                  <span className="font-medium text-blue-600">{attendanceRate}%</span>
                </div>
              </div>
            </div>

            {!stats.present_today && (
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-100 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Action Needed</h4>
                <p className="text-sm text-gray-600 mb-3">
                  You haven't marked your attendance today. Please visit the attendance section.
                </p>
                <a
                  href="/attendance"
                  className="inline-flex items-center px-3 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors duration-200"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Mark Now
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Attendance History */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Recent Attendance History
        </h3>
        
        {attendanceHistory.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No Attendance Records</h4>
            <p className="text-gray-500 mb-6">Start marking your attendance to see history</p>
            <a
              href="/attendance"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <Camera className="h-4 w-4 mr-2" />
              Mark Attendance
            </a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marked By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceHistory.slice(0, 10).map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.time_in}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.subject || 'General'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.marked_by || 'System'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;