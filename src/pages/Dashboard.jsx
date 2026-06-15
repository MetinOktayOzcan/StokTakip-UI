import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Table, Typography, Tag, Avatar } from 'antd';
import { AppstoreOutlined, RiseOutlined, ShoppingCartOutlined, AlertOutlined } from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

const { Text, Title } = Typography;

const PIE_COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];

const Dashboard = () => {
  const [urunler, setUrunler] = useState([]);
  const [hareketler, setHareketler] = useState([]);
  const [loglar, setLoglar] = useState([]);

  useEffect(() => {
    axios.get('/api/urunler').then(res => setUrunler(res.data)).catch(err => console.error(err));
    axios.get('/api/stokhareketleri').then(res => setHareketler(res.data)).catch(err => console.error(err));
    axios.get('/api/islemgecmisi').then(res => setLoglar(res.data)).catch(err => console.error(err)); 
  }, []);

  const kritikStokUrunleri = urunler.filter(u => u.stokAdedi < 15).sort((a, b) => a.stokAdedi - b.stokAdedi);
  const kritikStokSayisi = urunler.filter(u => u.stokAdedi < 15).length;
  
  let totalAdet = 0;
  let totalValue = 0;
  
  urunler.forEach(u => {
    totalAdet += u.stokAdedi;
    totalValue += (u.stokAdedi * u.birimFiyati);
  });

  const bugun = new Date().toLocaleDateString('tr-TR');
  const bugunkuIslemler = hareketler.filter(h => new Date(h.islemTarihi).toLocaleDateString('tr-TR') === bugun).length;
  const sonLoglar = loglar.slice(0, 6);

  const categoryMap = {};
  urunler.forEach(u => {
    const kat = u.kategoriAdi || 'Diğer';
    categoryMap[kat] = (categoryMap[kat] || 0) + u.stokAdedi;
  });

  const chartData = Object.keys(categoryMap).map(k => ({ name: k, value: categoryMap[k] })).sort((a, b) => b.value - a.value);

  const weeklyData = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      tamTarih: d.toLocaleDateString('tr-TR'),
      gun: d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
      giris: 0,
      cikis: 0
    };
  });

  hareketler.forEach(hareket => {
    if (!hareket.islemTarihi) return;
    
    const islemZamani = new Date(hareket.islemTarihi).toLocaleDateString('tr-TR');
    const index = weeklyData.findIndex(d => d.tamTarih === islemZamani);
    
    if (index !== -1) {
      const islemType = hareket.islemTuru?.toLowerCase() || '';
      
      if (islemType.includes('giriş') || islemType.includes('giris')) {
        weeklyData[index].giris += hareket.miktar || 0;
      } else if (islemType.includes('çıkış') || islemType.includes('cikis')) {
        weeklyData[index].cikis += hareket.miktar || 0;
      }
    }
  });

  const tableColumns = [
    { title: '#', key: 'index', width: 40, render: (text, record) => <Text style={{ color: '#A1A1AA', fontWeight: 500 }}>{kritikStokUrunleri.indexOf(record) + 1}</Text> },
    { title: 'Ürün', dataIndex: 'urunAdi', key: 'urunAdi', render: (text) => <Text style={{ fontWeight: 500, color: '#18181B' }}>{text}</Text> },
    { title: 'Kategori', dataIndex: 'kategoriAdi', key: 'kategoriAdi', render: (text) => <Text style={{ color: '#71717A' }}>{text || '-'}</Text> },
    { title: 'Stok', dataIndex: 'stokAdedi', key: 'stokAdedi', render: (text) => <Text style={{ fontWeight: 600 }}>{text}</Text> },
    { title: 'Durum', key: 'status', render: (_, record) => {
        const isCritical = record.stokAdedi < 10;
        return (
          <Tag color={isCritical ? 'error' : 'warning'} style={{ borderRadius: 12, border: 0, fontWeight: 500, padding: '2px 8px' }}>
            {isCritical ? 'Kritik' : 'Azalıyor'}
          </Tag>
        );
      }
    }
  ];

  const StatCard = ({ title, value, icon, trend, isAlert }) => (
    <Card style={{ borderRadius: 12, border: '1px solid #E4E4E7', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.02)' }} bodyStyle={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Text style={{ color: '#71717A', fontSize: 13, fontWeight: 500 }}>{title}</Text>
        <div style={{ color: isAlert ? '#EF4444' : '#A1A1AA', fontSize: 18 }}>{icon}</div>
      </div>
      <div style={{ marginTop: 16 }}>
        <Title level={2} style={{ margin: 0, fontSize: 32, fontWeight: 600, color: '#18181B', letterSpacing: '-0.5px' }}>{value}</Title>
      </div>
      <div style={{ marginTop: 8 }}>
        {trend && (
          <Text style={{ fontSize: 12, color: trend.includes('+') ? '#10B981' : '#71717A', fontWeight: 500 }}>
            {trend} <span style={{ color: '#A1A1AA', fontWeight: 400 }}>geçen aya göre</span>
          </Text>
        )}
      </div>
    </Card>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
        <div>
          <Title level={4} style={{ margin: 0, color: '#18181B', fontWeight: 600 }}>Özet</Title>
          <Text style={{ color: '#71717A' }}>Dashboard ve temel metrikler</Text>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}><StatCard title="Toplam Ürün Sayısı" value={totalAdet.toLocaleString()} icon={<AppstoreOutlined />} trend="+12.5%" /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Stok Değeri" value={`${totalValue.toLocaleString()} ₺`} icon={<RiseOutlined />} trend="+4.1%" /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Bugünün İşlemleri" value={bugunkuIslemler} icon={<ShoppingCartOutlined />} trend="+24 bugün" /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Önemli Uyarılar" value={kritikStokSayisi} icon={<AlertOutlined />} isAlert trend={`${kritikStokSayisi} ürün eşik altında`} /></Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} xl={16}>
          <Card style={{ borderRadius: 12, border: '1px solid #E4E4E7', height: '100%', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.02)' }} bodyStyle={{ padding: 24 }}>
            <Title level={5} style={{ margin: '0 0 24px 0', fontSize: 15, fontWeight: 600 }}>Haftalık Stok Dalgalanması</Title>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGiris" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCikis" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#94A3B8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F4F5" />
                  <XAxis dataKey="gun" axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E4E4E7', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} itemStyle={{ fontSize: 13, fontWeight: 500 }} labelStyle={{ color: '#71717A', marginBottom: 4 }} />
                  <Area type="monotone" dataKey="giris" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorGiris)" name="Giriş" />
                  <Area type="monotone" dataKey="cikis" stroke="#94A3B8" strokeWidth={2} fillOpacity={1} fill="url(#colorCikis)" name="Çıkış" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card style={{ borderRadius: 12, border: '1px solid #E4E4E7', height: '100%', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.02)' }} bodyStyle={{ padding: 24 }}>
            <Title level={5} style={{ margin: '0 0 24px 0', fontSize: 15, fontWeight: 600 }}>Kategori Dağılımı</Title>
            <div style={{ height: 200, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E4E4E7' }} itemStyle={{ color: '#18181B' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 600, color: '#18181B', display: 'block', lineHeight: 1 }}>{chartData.length}</Text>
                <Text style={{ fontSize: 11, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kategori</Text>
              </div>
            </div>
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {chartData.slice(0, 4).map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: PIE_COLORS[idx] }} />
                    <Text style={{ fontSize: 13, color: '#3F3F46' }}>{item.name}</Text>
                  </div>
                  <Text style={{ fontSize: 13, fontWeight: 500, color: '#18181B' }}>{item.value}</Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ display: 'flex', alignItems: 'stretch' }}>
        <Col xs={24} xl={16} style={{ display: 'flex' }}>
          <Card style={{ borderRadius: 12, border: '1px solid #E4E4E7', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.02)', width: '100%', display: 'flex', flexDirection: 'column' }} bodyStyle={{ padding: 0, flex: 1 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E4E4E7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={5} style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Kritik Stoktaki Ürünler</Title>
            </div>
            <div style={{ padding: '16px 24px' }}>
              <Table 
                dataSource={kritikStokUrunleri} 
                columns={tableColumns} 
                pagination={{ pageSize: 4, size: 'small', position: ['bottomCenter'] }} 
                rowKey="urunId"
                style={{ background: 'transparent' }}
                rowClassName={() => 'custom-table-row'}
              />
            </div>
            <style>{`
              .ant-table-wrapper .ant-table-thead > tr > th { background: #FAFAFA; color: #71717A; font-weight: 600; font-size: 12px; letter-spacing: 0.5px; border-bottom: 1px solid #E4E4E7; }
              .custom-table-row:hover > td { background: #F4F4F5 !important; }
              .ant-table-wrapper .ant-table-tbody > tr > td { border-bottom: 1px solid #F4F4F5; }
              .ant-table-wrapper .ant-table-tbody > tr:last-child > td { border-bottom: none; }
            `}</style>
          </Card>
        </Col>
        
        <Col xs={24} xl={8} style={{ display: 'flex' }}>
          <Card style={{ borderRadius: 12, border: '1px solid #E4E4E7', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.02)', width: '100%', display: 'flex', flexDirection: 'column' }} bodyStyle={{ padding: 24, flex: 1 }}>
            <Title level={5} style={{ margin: '0 0 24px 0', fontSize: 15, fontWeight: 600 }}>Geçmiş İşlemler</Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {sonLoglar.map((log, idx) => {
                const isEkleme = log.islemTipi?.toLowerCase().includes('ekle') || log.islemTipi?.toLowerCase().includes('giriş');
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <Avatar size={32} style={{ backgroundColor: isEkleme ? '#DBEAFE' : '#F1F5F9', color: isEkleme ? '#2563EB' : '#475569', fontSize: 13, flexShrink: 0, marginTop: 2 }}>
                      {log.kullanici?.charAt(0).toUpperCase() || 'S'}
                    </Avatar>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <Text style={{ fontWeight: 600, color: '#18181B', fontSize: 13 }}>{log.kullanici}</Text>
                        <Text style={{ fontSize: 11, color: '#A1A1AA' }}>
                          {new Date(log.islemTarihi).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </div>
                      <Text style={{ fontSize: 13, color: '#71717A', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.detay}
                      </Text>
                    </div>
                  </div>
                );
              })}
              {sonLoglar.length === 0 && <Text style={{ color: '#A1A1AA' }}>Son işlem bulunamadı.</Text>}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;