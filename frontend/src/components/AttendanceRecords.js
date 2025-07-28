import React, { useState, useEffect } from 'react';
import { Calendar, Download, Filter, Search, Users, TrendingUp, Clock } from 'lucide-react';
import axios from 'axios';

function AttendanceRecords() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [stats, setStats] = useState({
    total_present: 0,
    date: ''
  });

  const departments = [
    'Computer Science',
    'Information Technology',
    'Electronics',
    'Mechanical',
    'Civil',
    'Electrical',
    'Chemical',
    'Biotechnology'
  ];

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/attendance?date=${selectedDate}`);
      setAttendance(response.data.records);
      setStats({
        total_present: response.data.total_present,
        date: response.data.date
      });
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendance = attendance.filter(record => {
    const matchesSearch = record.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.student_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || record.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const exportToCSV = () => {
    const headers = ['Student ID', 'Name', 'Department', 'Date', 'Time', 'Status'];
    const csvData = [
      headers,
      ...filteredAttendance.map(record => [
        record.student_id,
        record.student_name,
        record.department,
        record.date,
        record.time_in,
        record.status
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Attendance Records</h1>
        <p className="text-gray-600 mt-2">View and manage attendance data</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg mr-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Present Today</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total_present}</p>
              <p className="text-sm text-gray-500">Students</p>
            </div>
          </div>
        </div>
        
        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 shadow-lg mr-4">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Selected Date</p>
              <p className="text-xl font-bold text-gray-900">
                {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'short',
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-sm text-gray-500">Records found</p>
            </div>
          </div>
        </div>
        
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg mr-4">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Filtered Results</p>
              <p className="text-3xl font-bold text-gray-900">{filteredAttendance.length}</p>
              <p className="text-sm text-gray-500">Records</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input-field w-auto"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field w-64"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="input-field w-auto"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            onClick={exportToCSV}
            className="btn-primary flex items-center"
            disabled={filteredAttendance.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <span className="text-gray-600">Loading attendance records...</span>
            </div>
          </div>
        ) : filteredAttendance.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Records Found</h3>
            <p className="text-gray-500 mb-6">
              {attendance.length === 0 
                ? "No attendance records for the selected date." 
                : "No records match your current filters."}
            </p>
            {attendance.length === 0 && (
              <a
                href="/attendance"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Mark Attendance
              </a>
            )}
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
                      Date
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
                  {filteredAttendance.map((record) => (
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.department}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(record.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.time_in}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Analytics Section */}
      {filteredAttendance.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Department-wise Attendance</h3>
            <div className="space-y-3">
              {departments.map((dept) => {
                const deptCount = filteredAttendance.filter(record => record.department === dept).length;
                const percentage = filteredAttendance.length > 0 ? (deptCount / filteredAttendance.length * 100).toFixed(1) : 0;
                
                if (deptCount === 0) return null;
                
                return (
                  <div key={dept} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{dept}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12">{deptCount}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Total Present</span>
                <span className="text-lg font-bold text-blue-600">{filteredAttendance.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Departments Represented</span>
                <span className="text-lg font-bold text-green-600">
                  {new Set(filteredAttendance.map(r => r.department)).size}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">First Attendance</span>
                <span className="text-lg font-bold text-purple-600">
                  {filteredAttendance.length > 0 ? 
                    Math.min(...filteredAttendance.map(r => r.time_in)).substring(0, 5) : 
                    '--:--'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendanceRecords;