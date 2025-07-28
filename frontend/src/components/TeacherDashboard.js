import React, { useState, useEffect } from 'react';
import { Users, Camera, BarChart3, Clock, GraduationCap, BookOpen, UserCheck, Calendar } from 'lucide-react';
import axios from 'axios';

function TeacherDashboard({ user }) {
  const [stats, setStats] = useState({
    total_students: 0,
    present_today: 0,
    absent_today: 0,
    attendance_rate: 0,
    teacher_name: '',
    department: '',
    subject: ''
  });
  const [todayAttendance, setTodayAttendance] = useState([]);
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
      setTodayAttendance(attendanceResponse.data.records);
      
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
            <BarChart3 className="h-4 w-4 mr-1" />
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
          <span className="text-gray-600">Loading teacher dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-2xl">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative px-8 py-12">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-4 backdrop-blur-sm">
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Teacher Dashboard
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-2 max-w-2xl mx-auto">
              Welcome, {stats.teacher_name || user.full_name}
            </p>
            <p className="text-lg text-blue-200 mb-8">
              {stats.subject} • {stats.department} Department
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/attendance"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <Camera className="h-5 w-5 mr-2" />
                Mark Attendance
              </a>
              <a
                href="/records"
                className="inline-flex items-center px-6 py-3 bg-blue-500 bg-opacity-20 text-white font-semibold rounded-lg hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm border border-white border-opacity-20"
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                View Reports
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Class Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Class Size"
          value={stats.total_students}
          subtitle="Students in dept"
          color="blue"
          change={2}
        />
        <StatCard
          icon={UserCheck}
          title="Present Today"
          value={stats.present_today}
          subtitle={`${stats.attendance_rate}% rate`}
          color="green"
          change={stats.attendance_rate > 80 ? 3 : -2}
        />
        <StatCard
          icon={Clock}
          title="Absent Today"
          value={stats.absent_today}
          subtitle="Students"
          color="red"
        />
        <StatCard
          icon={BookOpen}
          title="Subject"
          value={stats.subject || 'N/A'}
          subtitle="Current class"
          color="purple"
        />
      </div>

      {/* Today's Class and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Attendance */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Today's Attendance
              </h3>
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
              <span className="text-sm text-gray-600">Live</span>
            </div>
          </div>

          {todayAttendance.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="h-10 w-10 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No Attendance Yet</h4>
              <p className="text-gray-500 mb-6">Start marking attendance for your class</p>
              <a
                href="/attendance"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Camera className="h-4 w-4 mr-2" />
                Start Attendance
              </a>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {todayAttendance.slice(0, 8).map((record, index) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-white">
                        {record.student_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{record.student_name}</p>
                      <p className="text-sm text-gray-500">{record.student_id} • {record.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{record.time_in}</span>
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                      Present
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {todayAttendance.length > 8 && (
            <div className="mt-4 text-center">
              <a
                href="/records"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all {todayAttendance.length} records →
              </a>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Camera className="h-5 w-5 mr-2" />
            Quick Actions
          </h3>
          
          <div className="space-y-4">
            <a
              href="/attendance"
              className="flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-all duration-200 group"
            >
              <div className="p-2 bg-green-100 rounded-lg mr-4 group-hover:bg-green-200">
                <Camera className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Mark Attendance</h4>
                <p className="text-sm text-gray-600">Use face recognition</p>
              </div>
            </a>
            
            <a
              href="/records"
              className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-50 rounded-lg hover:from-blue-100 hover:to-blue-100 transition-all duration-200 group"
            >
              <div className="p-2 bg-blue-100 rounded-lg mr-4 group-hover:bg-blue-200">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">View Reports</h4>
                <p className="text-sm text-gray-600">Attendance analytics</p>
              </div>
            </a>
            
            <button className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-purple-50 rounded-lg hover:from-purple-100 hover:to-purple-100 transition-all duration-200 group w-full">
              <div className="p-2 bg-purple-100 rounded-lg mr-4 group-hover:bg-purple-200">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Class Management</h4>
                <p className="text-sm text-gray-600">Manage your students</p>
              </div>
            </button>

            {/* Class Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Today's Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Attendance Rate</span>
                  <span className="font-semibold text-green-600">{stats.attendance_rate}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Present</span>
                  <span className="font-semibold">{stats.present_today}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Absent</span>
                  <span className="font-semibold">{stats.absent_today}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Students</span>
                  <span className="font-semibold">{stats.total_students}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Overview */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Weekly Overview
        </h3>
        
        <div className="grid grid-cols-7 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
            const isToday = index === new Date().getDay() - 1;
            const attendance = Math.floor(Math.random() * 30) + 70; // Mock data
            
            return (
              <div key={day} className={`text-center p-4 rounded-lg ${
                isToday ? 'bg-blue-100 border-2 border-blue-300' : 'bg-gray-50'
              }`}>
                <p className={`text-sm font-medium ${isToday ? 'text-blue-800' : 'text-gray-600'}`}>
                  {day}
                </p>
                <p className={`text-2xl font-bold mt-1 ${
                  isToday ? 'text-blue-900' : 
                  attendance > 85 ? 'text-green-600' : 
                  attendance > 70 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {isToday ? stats.attendance_rate : attendance}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {isToday ? 'Today' : `${Math.floor(attendance * stats.total_students / 100)}/${stats.total_students}`}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;