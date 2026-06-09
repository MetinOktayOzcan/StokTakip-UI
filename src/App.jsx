import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Layout, Menu, theme, Typography, ConfigProvider, Button, Dropdown, Space, Avatar, Grid } from 'antd';
import { 
  DashboardOutlined, 
  AppstoreOutlined, 
  TransactionOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  MoonOutlined,
  SunOutlined,
  HistoryOutlined,
  TeamOutlined,
  TagsOutlined
} from '@ant-design/icons';
import Dashboard from './pages/Dashboard';
import Urunler from './pages/Urunler';
import StokHareketleri from './pages/StokHareketleri';
import Login from './pages/login';
import { jwtDecode } from 'jwt-decode';
import IslemGecmisi from './pages/IslemGecmisi';
import Kullanicilar from './pages/Kullanicilar';
import Kategoriler from './pages/Kategoriler';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [karanlikMod, setKaranlikMod] = useState(true);
  const [kullaniciBilgileri, setKullaniciBilgileri] = useState({ adSoyad: '', rol: '', basHarfler: '' });
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();

  useEffect(() => {
    if (screens.xs || screens.sm) {
      setCollapsed(true);
    } else {
      setCollapsed(false);
    }
  }, [screens]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const adSoyad = decoded.AdSoyad || decoded.unique_name || 'Kullanıcı';
        const rol = decoded.role || 'Admin';
        
        const formatliIsim = adSoyad.charAt(0).toUpperCase() + adSoyad.slice(1);
        const basHarfler = formatliIsim.charAt(0).toUpperCase();

        setKullaniciBilgileri({ adSoyad: formatliIsim, rol, basHarfler });
      } catch (error) {
      }
    }
  }, [location.pathname]);

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

  const cikisYap = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const profilMenusu = {
    items: [
      {
        key: '2',
        icon: <LogoutOutlined style={{ color: '#ff5630' }} />,
        label: <span style={{ color: '#ff5630' }}>Çıkış Yap</span>,
        onClick: cikisYap
      },
    ],
  };

  const menuElemanlariGetir = () => {
    const rol = kullaniciBilgileri.rol;
    const items = [
      { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
      { key: '/urunler', icon: <AppstoreOutlined />, label: 'Ürün Yönetimi' },
      { key: '/stok-hareketleri', icon: <TransactionOutlined />, label: 'Stok Hareketleri' }
    ];

    if (rol === 'Admin') {
      items.push({ key: '/kategoriler', icon: <TagsOutlined />, label: 'Kategori Yönetimi' });
      items.push({ key: '/islem-gecmisi', icon: <HistoryOutlined />, label: 'Sistem Logları' });
      items.push({ key: '/kullanicilar', icon: <TeamOutlined />, label: 'Kullanıcı Yönetimi' });
    }

    return items;
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
      <style>{`
        .menu-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .menu-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .menu-scroll::-webkit-scrollbar-thumb {
          background-color: ${temaRengi.cerceve};
          border-radius: 10px;
        }
        .ant-layout {
          overflow-x: hidden;
        }
      `}</style>

      <Layout style={{ minHeight: '100vh', background: temaRengi.genelArkaPlan }}>
        
        {screens.xs && !collapsed && (
          <div 
            onClick={() => setCollapsed(true)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0, 0, 0, 0.6)',
              zIndex: 98
            }}
          />
        )}

        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
          breakpoint="lg"
          collapsedWidth={screens.xs ? 0 : 80}
          style={{ 
            background: temaRengi.menuArka, 
            borderRight: `1px solid ${temaRengi.cerceve}`,
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.05)', borderRadius: 8, flexShrink: 0 }} />
            <div className="menu-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
              <Menu 
                theme="dark" 
                selectedKeys={[location.pathname]} 
                mode="inline" 
                onClick={(e) => navigate(e.key)}
                style={{ background: 'transparent', borderRight: 0 }} 
                items={menuElemanlariGetir()} 
              />
            </div>

           <div style={{ 
              padding: collapsed ? '16px 0' : '16px', 
              background: 'rgba(0,0,0,0.2)', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              borderTop: `1px solid ${temaRengi.cerceve}`,
              flexShrink: 0,
              width: '100%',
              boxSizing: 'border-box',
              overflow: 'hidden' 
            }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: collapsed ? 'column' : 'row', 
                alignItems: 'center', 
                justifyContent: collapsed ? 'center' : 'flex-start',
                width: '100%',
                padding: collapsed ? '0' : '0 8px',
                gap: collapsed ? '12px' : '12px',
                minWidth: 0
              }}>
                <Avatar style={{ backgroundColor: '#1890ff', flexShrink: 0 }}>
                  {kullaniciBilgileri.basHarfler}
                </Avatar>
                
                {!collapsed && (
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1, overflow: 'hidden' }}>
                    <Text style={{ 
                      color: '#fff', 
                      fontSize: '14px', 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      display: 'block',
                      width: '100%'
                    }}>
                      {kullaniciBilgileri.adSoyad}
                    </Text>
                    <Text style={{ color: '#8c98a4', fontSize: '12px', marginTop: 2 }}>
                      {kullaniciBilgileri.rol}
                    </Text>
                  </div>
                )}
              </div>

              <Button 
                type="text" 
                onClick={cikisYap} 
                icon={<LogoutOutlined style={{ color: '#ff5630', fontSize: '16px' }} />} 
                style={{ 
                  marginTop: collapsed ? 16 : 12,
                  width: collapsed ? '32px' : '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexShrink: 0 
                }}
              >
                {!collapsed && <span style={{ marginLeft: 8, color: '#ff5630' }}>Çıkış Yap</span>}
              </Button>
            </div>
            
          </div>
        </Sider>

        <Layout style={{ 
          background: temaRengi.genelArkaPlan,
          marginLeft: screens.xs ? 0 : (collapsed ? 80 : 200),
          transition: 'margin-left 0.2s',
          minHeight: '100vh'
        }}>
          
          <Header style={{ 
            padding: screens.xs ? '0 12px' : '0 24px', 
            background: temaRengi.genelArkaPlan, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: `1px solid ${temaRengi.cerceve}`,
            position: 'sticky',
            top: 0,
            zIndex: 97
          }}>
            
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: '16px', width: 48, height: 48, color: temaRengi.yazi, marginRight: screens.xs ? 0 : 16 }}
              />
              {!screens.xs && (
                <Title level={4} style={{ margin: 0, color: temaRengi.yazi }}>Stok Takip Paneli</Title>
              )}
            </div>

            <Space size={screens.xs ? "small" : "large"}>
              <Button 
                type="text" 
                icon={karanlikMod ? <SunOutlined style={{ color: '#faad14' }} /> : <MoonOutlined style={{ color: '#1890ff' }} />} 
                onClick={() => setKaranlikMod(!karanlikMod)} 
                style={{ fontSize: '20px' }}
              />
              <Dropdown menu={profilMenusu} placement="bottomRight">
                <Avatar style={{ backgroundColor: '#1890ff', cursor: 'pointer' }} icon={<UserOutlined />} />
              </Dropdown>
            </Space>

          </Header>
          
          <Content style={{ padding: screens.xs ? '12px' : '24px', overflowX: 'hidden' }}>
            <Routes>
              <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/urunler" element={<PrivateRoute><Urunler /></PrivateRoute>} />
              <Route path="/stok-hareketleri" element={<PrivateRoute><StokHareketleri /></PrivateRoute>} />
              
              {kullaniciBilgileri.rol === 'Admin' && (
                <>
                  <Route path="/kategoriler" element={<PrivateRoute><Kategoriler /></PrivateRoute>} />
                  <Route path="/islem-gecmisi" element={<PrivateRoute><IslemGecmisi /></PrivateRoute>} />
                  <Route path="/kullanicilar" element={<PrivateRoute><Kullanicilar /></PrivateRoute>} />
                </>
              )}

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default App;