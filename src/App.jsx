import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme, Typography } from 'antd';
import { DashboardOutlined, AppstoreOutlined, TransactionOutlined } from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    console.log("Arayüz yüklendi, API bağlantısı bekleniyor...");
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 6 }} />
        
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={[
          { key: '1', icon: <DashboardOutlined />, label: 'Dashboard' },
          { key: '2', icon: <AppstoreOutlined />, label: 'Ürün Yönetimi' },
          { key: '3', icon: <TransactionOutlined />, label: 'Stok Hareketleri' },
        ]} />
      </Sider>

      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Title level={4} style={{ margin: '18px 24px' }}>Stok Takip Paneli</Title>
        </Header>
        
        <Content style={{ margin: '16px' }}>
          <div style={{ padding: 24, minHeight: 360, background: colorBgContainer, borderRadius: borderRadiusLG }}>
            <h2>Sisteme Hoş Geldiniz</h2>
            <p>Tablolar ve veri akışı buraya eklenecek...</p>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;