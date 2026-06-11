import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import App from './App.jsx';
import './index.css';
import axios from 'axios';

axios.defaults.baseURL = 'https://stoktakip-core-api2026007181930-fcgheugwghhvcdck.spaincentral-01.azurewebsites.net';

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && !error.config.url.includes('/login')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

let timeoutId;
const resetTimer = () => {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }, 900000);
};

window.addEventListener('mousemove', resetTimer);
window.addEventListener('keydown', resetTimer);
window.addEventListener('click', resetTimer);
window.addEventListener('scroll', resetTimer);

resetTimer();

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
    <Analytics />
  </BrowserRouter>
);