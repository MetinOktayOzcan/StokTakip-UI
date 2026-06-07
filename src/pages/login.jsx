import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../components/Login.css';

const Login = () => {
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [sifre, setSifre] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('https://localhost:7140/api/auth/login', {
        kullaniciAdi: kullaniciAdi,
        sifre: sifre
      });

      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('Giriş başarısız oldu. Bilgileri kontrol edin.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Giriş Yap</h2>
          <p>Stok Takip paneline hoş geldiniz.</p>
        </div>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Kullanıcı Adı</label>
            <input
              type="text"
              className="form-input"
              placeholder="Kullanıcı adınızı girin"
              value={kullaniciAdi}
              onChange={(e) => setKullaniciAdi(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Şifre</label>
            <input
              type="password"
              className="form-input"
              placeholder="Şifrenizi girin"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="submit-btn">
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;