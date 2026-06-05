import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, theme, Typography } from 'antd';
import { DashboardOutlined, AppstoreOutlined, TransactionOutlined } from '@ant-design/icons';
import Dashboard from './pages/Dashboard';
import Urunler from './pages/Urunler';
import StokHareketleri from './pages/StokHareketleri';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 6 }} />
        
        <Menu 
          theme="dark" 
          selectedKeys={[location.pathname]} 
          mode="inline" 
          onClick={(e) => navigate(e.key)}
          items={[
            { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
            { key: '/urunler', icon: <AppstoreOutlined />, label: 'Ürün Yönetimi' },
            { key: '/stok-hareketleri', icon: <TransactionOutlined />, label: 'Stok Hareketleri' },
          ]} 
        />
      </Sider>

      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Title level={4} style={{ margin: '18px 24px' }}>Stok Takip Paneli</Title>
        </Header>
        
        <Content style={{ margin: '16px' }}>
          <div style={{ padding: 24, minHeight: 360, background: colorBgContainer, borderRadius: borderRadiusLG }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/urunler" element={<Urunler />} />
              <Route path="/stok-hareketleri" element={<StokHareketleri />} />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;