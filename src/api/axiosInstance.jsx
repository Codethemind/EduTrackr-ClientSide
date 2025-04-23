import axios from 'axios';
import  store  from '../redux/store';
import { refreshTokenSuccess, logout } from '../redux/slices/authSlice';

// Environment safe
const API_BASE_URL =  'http://localhost:3000';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // 5 seconds timeout
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken; // Get token from Redux
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timed out. Please try again.'));
    }

    // Handle 401 Unauthorized errors and refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Attempt to refresh the token
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          { refreshToken }
        );

        const accessToken = response.data?.data?.accessToken;

        // Dispatch refreshTokenSuccess to update Redux + localStorage
        store.dispatch(refreshTokenSuccess(accessToken));

        // Update original request header with new access token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Retry the original request
        return axios(originalRequest);
      } catch (refreshError) {
        // If token refresh fails, logout user
        store.dispatch(logout());
        localStorage.clear(); // Optional: Clear everything
        window.location.href = '/auth/login'; // Redirect to login
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosInstance;
