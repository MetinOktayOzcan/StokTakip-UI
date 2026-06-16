import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Layout, Menu, ConfigProvider, Button, Dropdown, Avatar, Grid, theme as antdTheme } from 'antd';
import { 
  DashboardOutlined, AppstoreOutlined, TransactionOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined,
  HistoryOutlined, TeamOutlined, TagsOutlined,
  MoonOutlined, SunOutlined, CodeSandboxOutlined
} from '@ant-design/icons';
import Dashboard from './pages/Dashboard';
import Urunler from './pages/Urunler';
import StokHareketleri from './pages/StokHareketleri';
import Login from './pages/login';
import IslemGecmisi from './pages/IslemGecmisi';
import Kullanicilar from './pages/Kullanicilar';
import Kategoriler from './pages/Kategoriler';
import axios from 'axios';

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const PrivateRoute = ({ children }) => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? children : <Navigate to="/login" replace />;
};

const getUserInfo = () => {
  const info = localStorage.getItem('userInfo');
  if (info) {
    try {
      const parsed = JSON.parse(info);
      const adSoyad = parsed.adSoyad || 'Kullanıcı';
      const rol = parsed.rol || 'İzleyici';
      
      const formattedName = adSoyad.charAt(0).toUpperCase() + adSoyad.slice(1);
      const initials = formattedName.charAt(0).toUpperCase();
      return { adSoyad: formattedName, rol, initials };
    } catch {
      return { adSoyad: 'Kullanıcı', rol: 'İzleyici', initials: 'K' };
    }
  }
  return { adSoyad: '', rol: '', initials: '' };
};

const App = () => {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 992) {
      return true;
    }
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [currentUser, setCurrentUser] = useState(getUserInfo);
  
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();

  useEffect(() => {
    if (Object.keys(screens).length === 0) return; 
    if (!screens.lg) {
      setCollapsed(true);
    } else {
      setCollapsed(localStorage.getItem('sidebarCollapsed') === 'true');
    }
  }, [screens.lg]);

  useEffect(() => {
    setCurrentUser(getUserInfo());
  }, [location.pathname]);

  const userInfoString = localStorage.getItem('userInfo');

  if (!userInfoString && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  if (userInfoString && location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const handleSidebarToggle = () => {
    setCollapsed((prev) => {
      const newState = !prev;
      if (window.innerWidth >= 992) {
        localStorage.setItem('sidebarCollapsed', String(newState));
      }
      return newState;
    });
  };

  const appTheme = isDarkMode ? {
    bg: '#0d1117', card: '#161b22', text: '#c9d1d9', border: '#30363d',
    sidebar: '#010409', primary: '#58a6ff', headerControlBg: '#161b22',
    menuSelectedBg: '#1f6feb', menuSelectedText: '#ffffff'
  } : {
    bg: '#F5F6FA', card: '#ffffff', text: '#222026', border: '#f0f0f0',
    sidebar: '#222026', primary: '#877FC1', headerControlBg: '#ffffff',
    menuSelectedBg: '#F5F6FA', menuSelectedText: '#222026'
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch {
    } finally {
      localStorage.clear();
      navigate('/login');
    }
  };

  const profileMenu = {
    items: [
      { key: 'theme', icon: isDarkMode ? <SunOutlined /> : <MoonOutlined />, label: isDarkMode ? 'Aydınlık Temaya Geç' : 'Karanlık Temaya Geç', onClick: toggleTheme },
      { type: 'divider' },
      { key: 'logout', icon: <LogoutOutlined style={{ color: '#ff5630' }} />, label: <span style={{ color: '#ff5630' }}>Çıkış Yap</span>, onClick: handleLogout },
    ],
  };

  const getMenuItems = () => {
    const rol = currentUser.rol || '';
    const isAdmin = rol.toLowerCase() === 'admin';

    const items = [
      { key: '/', icon: <DashboardOutlined />, label: 'Genel Bakış' },
      { key: '/urunler', icon: <AppstoreOutlined />, label: 'Ürün Yönetimi' },
      { key: '/stok-hareketleri', icon: <TransactionOutlined />, label: 'Stok Hareketleri' }
    ];

    if (isAdmin) {
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
          colorBgBase: appTheme.card, colorBgContainer: appTheme.card,
          colorTextBase: appTheme.text, colorBorderSecondary: appTheme.border,
          colorPrimary: appTheme.primary, borderRadius: 24,
        }
      }}
    >
      <style>{`
        body { background-color: ${appTheme.bg} !important; color: ${appTheme.text} !important; margin: 0; transition: background-color 0.3s ease; }
        .menu-scroll::-webkit-scrollbar { width: 0px; }
        .ant-layout { overflow-x: hidden; background: transparent !important; }
        .ant-menu-dark.ant-menu-dark:not(.ant-menu-horizontal) .ant-menu-item-selected { background-color: ${appTheme.menuSelectedBg} !important; color: ${appTheme.menuSelectedText} !important; border-radius: 12px; }
        .ant-menu-dark .ant-menu-item { border-radius: 12px; margin-bottom: 8px; }
        .user-profile-btn:hover { background-color: ${isDarkMode ? '#161b22' : '#393540'}; }
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
          .ant-input, .ant-input-affix-wrapper, .ant-select-selector, .ant-picker, .ant-input-number, .ant-input-number-input { background-color: #0d1117 !important; border-color: #30363d !important; color: #c9d1d9 !important; }
          .ant-modal-content, .ant-modal-header { background-color: #161b22 !important; border-color: #30363d !important; }
          .ant-modal-title, .ant-modal-close { color: #c9d1d9 !important; }
        ` : ''}
      `}</style>

      <Layout style={{ minHeight: '100vh' }}>
        {screens.xs && !collapsed && (
          <div onClick={() => setCollapsed(true)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.6)', zIndex: 98 }} />
        )}
        <Sider 
          trigger={null} collapsible collapsed={collapsed} collapsedWidth={screens.xs ? 0 : 80} width={240}
          style={{ 
            background: appTheme.sidebar, 
            borderRight: isDarkMode && !(screens.xs && collapsed) ? `1px solid ${appTheme.border}` : 'none', 
            height: 'calc(100vh - 32px)', 
            position: 'fixed', 
            left: 16, 
            top: 16, 
            bottom: 16, 
            zIndex: 100, 
            borderRadius: 24, 
            overflow: 'hidden', 
            display: screens.xs && collapsed ? 'none' : 'flex', 
            flexDirection: 'column' 
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', gap: '10px', padding: '0 16px', flexShrink: 0 }}>
              <CodeSandboxOutlined style={{ fontSize: '28px', color: '#ffffff' }} />
              {!collapsed && <span style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '1px', whiteSpace: 'nowrap' }}>Stok Takip</span>}
            </div>
            <div className="menu-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '0 12px' }}>
              <Menu theme="dark" selectedKeys={[location.pathname]} mode="inline" onClick={(e) => navigate(e.key)} style={{ background: 'transparent', borderRight: 0 }} items={getMenuItems()} />
            </div>
            <div style={{ padding: collapsed ? '12px 8px' : '12px 16px', borderTop: `1px solid ${isDarkMode ? '#30363d' : '#393540'}`, flexShrink: 0 }}>
              <Dropdown menu={profileMenu} placement="topRight" trigger={['click']}>
                <div className="user-profile-btn" style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '8px', borderRadius: '12px', transition: 'background 0.2s', justifyContent: collapsed ? 'center' : 'flex-start' }}>
                  <Avatar style={{ backgroundColor: isDarkMode ? '#1f6feb' : '#DBD3F5', color: isDarkMode ? '#ffffff' : '#877FC1', fontWeight: 'bold', flexShrink: 0 }}>
                    {currentUser.initials}
                  </Avatar>
                  {!collapsed && (
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.adSoyad}</span>
                      <span style={{ fontSize: '12px', color: '#8b949e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.rol}</span>
                    </div>
                  )}
                </div>
              </Dropdown>
            </div>
          </div>
        </Sider>

        <Layout style={{ marginLeft: screens.xs ? 0 : (collapsed ? 112 : 272), transition: 'margin-left 0.2s', minHeight: '100vh', paddingRight: 16 }}>
          <Header style={{ padding: screens.xs ? '0 12px' : '0 24px', background: 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 72, zIndex: 97 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={handleSidebarToggle} style={{ fontSize: '18px', width: 40, height: 40, color: appTheme.text, marginRight: screens.xs ? 0 : 16 }} />
              {!screens.xs && (<div><h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: appTheme.text }}>Stok Takip</h1></div>)}
            </div>
          </Header>
          <Content style={{ padding: screens.xs ? '12px' : '0 24px 24px 24px', overflowX: 'hidden' }}>
            <Routes>
              <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/urunler" element={<PrivateRoute><Urunler /></PrivateRoute>} />
              <Route path="/stok-hareketleri" element={<PrivateRoute><StokHareketleri /></PrivateRoute>} />
              {(currentUser.rol || '').toLowerCase() === 'admin' && (
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