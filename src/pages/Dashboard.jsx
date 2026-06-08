import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Statistic, Typography, Table, Timeline, Tag } from 'antd';
import { ShoppingOutlined, WarningOutlined, RiseOutlined } from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

const renkler = ['#00b8d9', '#36b37e', '#ffab00', '#ff5630', '#6554c0', '#00aeb7'];

const Dashboard = () => {
  const [urunler, setUrunler] = useState([]);
  const [hareketler, setHareketler] = useState([]);
  const [loglar, setLoglar] = useState([]);

  useEffect(() => {
    axios.get('/api/urunler').then(res => setUrunler(res.data));
    axios.get('/api/stokhareketleri').then(res => setHareketler(res.data));
    axios.get('/api/islemgecmisi').then(res => setLoglar(res.data)); 
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

  const sonLoglar = loglar.slice(0, 4);

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

  const gunIsimleri = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  const dinamikGrafikVerisi = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      gun: gunIsimleri[d.getDay()], 
      tamTarih: d.toLocaleDateString('tr-TR'),
      giris: 0,
      cikis: 0
    };
  });

  hareketler.forEach(hareket => {
    const islemTarihi = new Date(hareket.islemTarihi).toLocaleDateString('tr-TR');
    
    const hedefGun = dinamikGrafikVerisi.find(g => g.tamTarih === islemTarihi);

    if (hedefGun) {
      const tur = hareket.islemTuru.toLowerCase();
      if (tur.includes('giriş') || tur.includes('giris')) {
        hedefGun.giris += hareket.miktar;
      } else if (tur.includes('çıkış') || tur.includes('cikis')) {
        hedefGun.cikis += hareket.miktar;
      }
    }
  });

  const kritikSutunlar = [
    { title: 'Ürün', dataIndex: 'urunAdi', key: 'urunAdi', fontWeight: 'bold' },
    { title: 'Kategori', dataIndex: 'kategoriAdi', key: 'kategoriAdi' },
    { 
      title: 'Stok', 
      dataIndex: 'stokMiktari', 
      key: 'stokMiktari',
      width: '120px',
      render: (stok) => (
        <Tag 
          style={{ 
            background: stok === 0 ? 'rgba(255, 86, 48, 0.16)' : 'rgba(255, 171, 0, 0.16)', 
            color: stok === 0 ? '#ff5630' : '#ffab00', 
            border: 'none',
            padding: '2px 8px',
            borderRadius: '6px',
            fontWeight: 'bold',
            margin: 0
          }}
        >
          {stok === 0 ? 'Tükendi' : `${stok} Kaldı`}
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
      {/* Tablonun sayfa numaralarını her zaman en altta tutacak CSS kodu */}
      <style>{`
        .sabit-tablo .ant-spin-container {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 190px; 
        }
        .sabit-tablo .ant-table-pagination.ant-pagination {
          margin: 12px 0 0 0 !important;
        }
        .ant-timeline-item {
          padding-bottom: 12px !important;
        }
        .ant-timeline-item:last-child {
          padding-bottom: 0 !important;
        }
      `}</style>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} lg={8}>
          <Card style={kartStili} bodyStyle={{ padding: '16px 24px' }}>
            <Statistic title="Bugünkü İşlemler" value={bugunkuIslemler} prefix={<RiseOutlined style={{ color: '#00b8d9' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={24} lg={8}>
          <Card style={kartStili} bodyStyle={{ padding: '16px 24px' }}>
            <Statistic title="Depodaki Toplam Ürün" value={toplamAdet} prefix={<ShoppingOutlined style={{ color: '#ffab00' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={24} lg={8}>
          <Card style={kartStili} bodyStyle={{ padding: '16px 24px' }}>
            <Statistic title="Kritik Stok Uyarısı" value={kritikStok} valueStyle={{ color: '#ff5630' }} prefix={<WarningOutlined />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col xs={24} lg={16}>
          <Card title="Haftalık Stok Dalgalanması" style={kartStili} bodyStyle={{ padding: '16px 24px' }}>
            <div style={{ width: '100%', height: 210 }}>
              <ResponsiveContainer>
                <AreaChart data={dinamikGrafikVerisi} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
          <Card title="Kategori Dağılımı" style={kartStili} bodyStyle={{ padding: '16px 24px' }}>
            <div style={{ width: '100%', height: 210, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={pastaVerisi} 
                    innerRadius={45} 
                    outerRadius={70} 
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
          <Card title="Kritik Stok Uyarıları (20 Adet Altı)" style={kartStili} bodyStyle={{ padding: '16px 24px' }}>
            <Table 
              className="sabit-tablo"
              dataSource={kritikStokUrunleri} 
              columns={kritikSutunlar} 
              pagination={{ pageSize: 6 }} 
              rowKey="urunID"
              size="small"
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Son Aktiviteler" style={{...kartStili, overflow: 'hidden'}} bodyStyle={{ padding: '16px 24px' }}>
            <Timeline>
              {sonLoglar.map(log => {
                let noktaRengi = 'blue';
                const islem = log.islemTipi?.toLowerCase() || '';
                
                if (islem.includes('ekle') || islem.includes('giriş')) noktaRengi = 'green';
                if (islem.includes('sil') || islem.includes('çıkış')) noktaRengi = 'red';
                if (islem.includes('güncelle')) noktaRengi = 'orange';

                const saat = new Date(log.islemTarihi).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

                return (
                  <Timeline.Item key={log.logID || log.logId} color={noktaRengi}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography.Text strong style={{ fontSize: '13px' }}>
                        {log.islemTipi}
                      </Typography.Text>
                      
                      <Typography.Text style={{ fontSize: '12px', marginTop: '2px', lineHeight: '1.4' }} ellipsis={{ tooltip: log.detay }}>
                        {log.detay}
                      </Typography.Text>
                      
                      <div style={{ marginTop: '2px', fontSize: '11px', display: 'flex', gap: '8px' }}>
                        <Typography.Text type="secondary">👤 {log.kullanici}</Typography.Text>
                        <Typography.Text type="secondary">🕒 {saat}</Typography.Text>
                      </div>
                    </div>
                  </Timeline.Item>
                );
              })}
              {sonLoglar.length === 0 && (
                <Typography.Text type="secondary">
                  Henüz bir aktivite bulunmuyor.
                </Typography.Text>
              )}
            </Timeline>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;