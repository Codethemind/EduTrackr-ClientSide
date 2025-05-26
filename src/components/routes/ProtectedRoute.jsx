import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { refreshToken } from '../../api/interceptor';
import { refreshTokenSuccess, logout } from '../../redux/slices/authSlice';

const ProtectedRoute = ({ allowedRoles }) => {
  const { accessToken } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      let token = accessToken;
      
      // If no token in Redux, check localStorage
      if (!token) {
        token = localStorage.getItem('accessToken');
      }

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        // Check if token is expired
        if (decoded.exp < currentTime) {
          console.log('Token expired, attempting refresh...');
          const newToken = await refreshToken();
          
          if (newToken) {
            dispatch(refreshTokenSuccess(newToken));
            setIsAuthenticated(true);
          } else {
            dispatch(logout());
            setIsAuthenticated(false);
          }
        } else {
          // Token is valid
          if (!accessToken) {
            // Update Redux with token from localStorage
            dispatch(refreshTokenSuccess(token));
          }
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Token validation failed:', error);
        dispatch(logout());
        setIsAuthenticated(false);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [accessToken, dispatch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/student-login" replace />;
  }

  try {
    const currentToken = accessToken || localStorage.getItem('accessToken');
    const decoded = jwtDecode(currentToken);
    const userRole = decoded?.role;

    if (allowedRoles.includes(userRole)) {
      return <Outlet />;
    } else {
      // Redirect to appropriate dashboard based on role
      switch (userRole) {
        case 'Admin':
          return <Navigate to="/admin/dashboard" replace />;
        case 'Teacher':
          return <Navigate to="/teacher/dashboard" replace />;
        case 'Student':
          return <Navigate to="/student/dashboard" replace />;
        default:
          return <Navigate to="/auth/student-login" replace />;
      }
    }
  } catch (error) {
    console.error('Token decoding failed:', error);
    dispatch(logout());
    return <Navigate to="/auth/student-login" replace />;
  }
};

export default ProtectedRoute;