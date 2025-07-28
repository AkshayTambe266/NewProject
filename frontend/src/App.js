import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Users, Camera, BarChart3, UserPlus, Home } from 'lucide-react';
import Dashboard from './components/Dashboard';
import StudentRegistration from './components/StudentRegistration';
import AttendanceCapture from './components/AttendanceCapture';
import AttendanceRecords from './components/AttendanceRecords';
import StudentList from './components/StudentList';
import './index.css';

function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/register', icon: UserPlus, label: 'Register Student' },
    { path: '/attendance', icon: Camera, label: 'Mark Attendance' },
    { path: '/records', icon: BarChart3, label: 'View Records' },
    { path: '/students', icon: Users, label: 'Students' }
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Camera className="h-8 w-8 text-primary-600 mr-2" />
              <span className="font-bold text-xl text-gray-900">Smart Attendance</span>
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
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/register" element={<StudentRegistration />} />
            <Route path="/attendance" element={<AttendanceCapture />} />
            <Route path="/records" element={<AttendanceRecords />} />
            <Route path="/students" element={<StudentList />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;