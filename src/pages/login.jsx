import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Button, Typography, Layout, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const Login = () => {
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [sifre, setSifre] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('/api/auth/login', {
        kullaniciAdi: kullaniciAdi,
        sifre: sifre
      });

      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (error) {
      message.error('Giriş başarısız oldu. Kullanıcı adı veya şifreyi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--ant-color-bg-layout)' }}>
      <Card 
        style={{ 
          width: 400, 
          borderRadius: 12, 
          border: '1px solid var(--ant-color-border-secondary)', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' 
        }} 
        bodyStyle={{ padding: '40px 32px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={3} style={{ margin: '0 0 8px 0', fontWeight: 600 }}>Stok Takip Sistemi</Title>
          <Text style={{ color: 'var(--ant-color-text-secondary)', fontSize: 14 }}>Sisteme giriş yapmak için bilgilerinizi girin.</Text>
        </div>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <Text style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: 13 }}>Kullanıcı Adı</Text>
            <Input
              size="large"
              prefix={<UserOutlined style={{ color: 'var(--ant-color-text-secondary)' }} />}
              placeholder="admin.user"
              value={kullaniciAdi}
              onChange={(e) => setKullaniciAdi(e.target.value)}
              style={{ borderRadius: 8 }}
              required
            />
          </div>
          
          <div>
            <Text style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: 13 }}>Şifre</Text>
            <Input.Password
              size="large"
              prefix={<LockOutlined style={{ color: 'var(--ant-color-text-secondary)' }} />}
              placeholder="••••••••"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              style={{ borderRadius: 8 }}
              required
            />
          </div>
          
          <Button 
            type="primary" 
            htmlType="submit" 
            size="large" 
            loading={loading}
            style={{ 
              marginTop: 8, 
              borderRadius: 8, 
              fontWeight: 500,
              height: 44 
            }} 
            block
          >
            Giriş Yap
          </Button>
        </form>
      </Card>
    </Layout>
  );
};

export default Login;