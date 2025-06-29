import { Navigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { refreshTokenSuccess } from '../../redux/slices/authSlice';

interface DecodedToken {
  exp: number;
  role: 'Admin' | 'Teacher' | 'Student';
}

interface RootState {
  auth: {
    accessToken: string | null;
  };
}

interface AuthRouteProps {
  element: JSX.Element;
}

const AuthRoute: React.FC<AuthRouteProps> = ({ element }) => {
  const { accessToken } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!accessToken) {
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        try {
          const decoded = jwtDecode<DecodedToken>(storedToken);
          const currentTime = Date.now() / 1000;

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
      const decoded = jwtDecode<DecodedToken>(currentToken);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        localStorage.removeItem('accessToken');
        return element;
      }

      switch (decoded.role) {
        case 'Admin':
          return <Navigate to="/admin/dashboard" replace />;
        case 'Teacher':
          return <Navigate to="/teacher/dashboard" replace />;
        case 'Student':
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
