import React, { useState, useEffect } from 'react';
import { Table, Button, Drawer, Form, Input, InputNumber, Space, message, Popconfirm, Select, Grid, Card, Tag, Typography, Pagination } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined, DownloadOutlined, EnvironmentOutlined, EyeOutlined, ClockCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import * as XLSX from 'xlsx';

const { useBreakpoint } = Grid;
const { Text, Title } = Typography;

const getId = (item) => item?.urunID || item?.urunId;
const getKatId = (item) => item?.kategoriID || item?.kategoriId;

const Urunler = () => {
  const [urunler, setUrunler] = useState([]);
  const [filteredUrunler, setFilteredUrunler] = useState([]);
  const [kategoriler, setKategoriler] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [drawerAcik, setDrawerAcik] = useState(false);
  const [drawerMod, setDrawerMod] = useState('form'); 
  const [seciliUrun, setSeciliUrun] = useState(null);
  const [urunHistory, setUrunHistory] = useState([]);

  const [searchText, setSearchText] = useState('');
  const [userRole, setUserRole] = useState('');
  const [mobilSayfa, setMobilSayfa] = useState(1);
  const [form] = Form.useForm();

  const screens = useBreakpoint();
  const isMobile = screens.xs; 

  const checkUserRole = () => {
    const info = localStorage.getItem('userInfo');
    if (info) {
      try {
        const parsed = JSON.parse(info);
        const rol = parsed.rol || 'izleyici';
        setUserRole(rol.toLowerCase());
      } catch {
        setUserRole('izleyici');
      }
    }
  };

  const fetchUrunler = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/urunler');
      setUrunler(response.data);
      setFilteredUrunler(response.data);
    } catch {
      message.error("Ürünler çekilirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const fetchKategoriler = async () => {
    try {
      const response = await axios.get('/api/kategoriler');
      if (response.data) {
        setKategoriler(response.data);
      }
    } catch {}
  };

  useEffect(() => {
    checkUserRole();
    fetchUrunler();
    fetchKategoriler();
  }, []);

  useEffect(() => {
    if (searchText) {
      const query = searchText.toLowerCase();
      const sonuc = urunler.filter(u => 
        u.urunAdi?.toLowerCase().includes(query) || 
        u.kategoriAdi?.toLowerCase().includes(query) ||
        u.konum?.toLowerCase().includes(query)
      );
      setFilteredUrunler(sonuc);
    } else {
      setFilteredUrunler(urunler);
    }
    setMobilSayfa(1);
  }, [searchText, urunler]);

  const handleSave = async (values) => {
    try {
      const productId = seciliUrun ? getId(seciliUrun) : 0;
      
      const payload = {
        urunAdi: values.urunAdi,
        birimFiyati: values.birimFiyati,
        kategoriID: values.kategoriID,
        konum: values.konum
      };

      if (seciliUrun) {
        await axios.put(`/api/urunler/${productId}`, payload);
        message.success("Ürün güncellendi.");
      } else {
        payload.stokAdedi = values.stokAdedi;
        await axios.post('/api/urunler', payload);
        message.success("Ürün eklendi.");
      }
      closeDrawer();
      fetchUrunler();
    } catch {
      message.error("Kayıt başarısız oldu. Lütfen verileri kontrol edin.");
    }
  };

  const handleDelete = async (urun) => {
    try {
      await axios.delete(`/api/urunler/${getId(urun)}`);
      message.success("Ürün silindi.");
      fetchUrunler();
    } catch {
      message.error("Silme işlemi başarısız. Ürüne ait stok hareketi olabilir.");
    }
  };

  const openUrunDetay = async (urun) => {
    setSeciliUrun(urun);
    setDrawerMod('detay');
    setDrawerAcik(true);
    
    try {
      const response = await axios.get(`/api/stokhareketleri/urun/${getId(urun)}`);
      setUrunHistory(response.data);
    } catch {
      setUrunHistory([]);
    }
  };

  const openForm = (urun = null) => {
    setSeciliUrun(urun);
    setDrawerMod('form');
    if (urun) {
      let gecerliKategoriID = getKatId(urun);
      if (!gecerliKategoriID || gecerliKategoriID === 0) {
        const foundCategory = kategoriler.find(k => k.kategoriAdi === urun.kategoriAdi);
        gecerliKategoriID = foundCategory ? getKatId(foundCategory) : undefined;
      }
      form.setFieldsValue({
        urunAdi: urun.urunAdi,
        birimFiyati: urun.birimFiyati,
        stokAdedi: urun.stokAdedi,
        kategoriID: gecerliKategoriID,
        konum: urun.konum
      });
    } else {
      form.resetFields();
    }
    setDrawerAcik(true);
  };

  const closeDrawer = () => {
    setDrawerAcik(false);
    setSeciliUrun(null);
    setUrunHistory([]);
    form.resetFields();
  };

  const handleExport = () => {
    const sanitizeExcel = (text) => {
      if (typeof text === 'string' && /^[=+\-@]/.test(text)) {
        return "'" + text;
      }
      return text;
    };

    const formattedData = filteredUrunler.map(u => ({
      'Ürün Adı': sanitizeExcel(u.urunAdi),
      'Kategori': sanitizeExcel(u.kategoriAdi) || 'Yok',
      'Konum': sanitizeExcel(u.konum) || '-',
      'Fiyat (TL)': u.birimFiyati,
      'Stok Miktarı': u.stokAdedi
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Urunler");
    XLSX.writeFile(workbook, "Urun_Listesi.xlsx");
  };

  let columns = [
    { title: 'Ürün Adı', dataIndex: 'urunAdi', key: 'urunAdi', render: (text) => <span style={{ fontWeight: 500, color: 'var(--ant-color-text)' }}>{text}</span> },
    { title: 'Kategori', dataIndex: 'kategoriAdi', key: 'kategoriAdi', render: (text) => <Tag color="blue" variant="borderless">{text || 'Kategori Yok'}</Tag> },
    { title: 'Konum', dataIndex: 'konum', key: 'konum', render: (text) => <span style={{ color: 'var(--ant-color-text-secondary)' }}>{text || '-'}</span> },
    { title: 'Fiyat', dataIndex: 'birimFiyati', key: 'birimFiyati', render: (text) => <span style={{ fontWeight: 500, color: '#36b37e' }}>{text} TL</span> },
    { title: 'Stok', dataIndex: 'stokAdedi', key: 'stokAdedi', render: (text) => <span style={{ fontWeight: 500, color: 'var(--ant-color-text)' }}>{text} Adet</span> }
  ];

  if (userRole !== 'izleyici' && userRole !== 'i̇zleyici') {
    columns.push({
      title: 'İşlemler',
      key: 'islemler',
      width: '15%',
      align: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" icon={<EyeOutlined style={{ color: 'var(--ant-color-text-secondary)', fontSize: '16px' }} />} onClick={() => openUrunDetay(record)} />
          <Button type="text" icon={<EditOutlined style={{ color: '#1890ff', fontSize: '16px' }} />} onClick={() => openForm(record)} />
          <Popconfirm title="Emin misiniz?" onConfirm={() => handleDelete(record)} okText="Evet" cancelText="Hayır" placement="left">
            <Button type="text" danger icon={<DeleteOutlined style={{ fontSize: '16px' }} />} />
          </Popconfirm>
        </Space>
      )
    });
  }

  const renderMobileItem = (record) => (
    <Card 
      key={getId(record)}
      style={{ width: '100%', borderRadius: 12, border: '1px solid var(--ant-color-border-secondary)', boxShadow: 'none' }}
      styles={{ body: { padding: 16 } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--ant-color-text)', paddingRight: '8px', cursor: 'pointer' }} onClick={() => openUrunDetay(record)}>{record.urunAdi}</div>
        <Tag color="blue" variant="borderless" style={{ margin: 0, whiteSpace: 'nowrap' }}>
          {record.kategoriAdi || 'Kategori Yok'}
        </Tag>
      </div>
      
      <div style={{ color: 'var(--ant-color-text-secondary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
        <EnvironmentOutlined />
        {record.konum || 'Konum Belirtilmedi'}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ color: 'var(--ant-color-text-secondary)', fontSize: '13px' }}>
          Stok: <span style={{ fontWeight: 600, color: 'var(--ant-color-text)' }}>{record.stokAdedi} Adet</span>
        </div>
        <div style={{ fontWeight: 600, fontSize: '15px', color: '#36b37e' }}>
          {record.birimFiyati} TL
        </div>
      </div>

      {userRole !== 'izleyici' && userRole !== 'i̇zleyici' && (
        <>
          <div style={{ borderTop: '1px solid var(--ant-color-border-secondary)', margin: '16px 0 12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button size="small" icon={<EyeOutlined />} onClick={() => openUrunDetay(record)} style={{ borderRadius: 6 }}>
              Detay
            </Button>
            <Button size="small" icon={<EditOutlined style={{ color: '#1890ff' }} />} onClick={() => openForm(record)} style={{ borderRadius: 6 }}>
              Düzenle
            </Button>
            <Popconfirm title="Emin misiniz?" onConfirm={() => handleDelete(record)} okText="Evet" cancelText="Hayır">
              <Button size="small" danger icon={<DeleteOutlined />} style={{ borderRadius: 6 }}>
                Sil
              </Button>
            </Popconfirm>
          </div>
        </>
      )}
    </Card>
  );

  const sayfaVerisi = filteredUrunler.slice((mobilSayfa - 1) * 10, mobilSayfa * 10);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: 'var(--ant-color-text)' }}>Ürün Listesi</h2>
          <span style={{ color: 'var(--ant-color-text-secondary)', fontSize: 14 }}>Depodaki tüm ürünleri ve detaylarını yönetin</span>
        </div>
        <Space style={{ width: isMobile ? '100%' : 'auto', display: 'flex', justifyContent: isMobile ? 'flex-end' : 'flex-start' }}>
          <Button onClick={handleExport} icon={<DownloadOutlined />} style={{ borderRadius: 8, borderColor: 'var(--ant-color-border-secondary)', color: 'var(--ant-color-text)', fontWeight: 500, height: 40 }}>
            Excel İndir
          </Button>
          {userRole !== 'izleyici' && userRole !== 'i̇zleyici' && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openForm()} style={{ borderRadius: 8, background: '#2563EB', fontWeight: 500, height: 40 }}>
              Yeni Ürün Ekle
            </Button>
          )}
        </Space>
      </div>

      <Card style={{ borderRadius: 12, border: '1px solid var(--ant-color-border-secondary)', boxShadow: 'none' }} styles={{ body: { padding: 16 } }}>
        <Input 
          placeholder="Ürün adı, kategori veya konum ara..." 
          prefix={<SearchOutlined style={{ color: 'var(--ant-color-text-secondary)' }} />}
          style={{ width: isMobile ? '100%' : 400, height: 40, borderRadius: 8 }}
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
        />
      </Card>

      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!loading && sayfaVerisi.map(renderMobileItem)}
          {!loading && filteredUrunler.length > 0 && (
            <Pagination 
              current={mobilSayfa} 
              total={filteredUrunler.length} 
              pageSize={10} 
              onChange={setMobilSayfa} 
              align="center" 
              size="small"
            />
          )}
        </div>
      ) : (
        <Card style={{ borderRadius: 12, border: '1px solid var(--ant-color-border-secondary)', boxShadow: 'none' }} styles={{ body: { padding: 0 } }}>
          <Table 
            dataSource={filteredUrunler} 
            columns={columns} 
            rowKey={getId} 
            loading={loading}
            scroll={{ x: 'max-content' }}
            pagination={{ placement: ['bottomCenter'], pageSize: 10 }}
            rowClassName={() => 'custom-row-hover'}
            style={{ background: 'transparent' }}
          />
        </Card>
      )}

      <Drawer
        title={drawerMod === 'detay' ? "Ürün Detayları ve Geçmişi" : (seciliUrun ? "Ürünü Düzenle" : "Yeni Ürün Ekle")}
        size="default"
        onClose={closeDrawer}
        open={drawerAcik}
        destroyOnClose
        styles={{ body: { paddingBottom: 80 } }}
        footer={
          drawerMod === 'form' ? (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button onClick={closeDrawer} style={{ borderRadius: 8 }}>İptal</Button>
              <Button onClick={() => form.submit()} type="primary" style={{ background: 'var(--ant-color-text)', color: 'var(--ant-color-bg-container)', borderRadius: 8, padding: '0 24px' }}>
                {seciliUrun ? "Değişiklikleri Kaydet" : "Ürünü Ekle"}
              </Button>
            </div>
          ) : null
        }
      >
        {drawerMod === 'form' ? (
          <Form form={form} layout="vertical" onFinish={handleSave}>
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
                  value: getKatId(kat),
                  label: kat.kategoriAdi,
                }))}
              />
            </Form.Item>

            <Form.Item label="Konum / Raf" name="konum">
              <Input placeholder="Örn: Merkez Depo - Raf A5" size="large" style={{ borderRadius: 8 }} />
            </Form.Item>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <Form.Item label="Birim Fiyat (TL)" name="birimFiyati" style={{ flex: 1 }} rules={[{ required: true, message: 'Fiyat zorunlu!' }]}>
                <InputNumber style={{ width: '100%', borderRadius: 8 }} size="large" min={0} step={0.01} />
              </Form.Item>

              <Form.Item label="Stok Miktarı" name="stokAdedi" style={{ flex: 1 }} rules={[{ required: !seciliUrun, message: 'Stok miktarı zorunlu!' }]}>
                <InputNumber style={{ width: '100%', borderRadius: 8 }} size="large" min={0} disabled={!!seciliUrun} />
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
                    <Text strong style={{ color: 'var(--ant-color-text)' }}>{seciliUrun.stokAdedi} Adet</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Birim Fiyat</Text>
                    <Text strong style={{ color: '#36b37e' }}>{seciliUrun.birimFiyati} TL</Text>
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
              {urunHistory.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {urunHistory.map((hareket, idx) => {
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