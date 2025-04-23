import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ allowedRoles }) => {
  const { accessToken } = useSelector(state => state.auth);
  console.log('sfasdf',accessToken)
  localStorage.getItem(accessToken);
console.log('local',accessToken)
  if (!accessToken) {
    return <Navigate to="/auth/student-login" replace />;
  }

  try {
    const decoded = jwtDecode(accessToken);
    const userRole = decoded?.role;

    console.log('ROLE ', userRole);
    console.log('allowed roles ', allowedRoles);



    if (allowedRoles.includes(userRole)) {
      // ✅ Correct Role → ALLOW PAGE RENDER
      return <Outlet />;
    } else {
      // ❌ Wrong role → Redirect to user's correct dashboard
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
