import React from 'react';
import axios from 'axios'
import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Admin Components
import AdminDashboard from './page/Admin/AdminDashboard';
import AdminUsers from './page/Admin/AdminUsers';
import AdminDepartments from './page/Admin/AdminDepartments';

// Auth Components
import AdminLogin from './page/Authentication/AdminLogin';
import TeacherLogin from './page/Authentication/TeacherLogin';
import StudentLogin from './page/Authentication/StudentLogin';
import ForgotPassword from './page/Authentication/ForgotPassword';
import ResetPassword from './page/Authentication/ResetPassword';

// Teacher Components
import TeacherDashboard from './page/Teacher/TeacherDashboard';

// Student Components
import StudentHome from './page/Student/StudentDashboard';

// // Other Components
// import TempPage from './page/tempPage';

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<AdminLogin />} />
        <Route path="/auth/login" element={<Navigate to="/auth/admin-login" replace />} />
        <Route path="/auth/admin-login" element={<AdminLogin />} />
        <Route path="/auth/teacher-login" element={<TeacherLogin />} />
        <Route path="/auth/student-login" element={<StudentLogin />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password/:token" element={<ResetPassword />} />




        <Route path="/student/dashboard" element={<StudentHome/>} />


        <Route path="/admin/dashboard" element={<AdminDashboard/>} />
        <Route path="/admin/users" element={<AdminUsers/>} />






        <Route path="/teacher/dashboard" element={<TeacherDashboard/>} />

        {/* Protected Admin Routes
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        /> */}
        {/* <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="/admin/departments"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDepartments />
            </ProtectedRoute>
          }
        />

        {/* Protected Student Routes
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentHome />
            </ProtectedRoute>
          }
        /> */}

        {/* Protected Teacher Routes
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        /> */}

        {/* Catch all - redirect to admin login */}
        <Route path="*" element={<Navigate to="/auth/admin-login" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App; 