import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ allowedRoles }) => {
  const { accessToken } = useSelector(state => state.auth);
  localStorage.getItem(accessToken);
  if (!accessToken) {
    return <Navigate to="/auth/student-login" replace />;
  }
  try {
    const decoded = jwtDecode(accessToken);
    const userRole = decoded?.role;

    if (allowedRoles.includes(userRole)) {
      return <Outlet />;
    } else {

      switch (userRole) {
        case 'Teacher':
          return <Navigate to="/teacher/dashboard" replace />;
        case 'Student':
          return <Navigate to="/student/dashboard" replace />;
        default:
          return <Navigate to="/admin/dashboard" replace />;
      }
    }
  } catch (error) {
    console.error('Token decoding failed:', error);
    localStorage.clear();
    return <Navigate to="/auth/admin-login" replace />;
  }
};

export default ProtectedRoute;
