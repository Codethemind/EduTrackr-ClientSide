import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Routes Protection
import ProtectedRoute from './components/routes/ProtectedRoute';

// Admin Components
import AdminDashboard from './page/Admin/AdminDashboard';
import AdminUsers from './page/Admin/AdminUsers';
import AdminDepartments from './page/Admin/AdminDepartments';

// Teacher Components
import TeacherDashboard from './page/Teacher/TeacherDashboard';
import TeacherProfile from './page/Teacher/TeacherProfile'; // Fix filename casing

// Student Components
import StudentDashboard from './page/Student/StudentDashboard'; // Correct naming
import StudentProfile from './page/Student/Profile'; // More clear name

// Auth Components
import AdminLogin from './page/Authentication/AdminLogin';
import TeacherLogin from './page/Authentication/TeacherLogin';
import StudentLogin from './page/Authentication/StudentLogin';
import ForgotPassword from './page/Authentication/ForgotPassword';
import ResetPassword from './page/Authentication/ResetPassword';

const App = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/" element={<Navigate to="/auth/student-login" replace />} />
      <Route path="/auth/admin-login" element={<AdminLogin />} />
      <Route path="/auth/teacher-login" element={<TeacherLogin />} />
      <Route path="/auth/student-login" element={<StudentLogin />} />
      <Route path="/auth/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/reset-password/:token" element={<ResetPassword />} />

      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/departments" element={<AdminDepartments />} />
      </Route>

      {/* Protected Teacher Routes */}
      <Route element={<ProtectedRoute allowedRoles={['Teacher']} />}>
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/profile/:id" element={<TeacherProfile />} />
      </Route>

      {/* Protected Student Routes */}
      <Route element={<ProtectedRoute allowedRoles={['Student']} />}>
    <Route path="/student/dashboard" element={<StudentDashboard />} />
    <Route path="/student/profile" element={<StudentProfile />} />
    
  </Route>
      

      {/* Catch All - Redirect */}
      {/* <Route path="*" element={<Navigate to="/auth/admin-login" replace />} /> */}
    </Routes>
  );
};

export default App;
