import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Routes Protection
import ProtectedRoute from './components/routes/ProtectedRoute';
import AuthRoute from './components/routes/AuthRoute'
// Admin Components
import AdminDashboard from './page/Admin/AdminDashboard';
import AdminUsers from './page/Admin/AdminUsers';
import AdminDepartments from './page/Admin/AdminDepartments';
import AdminCourses from './page/Admin/AdminCourses';
import AdminProfile from './page/Admin/AdminProfile';
import AdminSchedule from './page/Admin/AdminSchedule';

// Teacher Components
import TeacherDashboard from './page/teacher/TeacherDashboard';
import TeacherProfile from './page/teacher/TeacherProfile';
import AssignmentsPage from './page/teacher/AssignmentsPage';
import ClassesPage from './page/teacher/ClassesPage';
import StudentsPage from './page/teacher/StudentsPage';
import AddGrade from './page/teacher/AddGrade'


// Student Components
import StudentDashboard from './page/student/StudentDashboard';
import StudentProfile from './page/student/Profile';
import StudentAssignmentsPage from './page/student/StudentAssignmentsPage';
import StudentClassesPage from './page/student/StudentClassesPage'
import Grade from './page/student/Grade'

// Auth Components
import AdminLogin from './page/Authentication/AdminLogin';
import TeacherLogin from './page/Authentication/TeacherLogin';
import StudentLogin from './page/Authentication/StudentLogin';
import ForgotPassword from './page/Authentication/ForgotPassword';
import ResetPassword from './page/Authentication/ResetPassword';

const App = () => {
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#3b82f6',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/" element={<Navigate to="/auth/student-login" replace />} />
        <Route path="/auth/admin-login" element={<AuthRoute element={<AdminLogin />} />} />
        <Route path="/auth/teacher-login" element={<AuthRoute element={<TeacherLogin />} />} />
        <Route path="/auth/student-login" element={<AuthRoute element={<StudentLogin />} />} />
        <Route path="/auth/forgot-password" element={<AuthRoute element={<ForgotPassword />} />} />
        <Route path="/auth/reset-password/:token" element={<AuthRoute element={<ResetPassword />} />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/departments" element={<AdminDepartments />} />
          <Route path="/admin/courses" element={<AdminCourses />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/admin/schedule" element={<AdminSchedule />} />
        </Route>

        {/* Protected Teacher Routes */}
        <Route element={<ProtectedRoute allowedRoles={['Teacher']} />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/profile" element={<TeacherProfile />} />
          <Route path="/teacher/assignments" element={<AssignmentsPage />} />
          <Route path="/teacher/my-classes" element={<ClassesPage />} />
          <Route path="/teacher/my-classes/:id/students" element={<StudentsPage />} />
          <Route path="/teacher/students" element={<StudentsPage />} />
          <Route path="/teacher/grades" element={<AddGrade />} />
        </Route>

        {/* Protected Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={['Student']} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/assignments" element={<StudentAssignmentsPage />} />
          <Route path="/student/classPage" element={<StudentClassesPage />} />
          <Route path="/student/grades" element={<Grade />} />
        </Route>

        {/* Catch All - Redirect */}
        <Route path="*" element={<Navigate to="/auth/student-login" replace />} />
      </Routes>
    </>
  );
};

export default App;