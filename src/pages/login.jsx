import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Button, Typography, Layout } from 'antd';
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
      alert('Giriş başarısız oldu. Bilgileri kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4F4F5' }}>
      <Card 
        style={{ 
          width: 400, 
          borderRadius: 12, 
          border: '1px solid #E4E4E7', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' 
        }} 
        bodyStyle={{ padding: '40px 32px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 40, height: 40, background: '#2563EB', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <div style={{ width: 16, height: 16, background: '#FFFFFF', borderRadius: 3 }} />
          </div>
          <Title level={3} style={{ margin: '0 0 8px 0', color: '#18181B', fontWeight: 600 }}>Stok Takip</Title>
          <Text style={{ color: '#71717A', fontSize: 14 }}>Sisteme giriş yapmak için bilgilerinizi girin.</Text>
        </div>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <Text style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#3F3F46', fontSize: 13 }}>Kullanıcı Adı</Text>
            <Input
              size="large"
              prefix={<UserOutlined style={{ color: '#A1A1AA' }} />}
              placeholder="admin.user"
              value={kullaniciAdi}
              onChange={(e) => setKullaniciAdi(e.target.value)}
              style={{ borderRadius: 8, borderColor: '#E4E4E7' }}
              required
            />
          </div>
          
          <div>
            <Text style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#3F3F46', fontSize: 13 }}>Şifre</Text>
            <Input.Password
              size="large"
              prefix={<LockOutlined style={{ color: '#A1A1AA' }} />}
              placeholder="••••••••"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              style={{ borderRadius: 8, borderColor: '#E4E4E7' }}
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
              background: '#2563EB', 
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