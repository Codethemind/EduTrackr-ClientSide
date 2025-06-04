import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 30000, // 30 seconds default timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error);
      return Promise.reject(new Error('Request timed out. Please try again.'));
    }
    
    if (error.response) {
      // Handle specific error status codes
      switch (error.response.status) {
        case 400:
          console.error('Bad request:', error.response.data);
          break;
        case 401:
          console.error('Unauthorized:', error.response.data);
          // Optionally redirect to login
          break;
        case 403:
          console.error('Forbidden:', error.response.data);
          break;
        case 404:
          console.error('Not found:', error.response.data);
          break;
        case 500:
          console.error('Server error:', error.response.data);
          break;
        default:
          console.error('API error:', error.response.data);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 