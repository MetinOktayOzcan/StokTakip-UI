import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Statistic, Typography, Table, Timeline, Tag } from 'antd';
import { ShoppingOutlined, WarningOutlined, RiseOutlined } from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

const renkler = ['#00b8d9', '#36b37e', '#ffab00', '#ff5630', '#6554c0', '#00aeb7'];

const Dashboard = () => {
  const [urunler, setUrunler] = useState([]);
  const [hareketler, setHareketler] = useState([]);

  useEffect(() => {
    axios.get('/api/urunler').then(res => setUrunler(res.data));
    axios.get('/api/stokhareketleri').then(res => setHareketler(res.data));
  }, []);

  const kritikStokUrunleri = urunler
    .filter(u => u.stokMiktari < 20)
    .sort((a, b) => a.stokMiktari - b.stokMiktari);
  
  const kritikStok = kritikStokUrunleri.length;
  
  let toplamAdet = 0;
  urunler.forEach(u => {
    toplamAdet += u.stokMiktari;
  });

  const bugun = new Date().toLocaleDateString('tr-TR');
  const bugunkuIslemler = hareketler.filter(h => {
    const islemTarihi = new Date(h.islemTarihi).toLocaleDateString('tr-TR');
    return islemTarihi === bugun;
  }).length;

  const son4Islem = hareketler.slice(0, 4);

  const kategoriData = {};
  urunler.forEach(u => {
    const kat = u.kategoriAdi || 'Bilgisayar Parçaları';
    if(kategoriData[kat]) {
      kategoriData[kat] += u.stokMiktari;
    } else {
      kategoriData[kat] = u.stokMiktari;
    }
  });

  const pastaVerisi = Object.keys(kategoriData).map(k => ({
    name: k,
    value: kategoriData[k]
  }));

  const grafikVerisi = [
    { gun: 'Pzt', giris: 40, cikis: 24 },
    { gun: 'Sal', giris: 30, cikis: 13 },
    { gun: 'Çar', giris: 20, cikis: 58 },
    { gun: 'Per', giris: 27, cikis: 39 },
    { gun: 'Cum', giris: 18, cikis: 48 },
    { gun: 'Cmt', giris: 23, cikis: 38 },
    { gun: 'Paz', giris: 34, cikis: 43 },
  ];

  const kritikSutunlar = [
    { title: 'Ürün', dataIndex: 'urunAdi', key: 'urunAdi', fontWeight: 'bold' },
    { title: 'Kategori', dataIndex: 'kategoriAdi', key: 'kategoriAdi' },
    { 
      title: 'Stok Durumu', 
      dataIndex: 'stokMiktari', 
      key: 'stokMiktari',
      render: (stok) => (
        <Tag 
          style={{ 
            background: stok === 0 ? 'rgba(255, 86, 48, 0.16)' : 'rgba(255, 171, 0, 0.16)', 
            color: stok === 0 ? '#ff5630' : '#ffab00', 
            border: 'none',
            padding: '2px 8px',
            borderRadius: '6px',
            fontWeight: 'bold'
          }}
        >
          {stok === 0 ? 'Tükendi (0)' : `${stok} Adet Kaldı`}
        </Tag>
      )
    }
  ];

  const kartStili = { 
    border: 'none', 
    height: '100%',
    borderRadius: 12,
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  };

  return (
    <div>
      {/* Tablonun sayfa numaralarını her zaman en altta tutacak CSS hilesi */}
      <style>{`
        .sabit-tablo .ant-spin-container {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 230px; 
        }
      `}</style>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} lg={8}>
          <Card style={kartStili}>
            <Statistic title="Bugünkü İşlemler" value={bugunkuIslemler} prefix={<RiseOutlined style={{ color: '#00b8d9' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={24} lg={8}>
          <Card style={kartStili}>
            <Statistic title="Depodaki Toplam Ürün" value={toplamAdet} prefix={<ShoppingOutlined style={{ color: '#ffab00' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={24} lg={8}>
          <Card style={kartStili}>
            <Statistic title="Kritik Stok Uyarısı" value={kritikStok} valueStyle={{ color: '#ff5630' }} prefix={<WarningOutlined />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col xs={24} lg={16}>
          <Card title="Haftalık Stok Dalgalanması" style={kartStili}>
            <div style={{ width: '100%', height: 230 }}>
              <ResponsiveContainer>
                <AreaChart data={grafikVerisi} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2d3a48" />
                  <XAxis dataKey="gun" axisLine={false} tickLine={false} tick={{fill: '#919eab'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#919eab'}} />
                  <Tooltip contentStyle={{ backgroundColor: '#212b36', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Area type="monotone" dataKey="giris" stroke="#00b8d9" fill="#00b8d9" fillOpacity={0.2} name="Ürün Girişi" />
                  <Area type="monotone" dataKey="cikis" stroke="#ffab00" fill="#ffab00" fillOpacity={0.2} name="Ürün Çıkışı" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Kategori Dağılımı" style={kartStili}>
            <div style={{ width: '100%', height: 230, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={pastaVerisi} 
                    innerRadius={55} 
                    outerRadius={80} 
                    paddingAngle={5} 
                    dataKey="value"
                    label={({ name }) => name}
                  >
                    {pastaVerisi.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={renkler[index % renkler.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#212b36', border: 'none', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col xs={24} lg={16}>
          <Card title="Kritik Stok Uyarıları (20 Adet Altı)" style={kartStili}>
            <Table 
              className="sabit-tablo"
              dataSource={kritikStokUrunleri} 
              columns={kritikSutunlar} 
              pagination={{ pageSize: 3 }} 
              rowKey="urunID"
              size="small"
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Son Aktiviteler" style={kartStili}>
            <Timeline>
              {son4Islem.map(islem => {
                const renk = islem.islemTuru.toLowerCase().includes('giriş') || islem.islemTuru.toLowerCase().includes('giris') ? '#00b8d9' : '#ff5630';
                const saat = new Date(islem.islemTarihi).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                return (
                  <Timeline.Item key={islem.hareketID} color={renk} style={{ paddingBottom: '16px' }}>
                    <span style={{ color: '#fff' }}>{islem.miktar} Adet {islem.urunAdi} {islem.islemTuru} yapıldı. ({saat})</span>
                  </Timeline.Item>
                );
              })}
            </Timeline>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;