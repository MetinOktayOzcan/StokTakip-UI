import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import App from './App.jsx';
import './index.css';
import axios from 'axios';
import { message } from 'antd';

axios.defaults.baseURL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/login')) {
      originalRequest._retry = true;

      try {
        await axios.post('/api/auth/refresh');
        return axios(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    if (error.response && error.response.status === 403) {
      message.error("Bu işlemi gerçekleştirmek için yetkiniz bulunmamaktadır!");
    }

    return Promise.reject(error);
  }
);

let isUpdating = false;

const updateActivity = () => {
  if (!isUpdating) {
    localStorage.setItem('lastActivity', Date.now().toString());
    isUpdating = true;
    setTimeout(() => { isUpdating = false; }, 5000); 
  }
};

window.addEventListener('mousemove', updateActivity);
window.addEventListener('keydown', updateActivity);
window.addEventListener('click', updateActivity);
window.addEventListener('scroll', updateActivity);

localStorage.setItem('lastActivity', Date.now().toString());

setInterval(async () => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const lastActivity = localStorage.getItem('lastActivity');
    const now = Date.now();
    
    if (lastActivity && (now - parseInt(lastActivity, 10) > 900000)) {
      try {
        await axios.post('/api/auth/logout');
      } catch {
      } finally {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
  }
}, 30000);

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
    <Analytics />
  </BrowserRouter>
);