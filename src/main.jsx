import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import axios from 'axios';

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
      console.error("401 Hatası Alındı! Bizi dışarı atan API URL'si:", error.config.url);
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
  }, 15 * 60 * 1000);
};

window.addEventListener('mousemove', resetTimer);
window.addEventListener('keydown', resetTimer);
window.addEventListener('click', resetTimer);
window.addEventListener('scroll', resetTimer);

resetTimer();

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);