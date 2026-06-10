import React, { useState, useEffect } from 'react';
import { Table, Button, Drawer, Form, Input, InputNumber, Space, message, Popconfirm, Select, Grid, List, Card, Tag, Typography } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined, DownloadOutlined, EnvironmentOutlined, EyeOutlined, ClockCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { jwtDecode } from 'jwt-decode';

const { useBreakpoint } = Grid;
const { Text, Title } = Typography;

const Urunler = () => {
  const [urunler, setUrunler] = useState([]);
  const [filtrelenmisUrunler, setFiltrelenmisUrunler] = useState([]);
  const [kategoriler, setKategoriler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  
  const [drawerAcik, setDrawerAcik] = useState(false);
  const [drawerMod, setDrawerMod] = useState('form'); 
  const [seciliUrun, setSeciliUrun] = useState(null);
  const [seciliUrunGecmisi, setSeciliUrunGecmisi] = useState([]);

  const [aramaMetni, setAramaMetni] = useState('');
  const [kullaniciRolu, setKullaniciRolu] = useState('');
  const [form] = Form.useForm();

  const screens = useBreakpoint();
  const isMobile = screens.xs; 

  const rolCek = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const rol = decoded.role || decoded.Rol || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || '';
        setKullaniciRolu(rol.toLowerCase());
      } catch (error) {}
    }
  };

  const fetchUrunler = async () => {
    try {
      const response = await axios.get('/api/urunler');
      setUrunler(response.data);
      setFiltrelenmisUrunler(response.data);
      setYukleniyor(false);
    } catch (error) {
      setYukleniyor(false);
      message.error("Ürünler çekilirken hata oluştu.");
    }
  };

  const fetchKategoriler = async () => {
    try {
      const response = await axios.get('/api/kategoriler');
      if (response.data) {
        setKategoriler(response.data);
      }
    } catch (error) {}
  };

  useEffect(() => {
    rolCek();
    fetchUrunler();
    fetchKategoriler();
  }, []);

  useEffect(() => {
    if (aramaMetni) {
      const sonuc = urunler.filter(u => 
        u.urunAdi?.toLowerCase().includes(aramaMetni.toLowerCase()) || 
        u.kategoriAdi?.toLowerCase().includes(aramaMetni.toLowerCase()) ||
        u.konum?.toLowerCase().includes(aramaMetni.toLowerCase())
      );
      setFiltrelenmisUrunler(sonuc);
    } else {
      setFiltrelenmisUrunler(urunler);
    }
  }, [aramaMetni, urunler]);

  const islemKaydet = async (degerler) => {
    try {
      const gercekUrunID = seciliUrun ? (seciliUrun.urunID || seciliUrun.urunId) : 0;
      
      const payload = {
        urunID: gercekUrunID,
        urunAdi: degerler.urunAdi,
        birimFiyat: degerler.birimFiyat,
        stokMiktari: degerler.stokMiktari,
        kategoriID: degerler.kategoriID,
        konum: degerler.konum
      };

      if (seciliUrun) {
        await axios.put(`/api/urunler/${gercekUrunID}`, payload);
        message.success("Ürün güncellendi.");
      } else {
        await axios.post('/api/urunler', payload);
        message.success("Ürün eklendi.");
      }
      cekmecesiKapat();
      fetchUrunler();
    } catch (error) {
      message.error("Kayıt başarısız oldu. Lütfen verileri kontrol edin.");
    }
  };

  const urunSil = async (urun) => {
    const gercekUrunID = urun.urunID || urun.urunId;
    try {
      await axios.delete(`/api/urunler/${gercekUrunID}`);
      message.success("Ürün silindi.");
      fetchUrunler();
    } catch (error) {
      message.error("Silme işlemi başarısız. Ürüne ait stok hareketi olabilir.");
    }
  };

  const urunDetayAc = async (urun) => {
    setSeciliUrun(urun);
    setDrawerMod('detay');
    setDrawerAcik(true);
    
    try {
      const response = await axios.get('/api/stokhareketleri');
      const gercekUrunID = urun.urunID || urun.urunId;
      const urunHareketleri = response.data.filter(h => h.urunID === gercekUrunID || h.urunId === gercekUrunID);
      setSeciliUrunGecmisi(urunHareketleri);
    } catch (error) {
      setSeciliUrunGecmisi([]);
    }
  };

  const formCekmecesiAc = (urun = null) => {
    setSeciliUrun(urun);
    setDrawerMod('form');
    if (urun) {
      let gecerliKategoriID = urun.kategoriID || urun.kategoriId;
      if (!gecerliKategoriID || gecerliKategoriID === 0) {
        const bulunanKategori = kategoriler.find(k => k.kategoriAdi === urun.kategoriAdi);
        gecerliKategoriID = bulunanKategori ? (bulunanKategori.kategoriID || bulunanKategori.kategoriId) : undefined;
      }
      form.setFieldsValue({
        urunAdi: urun.urunAdi,
        birimFiyat: urun.birimFiyat,
        stokMiktari: urun.stokMiktari,
        kategoriID: gecerliKategoriID,
        konum: urun.konum
      });
    } else {
      form.resetFields();
    }
    setDrawerAcik(true);
  };

  const cekmecesiKapat = () => {
    setDrawerAcik(false);
    setSeciliUrun(null);
    setSeciliUrunGecmisi([]);
    form.resetFields();
  };

  const excelIndir = () => {
    const formatliVeri = filtrelenmisUrunler.map(u => ({
      'Ürün Adı': u.urunAdi,
      'Kategori': u.kategoriAdi || 'Yok',
      'Konum': u.konum || '-',
      'Fiyat (TL)': u.birimFiyat,
      'Stok Miktarı': u.stokMiktari
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(formatliVeri);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Urunler");
    XLSX.writeFile(workbook, "Urun_Listesi.xlsx");
  };

  let tabloSutunlari = [
    { title: 'Ürün Adı', dataIndex: 'urunAdi', key: 'urunAdi', render: (text) => <span style={{ fontWeight: 500, color: 'var(--ant-color-text)' }}>{text}</span> },
    { title: 'Kategori', dataIndex: 'kategoriAdi', key: 'kategoriAdi', render: (text) => <Tag color="blue" bordered={false}>{text || 'Kategori Yok'}</Tag> },
    { title: 'Konum', dataIndex: 'konum', key: 'konum', render: (text) => <span style={{ color: 'var(--ant-color-text-secondary)' }}>{text || '-'}</span> },
    { title: 'Fiyat', dataIndex: 'birimFiyat', key: 'birimFiyat', render: (text) => <span style={{ fontWeight: 500, color: '#36b37e' }}>{text} TL</span> },
    { title: 'Stok', dataIndex: 'stokMiktari', key: 'stokMiktari', render: (text) => <span style={{ fontWeight: 500, color: 'var(--ant-color-text)' }}>{text} Adet</span> }
  ];

  if (kullaniciRolu !== 'izleyici' && kullaniciRolu !== 'i̇zleyici') {
    tabloSutunlari.push({
      title: 'İşlemler',
      key: 'islemler',
      width: '15%',
      align: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" icon={<EyeOutlined style={{ color: 'var(--ant-color-text-secondary)', fontSize: '16px' }} />} onClick={() => urunDetayAc(record)} />
          <Button type="text" icon={<EditOutlined style={{ color: '#1890ff', fontSize: '16px' }} />} onClick={() => formCekmecesiAc(record)} />
          <Popconfirm title="Emin misiniz?" onConfirm={() => urunSil(record)} okText="Evet" cancelText="Hayır" placement="left">
            <Button type="text" danger icon={<DeleteOutlined style={{ fontSize: '16px' }} />} />
          </Popconfirm>
        </Space>
      )
    });
  }

  const mobilListeRender = (record) => (
    <List.Item style={{ padding: '0 0 16px 0', border: 'none' }}>
      <Card 
        style={{ width: '100%', borderRadius: 12, border: '1px solid var(--ant-color-border-secondary)', boxShadow: 'none' }}
        bodyStyle={{ padding: 16 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--ant-color-text)', paddingRight: '8px', cursor: 'pointer' }} onClick={() => urunDetayAc(record)}>{record.urunAdi}</div>
          <Tag color="blue" bordered={false} style={{ margin: 0, whiteSpace: 'nowrap' }}>
            {record.kategoriAdi || 'Kategori Yok'}
          </Tag>
        </div>
        
        <div style={{ color: 'var(--ant-color-text-secondary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
          <EnvironmentOutlined />
          {record.konum || 'Konum Belirtilmedi'}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ color: 'var(--ant-color-text-secondary)', fontSize: '13px' }}>
            Stok: <span style={{ fontWeight: 600, color: 'var(--ant-color-text)' }}>{record.stokMiktari} Adet</span>
          </div>
          <div style={{ fontWeight: 600, fontSize: '15px', color: '#36b37e' }}>
            {record.birimFiyat} TL
          </div>
        </div>

        {kullaniciRolu !== 'izleyici' && kullaniciRolu !== 'i̇zleyici' && (
          <>
            <div style={{ borderTop: '1px solid var(--ant-color-border-secondary)', margin: '16px 0 12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button size="small" icon={<EyeOutlined />} onClick={() => urunDetayAc(record)} style={{ borderRadius: 6 }}>
                Detay
              </Button>
              <Button size="small" icon={<EditOutlined style={{ color: '#1890ff' }} />} onClick={() => formCekmecesiAc(record)} style={{ borderRadius: 6 }}>
                Düzenle
              </Button>
              <Popconfirm title="Emin misiniz?" onConfirm={() => urunSil(record)} okText="Evet" cancelText="Hayır">
                <Button size="small" danger icon={<DeleteOutlined />} style={{ borderRadius: 6 }}>
                  Sil
                </Button>
              </Popconfirm>
            </div>
          </>
        )}
      </Card>
    </List.Item>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: 'var(--ant-color-text)' }}>Ürün Listesi</h2>
          <span style={{ color: 'var(--ant-color-text-secondary)', fontSize: 14 }}>Depodaki tüm ürünleri ve detaylarını yönetin</span>
        </div>
        <Space style={{ width: isMobile ? '100%' : 'auto', display: 'flex', justifyContent: isMobile ? 'flex-end' : 'flex-start' }}>
          <Button onClick={excelIndir} icon={<DownloadOutlined />} style={{ borderRadius: 8, borderColor: 'var(--ant-color-border-secondary)', color: 'var(--ant-color-text)', fontWeight: 500, height: 40 }}>
            Excel İndir
          </Button>
          {kullaniciRolu !== 'izleyici' && kullaniciRolu !== 'i̇zleyici' && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => formCekmecesiAc()} style={{ borderRadius: 8, background: '#2563EB', fontWeight: 500, height: 40 }}>
              Yeni Ürün Ekle
            </Button>
          )}
        </Space>
      </div>

      <Card style={{ borderRadius: 12, border: '1px solid var(--ant-color-border-secondary)', boxShadow: 'none' }} bodyStyle={{ padding: 16 }}>
        <Input 
          placeholder="Ürün adı, kategori veya konum ara..." 
          prefix={<SearchOutlined style={{ color: 'var(--ant-color-text-secondary)' }} />}
          style={{ width: isMobile ? '100%' : 400, height: 40, borderRadius: 8 }}
          allowClear
          onChange={(e) => setAramaMetni(e.target.value)}
        />
      </Card>

      {isMobile ? (
        <List
          dataSource={filtrelenmisUrunler}
          renderItem={mobilListeRender}
          loading={yukleniyor}
          rowKey={(record) => record.urunID || record.urunId}
          pagination={{ position: 'bottom', align: 'center', pageSize: 10 }}
        />
      ) : (
        <Card style={{ borderRadius: 12, border: '1px solid var(--ant-color-border-secondary)', boxShadow: 'none' }} bodyStyle={{ padding: 0 }}>
          <Table 
            dataSource={filtrelenmisUrunler} 
            columns={tabloSutunlari} 
            rowKey={(record) => record.urunID || record.urunId} 
            loading={yukleniyor}
            scroll={{ x: 'max-content' }}
            pagination={{ pageSize: 10, position: ['bottomCenter'] }}
            rowClassName={() => 'custom-row-hover'}
            style={{ background: 'transparent' }}
          />
        </Card>
      )}

      <Drawer
        title={drawerMod === 'detay' ? "Ürün Detayları ve Geçmişi" : (seciliUrun ? "Ürünü Düzenle" : "Yeni Ürün Ekle")}
        width={isMobile ? '100%' : 500}
        onClose={cekmecesiKapat}
        open={drawerAcik}
        destroyOnClose
        styles={{ body: { paddingBottom: 80 } }}
        footer={
          drawerMod === 'form' ? (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button onClick={cekmecesiKapat} style={{ borderRadius: 8 }}>İptal</Button>
              <Button onClick={() => form.submit()} type="primary" style={{ background: 'var(--ant-color-text)', color: 'var(--ant-color-bg-container)', borderRadius: 8, padding: '0 24px' }}>
                {seciliUrun ? "Değişiklikleri Kaydet" : "Ürünü Ekle"}
              </Button>
            </div>
          ) : null
        }
      >
        {drawerMod === 'form' ? (
          <Form form={form} layout="vertical" onFinish={islemKaydet}>
            <Form.Item label="Ürün Adı" name="urunAdi" rules={[{ required: true, message: 'Ürün adı zorunlu!' }]}>
              <Input placeholder="Ürün adını girin..." size="large" style={{ borderRadius: 8 }} />
            </Form.Item>
            
            <Form.Item label="Kategori Seç" name="kategoriID" rules={[{ required: true, message: 'Kategori seçimi zorunlu!' }]}>
              <Select
                showSearch
                placeholder="Kategori ara veya seç..."
                optionFilterProp="label"
                size="large" 
                style={{ borderRadius: 8 }}
                options={kategoriler.map((kat) => ({
                  value: kat.kategoriID || kat.kategoriId,
                  label: kat.kategoriAdi,
                }))}
              />
            </Form.Item>

            <Form.Item label="Konum / Raf" name="konum">
              <Input placeholder="Örn: Merkez Depo - Raf A5" size="large" style={{ borderRadius: 8 }} />
            </Form.Item>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <Form.Item label="Birim Fiyat (TL)" name="birimFiyat" style={{ flex: 1 }} rules={[{ required: true, message: 'Fiyat zorunlu!' }]}>
                <InputNumber style={{ width: '100%', borderRadius: 8 }} size="large" min={0} step={0.01} />
              </Form.Item>

              <Form.Item label="Stok Miktarı" name="stokMiktari" style={{ flex: 1 }} rules={[{ required: true, message: 'Stok miktarı zorunlu!' }]}>
                <InputNumber style={{ width: '100%', borderRadius: 8 }} size="large" min={0} />
              </Form.Item>
            </div>
          </Form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {seciliUrun && (
              <div style={{ background: 'var(--ant-color-bg-layout)', padding: '20px', borderRadius: '12px', border: '1px dashed var(--ant-color-border-secondary)' }}>
                <Title level={4} style={{ margin: '0 0 16px 0', color: 'var(--ant-color-text)' }}>{seciliUrun.urunAdi}</Title>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Kategori</Text>
                    <Text strong style={{ color: 'var(--ant-color-text)' }}>{seciliUrun.kategoriAdi}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Mevcut Stok</Text>
                    <Text strong style={{ color: 'var(--ant-color-text)' }}>{seciliUrun.stokMiktari} Adet</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Birim Fiyat</Text>
                    <Text strong style={{ color: '#36b37e' }}>{seciliUrun.birimFiyat} TL</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Konum</Text>
                    <Text strong style={{ color: 'var(--ant-color-text)' }}>{seciliUrun.konum || 'Belirtilmedi'}</Text>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <Title level={5} style={{ marginBottom: '16px', color: 'var(--ant-color-text)' }}>Stok Hareket Geçmişi</Title>
              {seciliUrunGecmisi.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {seciliUrunGecmisi.map((hareket, idx) => {
                    const isGiris = hareket.islemTuru?.toLowerCase().includes('giriş') || hareket.islemTuru?.toLowerCase().includes('giris');
                    return (
                      <div key={idx} style={{ padding: '12px 16px', border: '1px solid var(--ant-color-border-secondary)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: isGiris ? '#059669' : '#E11D48', fontSize: '13px' }}>
                            {hareket.islemTuru?.toUpperCase()}
                          </div>
                          <div style={{ color: 'var(--ant-color-text-secondary)', fontSize: '12px', marginTop: '4px' }}>
                            <ClockCircleOutlined style={{ marginRight: '4px' }} />
                            {new Date(hareket.islemTarihi).toLocaleString('tr-TR')}
                          </div>
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--ant-color-text)' }}>
                          {isGiris ? '+' : '-'}{hareket.miktar}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Text style={{ color: 'var(--ant-color-text-secondary)' }}>Bu ürüne ait henüz stok hareketi bulunmuyor.</Text>
              )}
            </div>
          </div>
        )}
      </Drawer>

      <style>{`
        .ant-table-wrapper .ant-table-thead > tr > th { background: var(--ant-color-bg-layout); color: var(--ant-color-text-secondary); font-weight: 600; font-size: 12px; border-bottom: 1px solid var(--ant-color-border-secondary); }
        .custom-row-hover:hover > td { background: var(--ant-color-bg-text-hover) !important; }
        .ant-table-wrapper .ant-table-tbody > tr > td { border-bottom: 1px solid var(--ant-color-border-secondary); }
      `}</style>
    </div>
  );
};

export default Urunler;