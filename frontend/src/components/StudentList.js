import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Trash2, UserPlus, Mail, Calendar } from 'lucide-react';
import axios from 'axios';

function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

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
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    try {
      await axios.delete(`/api/student/${studentId}`);
      setStudents(students.filter(student => student.student_id !== studentId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Failed to delete student');
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || student.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const departmentCounts = departments.map(dept => ({
    name: dept,
    count: students.filter(student => student.department === dept).length
  })).filter(dept => dept.count > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
        <p className="text-gray-600 mt-2">Manage registered students and their information</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg mr-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-3xl font-bold text-gray-900">{students.length}</p>
              <p className="text-sm text-gray-500">Registered</p>
            </div>
          </div>
        </div>
        
        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 shadow-lg mr-4">
              <Filter className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Departments</p>
              <p className="text-3xl font-bold text-gray-900">{departmentCounts.length}</p>
              <p className="text-sm text-gray-500">Active</p>
            </div>
          </div>
        </div>
        
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg mr-4">
              <Search className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Filtered Results</p>
              <p className="text-3xl font-bold text-gray-900">{filteredStudents.length}</p>
              <p className="text-sm text-gray-500">Students</p>
            </div>
          </div>
        </div>
        
        <div className="card bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg mr-4">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Recently Added</p>
              <p className="text-3xl font-bold text-gray-900">
                {students.filter(s => {
                  const createdDate = new Date(s.created_at);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return createdDate > weekAgo;
                }).length}
              </p>
              <p className="text-sm text-gray-500">This week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
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
          
          <a
            href="/register"
            className="btn-primary flex items-center"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add New Student
          </a>
        </div>
      </div>

      {/* Students Grid */}
      <div className="card">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <span className="text-gray-600">Loading students...</span>
            </div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {students.length === 0 ? 'No Students Registered' : 'No Students Found'}
            </h3>
            <p className="text-gray-500 mb-6">
              {students.length === 0 
                ? "Start by registering your first student."
                : "No students match your current filters."
              }
            </p>
            {students.length === 0 && (
              <a
                href="/register"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Register First Student
              </a>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <div key={student.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary-500 to-blue-600 flex items-center justify-center mr-3">
                      <span className="text-lg font-medium text-white">
                        {student.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-500">{student.student_id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDeleteConfirm(student.student_id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    title="Delete student"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {student.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    {student.department}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Registered {new Date(student.created_at).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Face Enrollment</span>
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                      Completed
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Department Statistics */}
      {departmentCounts.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Department Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departmentCounts.map((dept) => {
              const percentage = ((dept.count / students.length) * 100).toFixed(1);
              return (
                <div key={dept.name} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{dept.name}</span>
                    <span className="text-sm text-gray-600">{dept.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{percentage}% of total</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this student? This action will also remove all their attendance records and cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDeleteStudent(deleteConfirm)}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentList;