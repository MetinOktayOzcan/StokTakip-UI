import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme, Typography, Table } from 'antd';
import { DashboardOutlined, AppstoreOutlined, TransactionOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [urunler, setUrunler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const verileriCek = async () => {
    try {
      const response = await axios.get('http://localhost:5185/api/urunler');
      setUrunler(response.data);
      setYukleniyor(false);
    } catch (error) {
      console.log(error);
      setYukleniyor(false);
    }
  };

  useEffect(() => {
    verileriCek();
  }, []);

  const tabloSutunlari = [
    { title: 'ID', dataIndex: 'urunID', key: 'urunID' },
    { title: 'Ürün Adı', dataIndex: 'urunAdi', key: 'urunAdi' },
    { title: 'Kategori', dataIndex: 'kategoriAdi', key: 'kategoriAdi' },
    { title: 'Fiyat', dataIndex: 'birimFiyat', key: 'birimFiyat', render: (text) => <span>{text} TL</span> },
    { title: 'Stok', dataIndex: 'stokMiktari', key: 'stokMiktari' }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 6 }} />
        
        <Menu theme="dark" defaultSelectedKeys={['2']} mode="inline" items={[
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2>Ürün Listesi</h2>
            </div>
            
            <Table 
              dataSource={urunler} 
              columns={tabloSutunlari} 
              rowKey="urunID" 
              loading={yukleniyor} 
            />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;