import axios from 'axios';
import store from '../redux/store';
import { refreshTokenSuccess, logout } from '../redux/slices/authSlice';


const API_BASE_URL = 'http://localhost:3000';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // 5 seconds timeout
});


export default axiosInstance;