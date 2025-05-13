import { Navigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { useSelector } from 'react-redux';


const AuthRoute = ({ element }) => {
    const { accessToken } = useSelector(state => state.auth)

  if (accessToken) {
    try {
      const decoded = jwtDecode(accessToken);
      const role = decoded?.role;

      if (role === 'Admin') {
        return <Navigate to="/admin/dashboard" replace />;
      }
      if (role === 'Teacher') {
        return <Navigate to="/teacher/dashboard" replace />;
      }
      if (role === 'Student') {
        return <Navigate to="/student/dashboard" replace />;
      }
    } catch (error) {
      console.error('Token decoding failed:', error);
      localStorage.clear();
    }
  }

  // If no token or decoding failed, show login/signup page
  return element;
};

export default AuthRoute;
