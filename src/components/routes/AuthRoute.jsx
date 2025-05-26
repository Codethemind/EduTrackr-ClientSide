import { Navigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { refreshTokenSuccess } from '../../redux/slices/authSlice';

const AuthRoute = ({ element }) => {
  const { accessToken } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if token exists in localStorage but not in Redux
    if (!accessToken) {
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        try {
          const decoded = jwtDecode(storedToken);
          const currentTime = Date.now() / 1000;
          
          // Only update Redux if token is not expired
          if (decoded.exp > currentTime) {
            dispatch(refreshTokenSuccess(storedToken));
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('accessToken');
        }
      }
    }
  }, [accessToken, dispatch]);

  const currentToken = accessToken || localStorage.getItem('accessToken');

  if (currentToken) {
    try {
      const decoded = jwtDecode(currentToken);
      const currentTime = Date.now() / 1000;
      
      // Check if token is expired
      if (decoded.exp < currentTime) {
        localStorage.removeItem('accessToken');
        return element;
      }

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
      localStorage.removeItem('accessToken');
    }
  }
  
  return element;
};

export default AuthRoute;