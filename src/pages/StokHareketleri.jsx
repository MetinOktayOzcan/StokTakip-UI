import React, { useState, useEffect } from 'react';
import { Table, Button, Drawer, Form, Input, InputNumber, Select, message, DatePicker, Space, Grid, Card, List, Typography } from 'antd';
import { SearchOutlined, PlusOutlined, CalendarOutlined, EnvironmentOutlined, DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { jwtDecode } from 'jwt-decode';

const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;
const { Text } = Typography;

const StokHareketleri = () => {
  const [hareketler, setHareketler] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [urunListesi, setUrunListesi] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [drawerAcik, setDrawerAcik] = useState(false);
  const [previewState, setPreviewState] = useState({ seciliUrun: null, miktar: 0, islemTuru: null });

  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [userRole, setUserRole] = useState('');
  
  const [form] = Form.useForm();
  const screens = useBreakpoint();
  const isMobile = screens.xs; 

  const fetchUserRole = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const rol = decoded.role || decoded.Rol || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || '';
        setUserRole(rol.toLowerCase());
      } catch (error) {}
    }
  };

  const fetchHareketler = async () => {
    try {
      const response = await axios.get('/api/stokhareketleri');
      setHareketler(response.data);
      setFilteredData(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const fetchUrunler = async () => {
    try {
      const response = await axios.get('/api/urunler');
      setUrunListesi(response.data);
    } catch (error) {}
  };

  const handleSave = async (values) => {
    try {
      await axios.post('/api/stokhareketleri', values);
      formKapat();
      fetchHareketler();
      fetchUrunler();
      message.success("İşlem başarıyla kaydedildi.");
    } catch (error) {
      message.error(error.response?.data?.mesaj || "Beklenmedik hata oluştu");
    }
  };

  useEffect(() => {
    fetchUserRole();
    fetchHareketler();
    fetchUrunler();
  }, []);

  useEffect(() => {
    let result = hareketler;
    if (searchText) {
      const query = searchText.toLowerCase();
      result = result.filter(u => 
        u.urunAdi?.toLowerCase().includes(query) || 
        u.konum?.toLowerCase().includes(query) ||
        u.aciklama?.toLowerCase().includes(query)
      );
    }
    if (typeFilter) {
      result = result.filter(u => u.islemTuru === typeFilter);
    }
    if (dateRange && dateRange[0] && dateRange[1]) {
      const baslangic = new Date(dateRange[0].format('YYYY-MM-DD')).getTime();
      const bitis = new Date(dateRange[1].format('YYYY-MM-DD')).getTime() + 86399999; 
      result = result.filter(u => {
        const islemZamani = new Date(u.islemTarihi).getTime();
        return islemZamani >= baslangic && islemZamani <= bitis;
      });
    }
    setFilteredData(result);
  }, [searchText, dateRange, typeFilter, hareketler]);

  const handleValuesChange = (changedValues, allValues) => {
    const urun = urunListesi.find(u => (u.urunID || u.urunId) === allValues.urunID);
    setPreviewState({
      seciliUrun: urun || null,
      miktar: allValues.miktar || 0,
      islemTuru: allValues.islemTuru || null
    });
  };

  const formKapat = () => {
    setDrawerAcik(false);
    form.resetFields();
    setPreviewState({ seciliUrun: null, miktar: 0, islemTuru: null });
  };

  const handleExport = () => {
    const formattedData = filteredData.map(h => ({
      'Tarih': new Date(h.islemTarihi).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' }),
      'Ürün Adı': h.urunAdi,
      'İşlem Türü': h.islemTuru === 'Giris' ? 'Giriş' : (h.islemTuru === 'Cikis' ? 'Çıkış' : h.islemTuru),
      'Miktar': h.miktar,
      'Konum': h.konum || 'Belirtilmedi',
      'Açıklama': h.aciklama || '-'
    }));
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Stok_Hareketleri");
    XLSX.writeFile(workbook, "Stok_Hareketleri.xlsx");
  };

  const getTagStyle = (islemTuru) => {
    const islem = islemTuru?.toLowerCase() || '';
    if (islem.includes('giriş') || islem.includes('giris')) return { color: '#059669', bg: '#D1FAE5', label: 'GİRİŞ' };
    if (islem.includes('çıkış') || islem.includes('cikis')) return { color: '#E11D48', bg: '#FEE2E2', label: 'ÇIKIŞ' };
    return { color: 'var(--ant-color-text)', bg: 'var(--ant-color-bg-layout)', label: islem.toUpperCase() };
  };

  const columns = [
    { title: 'Ürün', dataIndex: 'urunAdi', key: 'urunAdi', width: '30%', render: (text) => <span style={{ fontWeight: 600 }}>{text}</span> },
    { 
      title: 'İşlem Detayları', 
      key: 'islemDetayi',
      width: '35%',
      render: (_, record) => {
        const tag = getTagStyle(record.islemTuru);
        const islemZamani = record.islemTarihi ? new Date(record.islemTarihi).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' }) : '-';
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ backgroundColor: tag.bg, color: tag.color, padding: '2px 8px', borderRadius: 4, fontWeight: 600, fontSize: 11 }}>{tag.label}</span>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{record.miktar} Adet</span>
            </div>
            <div style={{ color: 'var(--ant-color-text-secondary)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CalendarOutlined />{islemZamani}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><EnvironmentOutlined />{record.konum || 'Belirtilmedi'}</span>
            </div>
          </div>
        );
      }
    },
    { title: 'Notlar', dataIndex: 'aciklama', key: 'aciklama', width: '35%', render: (text) => <span style={{ color: 'var(--ant-color-text-secondary)', fontSize: 13 }}>{text || '-'}</span> }
  ];

  const renderMobileItem = (record) => {
    const tag = getTagStyle(record.islemTuru);
    const islemZamani = record.islemTarihi ? new Date(record.islemTarihi).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' }) : '-';
    return (
      <List.Item style={{ padding: '0 0 16px 0', border: 'none' }}>
        <Card style={{ width: '100%', borderRadius: 12, border: '1px solid var(--ant-color-border-secondary)', boxShadow: 'none' }} bodyStyle={{ padding: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>{record.urunAdi}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ backgroundColor: tag.bg, color: tag.color, padding: '4px 10px', borderRadius: 6, fontWeight: 600, fontSize: 12 }}>{tag.label}</span>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{record.miktar} Adet</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--ant-color-text-secondary)', fontSize: 13 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CalendarOutlined style={{ fontSize: 14 }} /> {islemZamani}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><EnvironmentOutlined style={{ fontSize: 14 }} /> {record.konum || 'Belirtilmedi'}</span>
          </div>
        </Card>
      </List.Item>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>İşlemler</h2>
          <span style={{ color: 'var(--ant-color-text-secondary)', fontSize: 14 }}>Stok hareketlerini kaydetme ve takip etme</span>
        </div>
        <Space>
          <Button onClick={handleExport} icon={<DownloadOutlined />} style={{ borderRadius: 8, height: 40 }}>Excel İndir</Button>
          {userRole !== 'izleyici' && userRole !== 'i̇zleyici' && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerAcik(true)} style={{ borderRadius: 8, height: 40, background: '#2563EB' }}>
              Yeni İşlem
            </Button>
          )}
        </Space>
      </div>

      <Card style={{ borderRadius: 12, border: '1px solid var(--ant-color-border-secondary)', boxShadow: 'none' }} bodyStyle={{ padding: 16 }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 16, flexWrap: 'wrap' }}>
          <Input placeholder="Öğeleri veya konumları ara..." prefix={<SearchOutlined style={{ color: 'var(--ant-color-text-secondary)' }} />} style={{ width: isMobile ? '100%' : 260, borderRadius: 8 }} allowClear onChange={(e) => setSearchText(e.target.value)} />
          <Select placeholder="İşlem Türü" style={{ width: isMobile ? '100%' : 150 }} allowClear onChange={(value) => setTypeFilter(value)} options={[{ value: 'Giris', label: 'Giriş' }, { value: 'Cikis', label: 'Çıkış' }]} />
          <RangePicker style={{ width: isMobile ? '100%' : 280, flex: isMobile ? 'none' : 1, minWidth: isMobile ? 0 : 250, borderRadius: 8 }} onChange={(dates) => setDateRange(dates)} />
        </div>
      </Card>

      {isMobile ? (
        <List dataSource={filteredData} renderItem={renderMobileItem} loading={loading} rowKey="hareketID" pagination={{ position: 'bottom', align: 'center', pageSize: 10 }} />
      ) : (
        <Card style={{ borderRadius: 12, border: '1px solid var(--ant-color-border-secondary)', boxShadow: 'none' }} bodyStyle={{ padding: 0 }}>
          <Table dataSource={filteredData} columns={columns} rowKey="hareketID" loading={loading} scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, position: ['bottomCenter'] }} rowClassName={() => 'custom-row-hover'} style={{ background: 'transparent' }} />
        </Card>
      )}

      <Drawer
        title="Yeni Stok Hareketi Oluştur"
        width={isMobile ? '100%' : 500}
        onClose={formKapat}
        open={drawerAcik}
        destroyOnClose
        styles={{ body: { paddingBottom: 80 } }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>İşlem Sonrası Stok</Text>
              <Text strong style={{ fontSize: '18px' }}>
                {previewState.seciliUrun ? (
                  previewState.islemTuru === 'Giris' 
                    ? previewState.seciliUrun.stokAdedi + previewState.miktar
                    : Math.max(0, previewState.seciliUrun.stokAdedi - previewState.miktar)
                ) : '0'} Adet
              </Text>
            </div>
            <Space>
              <Button onClick={formKapat} style={{ borderRadius: 8 }}>İptal</Button>
              <Button onClick={() => form.submit()} type="primary" style={{ background: '#18181B', borderRadius: 8, padding: '0 24px' }}>
                İşlemi Onayla
              </Button>
            </Space>
          </div>
        }
      >
        <Form form={form} layout="vertical" onValuesChange={handleValuesChange} onFinish={handleSave}>
          <Form.Item label="Ürün Seç" name="urunID" rules={[{ required: true, message: 'Ürün seçimi zorunlu!' }]}>
            <Select showSearch placeholder="Ürün ara veya seç..." optionFilterProp="label" size="large" style={{ borderRadius: 8 }} options={urunListesi.map((urun) => ({ value: urun.urunID || urun.urunId, label: urun.urunAdi }))} />
          </Form.Item>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item label="İşlem Türü" name="islemTuru" style={{ flex: 1 }} rules={[{ required: true, message: 'İşlem türü seçin!' }]}>
              <Select placeholder="Seçiniz..." size="large" style={{ borderRadius: 8 }}>
                <Select.Option value="Giris">Stok Girişi (+)</Select.Option>
                <Select.Option value="Cikis">Stok Çıkışı (-)</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Miktar" name="miktar" style={{ flex: 1 }} rules={[{ required: true, message: 'Miktar girin!' }]}>
              <InputNumber style={{ width: '100%', borderRadius: 8 }} min={1} size="large" />
            </Form.Item>
          </div>

          <Form.Item label="Konum / Depo" name="konum" rules={[{ required: true, message: 'Konum belirtmek zorunlu!' }]}>
            <Input placeholder="Örn: Merkez Depo - Raf A5" size="large" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item label="Açıklama" name="aciklama">
            <Input.TextArea rows={3} placeholder="İşlem detaylarını girin (İsteğe bağlı)..." style={{ borderRadius: 8 }} />
          </Form.Item>
        </Form>

        <div style={{ background: 'var(--ant-color-bg-layout)', padding: '16px', borderRadius: '12px', marginTop: '24px', border: '1px dashed var(--ant-color-border-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <Text type="secondary">Mevcut Stok</Text>
            <Text>{previewState.seciliUrun ? previewState.seciliUrun.stokAdedi : '0'} Adet</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px dashed var(--ant-color-border-secondary)', paddingBottom: '12px' }}>
            <Text type="secondary">İşlem Hacmi</Text>
            <Text type={previewState.islemTuru === 'Cikis' ? 'danger' : 'success'}>
              {previewState.islemTuru === 'Cikis' ? '-' : (previewState.islemTuru === 'Giris' ? '+' : '')}
              {previewState.miktar || 0} Adet
            </Text>
          </div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            * Çıkış işlemlerinde stok miktarının sıfırın altına düşmesine izin verilmez.
          </Text>
        </div>
      </Drawer>

      <style>{`
        .ant-table-wrapper .ant-table-thead > tr > th { background: var(--ant-color-bg-container); color: var(--ant-color-text-secondary); font-weight: 600; font-size: 12px; border-bottom: 1px solid var(--ant-color-border-secondary); }
        .custom-row-hover:hover > td { background: var(--ant-color-bg-text-hover) !important; }
        .ant-table-wrapper .ant-table-tbody > tr > td { border-bottom: 1px solid var(--ant-color-border-secondary); }
      `}</style>
    </div>
  );
};

export default StokHareketleri;