import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Layout, Menu, theme, Typography, ConfigProvider, Switch } from 'antd';
import { DashboardOutlined, AppstoreOutlined, TransactionOutlined } from '@ant-design/icons';
import Dashboard from './pages/Dashboard';
import Urunler from './pages/Urunler';
import StokHareketleri from './pages/StokHareketleri';
import Login from './pages/login';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [karanlikMod, setKaranlikMod] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const temaRengi = karanlikMod ? {
    genelArkaPlan: '#161c24',
    kartArkaPlan: '#212b36',
    yazi: '#ffffff',
    cerceve: '#2d3a48',
    menuArka: '#161c24'
  } : {
    genelArkaPlan: '#f0f2f5',
    kartArkaPlan: '#ffffff',
    yazi: '#000000',
    cerceve: '#d9d9d9',
    menuArka: '#001529'
  };

  if (location.pathname === '/login') {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  return (
    <ConfigProvider 
      theme={{ 
        algorithm: karanlikMod ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorBgBase: temaRengi.kartArkaPlan,
          colorBgContainer: temaRengi.kartArkaPlan,
          colorTextBase: temaRengi.yazi,
          colorBorderSecondary: temaRengi.cerceve,
          borderRadius: 12,
        }
      }}
    >
      <Layout style={{ minHeight: '100vh', background: temaRengi.genelArkaPlan }}>
        <Sider 
          collapsible 
          collapsed={collapsed} 
          onCollapse={(value) => setCollapsed(value)}
          style={{ background: temaRengi.menuArka, borderRight: `1px solid ${temaRengi.cerceve}` }}
        >
          <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.05)', borderRadius: 8 }} />
          
          <Menu 
            theme="dark" 
            selectedKeys={[location.pathname]} 
            mode="inline" 
            onClick={(e) => navigate(e.key)}
            style={{ background: 'transparent' }}
            items={[
              { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
              { key: '/urunler', icon: <AppstoreOutlined />, label: 'Ürün Yönetimi' },
              { key: '/stok-hareketleri', icon: <TransactionOutlined />, label: 'Stok Hareketleri' },
            ]} 
          />
        </Sider>

        <Layout style={{ background: temaRengi.genelArkaPlan }}>
          <Header style={{ 
            padding: '0 24px', 
            background: temaRengi.genelArkaPlan, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: `1px solid ${temaRengi.cerceve}`
          }}>
            <Title level={4} style={{ margin: 0, color: temaRengi.yazi }}>Stok Takip Paneli</Title>
            <Switch 
              checkedChildren="🌙" 
              unCheckedChildren="☀️" 
              checked={karanlikMod} 
              onChange={(checked) => setKaranlikMod(checked)} 
            />
          </Header>
          
          <Content style={{ padding: '24px' }}>
            <Routes>
              <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/urunler" element={<PrivateRoute><Urunler /></PrivateRoute>} />
              <Route path="/stok-hareketleri" element={<PrivateRoute><StokHareketleri /></PrivateRoute>} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default App;