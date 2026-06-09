import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Layout, Menu, ConfigProvider, Button, Dropdown, Space, Avatar, Grid, theme as antdTheme } from 'antd';
import { 
  DashboardOutlined, 
  AppstoreOutlined, 
  TransactionOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  HistoryOutlined,
  TeamOutlined,
  TagsOutlined,
  BellOutlined,
  MoonOutlined,
  SunOutlined
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
const { useBreakpoint } = Grid;

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const decodeToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded = jwtDecode(token);
      const adSoyad = decoded.AdSoyad || decoded.unique_name || decoded.Name || 'Kullanıcı';
      const rol = decoded.role || decoded.Rol || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'Admin';
      const formatliIsim = adSoyad.charAt(0).toUpperCase() + adSoyad.slice(1);
      const basHarfler = formatliIsim.charAt(0).toUpperCase();
      return { adSoyad: formatliIsim, rol, basHarfler };
    } catch (error) {}
  }
  return { adSoyad: '', rol: '', basHarfler: '' };
};

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [kullanici, setKullanici] = useState(decodeToken);
  
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
    setKullanici(decodeToken());
  }, [location.pathname]);

  const toggleTheme = () => {
    const yeniTema = !isDarkMode;
    setIsDarkMode(yeniTema);
    localStorage.setItem('theme', yeniTema ? 'dark' : 'light');
  };

  const appTheme = isDarkMode ? {
    bg: '#0d1117',
    card: '#161b22',
    text: '#c9d1d9',
    border: '#30363d',
    sidebar: '#010409',
    primary: '#58a6ff',
    headerControlBg: '#161b22',
    menuSelectedBg: '#1f6feb',
    menuSelectedText: '#ffffff'
  } : {
    bg: '#F5F6FA',
    card: '#ffffff',
    text: '#222026',
    border: '#f0f0f0',
    sidebar: '#222026',
    primary: '#877FC1',
    headerControlBg: '#ffffff',
    menuSelectedBg: '#F5F6FA',
    menuSelectedText: '#222026'
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const profileMenu = {
    items: [
      {
        key: 'logout',
        icon: <LogoutOutlined style={{ color: '#ff5630' }} />,
        label: <span style={{ color: '#ff5630' }}>Çıkış Yap</span>,
        onClick: handleLogout
      },
    ],
  };

  const getMenuItems = () => {
    const rol = kullanici.rol || '';
    const isSekmeAdmin = rol.toLowerCase() === 'admin';

    const items = [
      { key: '/', icon: <DashboardOutlined />, label: 'Genel Bakış' },
      { key: '/urunler', icon: <AppstoreOutlined />, label: 'Ürün Yönetimi' },
      { key: '/stok-hareketleri', icon: <TransactionOutlined />, label: 'Stok Hareketleri' }
    ];

    if (isSekmeAdmin) {
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
        algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          fontFamily: '"Zona Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          colorBgBase: appTheme.card,
          colorBgContainer: appTheme.card,
          colorTextBase: appTheme.text,
          colorBorderSecondary: appTheme.border,
          colorPrimary: appTheme.primary,
          borderRadius: 24,
        }
      }}
    >
      <style>{`
        body { 
          background-color: ${appTheme.bg} !important; 
          color: ${appTheme.text} !important; 
          margin: 0; 
          transition: background-color 0.3s ease;
        }
        .menu-scroll::-webkit-scrollbar { width: 0px; }
        .ant-layout { overflow-x: hidden; background: transparent !important; }
        
        .ant-menu-dark.ant-menu-dark:not(.ant-menu-horizontal) .ant-menu-item-selected {
          background-color: ${appTheme.menuSelectedBg} !important;
          color: ${appTheme.menuSelectedText} !important;
          border-radius: 12px;
        }
        .ant-menu-dark .ant-menu-item {
          border-radius: 12px;
          margin-bottom: 8px;
        }

        ${isDarkMode ? `
          .ant-card, .ant-card-body { background-color: #161b22 !important; border-color: #30363d !important; }
          .ant-table-wrapper .ant-table-thead > tr > th { background-color: #0d1117 !important; color: #8b949e !important; border-bottom: 1px solid #30363d !important; }
          .ant-table-wrapper .ant-table-tbody > tr > td { background-color: #161b22 !important; color: #c9d1d9 !important; border-bottom: 1px solid #30363d !important; }
          .ant-table-wrapper .ant-table-tbody > tr:hover > td, .custom-table-row:hover > td { background-color: #21262d !important; }
          
          h1, h2, h3, h4, h5, h6, .ant-typography { color: #c9d1d9 !important; }
          
          [style*="#18181B"], [style*="rgb(24, 24, 27)"] { color: #c9d1d9 !important; }
          [style*="#71717A"], [style*="rgb(113, 113, 122)"] { color: #8b949e !important; }
          [style*="#F4F4F5"], [style*="rgb(244, 244, 245)"] { background-color: #21262d !important; border-color: #30363d !important; }
          [style*="#FAFAFA"], [style*="rgb(250, 250, 250)"] { background-color: #0d1117 !important; }
          
          .ant-input, .ant-input-affix-wrapper, .ant-select-selector, .ant-picker, .ant-input-number, .ant-input-number-input {
            background-color: #0d1117 !important;
            border-color: #30363d !important;
            color: #c9d1d9 !important;
          }
          .ant-modal-content, .ant-modal-header { background-color: #161b22 !important; border-color: #30363d !important; }
          .ant-modal-title, .ant-modal-close { color: #c9d1d9 !important; }
        ` : ''}
      `}</style>

      <Layout style={{ minHeight: '100vh' }}>
        
        {screens.xs && !collapsed && (
          <div 
            onClick={() => setCollapsed(true)}
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.6)', zIndex: 98 }}
          />
        )}

        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
          breakpoint="lg"
          collapsedWidth={screens.xs ? 0 : 80}
          width={240}
          style={{ 
            background: appTheme.sidebar, 
            borderRight: isDarkMode ? `1px solid ${appTheme.border}` : 'none',
            height: 'calc(100vh - 32px)',
            position: 'fixed',
            left: 16,
            top: 16,
            bottom: 16,
            zIndex: 100,
            borderRadius: 24,
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 'bold' }}>
            </div>
            
            <div className="menu-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '0 12px' }}>
              <Menu 
                theme="dark" 
                selectedKeys={[location.pathname]} 
                mode="inline" 
                onClick={(e) => navigate(e.key)}
                style={{ background: 'transparent', borderRight: 0 }} 
                items={getMenuItems()} 
              />
            </div>
          </div>
        </Sider>

        <Layout style={{ 
          marginLeft: screens.xs ? 0 : (collapsed ? 112 : 272),
          transition: 'margin-left 0.2s',
          minHeight: '100vh',
          paddingRight: 16
        }}>
          
          <Header style={{ 
            padding: screens.xs ? '0 12px' : '0 24px', 
            background: 'transparent', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            height: 100,
            zIndex: 97
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: '18px', width: 48, height: 48, color: appTheme.text, marginRight: screens.xs ? 0 : 16 }}
              />
              {!screens.xs && (
                <div>
                  <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: appTheme.text }}>Stok Takip</h1>
                </div>
              )}
            </div>

            <Space size={16} style={{ background: appTheme.headerControlBg, padding: '8px 16px', borderRadius: 40, border: `1px solid ${appTheme.border}`, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              {isDarkMode ? (
                <SunOutlined style={{ fontSize: 18, color: appTheme.text, cursor: 'pointer' }} onClick={toggleTheme} />
              ) : (
                <MoonOutlined style={{ fontSize: 18, color: appTheme.text, cursor: 'pointer' }} onClick={toggleTheme} />
              )}
              
              <BellOutlined style={{ fontSize: 18, color: appTheme.text, cursor: 'pointer', marginLeft: 8 }} />
              
              <Dropdown menu={profileMenu} placement="bottomRight">
                <Avatar style={{ backgroundColor: isDarkMode ? '#1f6feb' : '#DBD3F5', color: isDarkMode ? '#ffffff' : '#877FC1', cursor: 'pointer', fontWeight: 'bold' }}>
                  {kullanici.basHarfler}
                </Avatar>
              </Dropdown>
            </Space>

          </Header>
          
          <Content style={{ padding: screens.xs ? '12px' : '0 24px 24px 24px', overflowX: 'hidden' }}>
            <Routes>
              <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/urunler" element={<PrivateRoute><Urunler /></PrivateRoute>} />
              <Route path="/stok-hareketleri" element={<PrivateRoute><StokHareketleri /></PrivateRoute>} />
              
              {(kullanici.rol || '').toLowerCase() === 'admin' && (
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