import axios from 'axios';
import { API_URL } from '@/index';

const axi = axios.create({
  baseURL: `${API_URL}`,
});

axi.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default axi;