import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, DatePicker, Space, Grid, Card, List } from 'antd';
import { SearchOutlined, PlusOutlined, CalendarOutlined, EnvironmentOutlined, DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { jwtDecode } from 'jwt-decode';

const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;

const StokHareketleri = () => {
  const [hareketler, setHareketler] = useState([]);
  const [filtrelenmisHareketler, setFiltrelenmisHareketler] = useState([]);
  const [urunListesi, setUrunListesi] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [modalAcik, setModalAcik] = useState(false);
  const [aramaMetni, setAramaMetni] = useState('');
  const [tarihAraligi, setTarihAraligi] = useState(null);
  const [islemFiltresi, setIslemFiltresi] = useState(null);
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
      } catch (error) {
      }
    }
  };

  const fetchHareketler = async () => {
    try {
      const response = await axios.get('/api/stokhareketleri');
      setHareketler(response.data);
      setFiltrelenmisHareketler(response.data);
      setYukleniyor(false);
    } catch (error) {
      setYukleniyor(false);
    }
  };

  const fetchUrunler = async () => {
    try {
      const response = await axios.get('/api/urunler');
      setUrunListesi(response.data);
    } catch (error) {
    }
  };

  const handleSave = async (degerler) => {
    try {
      await axios.post('/api/stokhareketleri', degerler);
      setModalAcik(false);
      form.resetFields();
      fetchHareketler();
      message.success("İşlem başarıyla kaydedildi.");
    } catch (error) {
      message.error("Beklenmedik hata oluştu.");
    }
  };

  useEffect(() => {
    rolCek();
    fetchHareketler();
    fetchUrunler();
  }, []);

  useEffect(() => {
    let sonuc = hareketler;

    if (aramaMetni) {
      sonuc = sonuc.filter(u => 
        u.urunAdi?.toLowerCase().includes(aramaMetni.toLowerCase()) || 
        u.konum?.toLowerCase().includes(aramaMetni.toLowerCase()) ||
        u.aciklama?.toLowerCase().includes(aramaMetni.toLowerCase())
      );
    }

    if (islemFiltresi) {
      sonuc = sonuc.filter(u => u.islemTuru === islemFiltresi);
    }

    if (tarihAraligi && tarihAraligi[0] && tarihAraligi[1]) {
      const baslangicTarihi = new Date(tarihAraligi[0].format('YYYY-MM-DD')).getTime();
      const bitisTarihi = new Date(tarihAraligi[1].format('YYYY-MM-DD')).getTime() + 86399999; 
      
      sonuc = sonuc.filter(u => {
        const islemZamani = new Date(u.islemTarihi).getTime();
        return islemZamani >= baslangicTarihi && islemZamani <= bitisTarihi;
      });
    }

    setFiltrelenmisHareketler(sonuc);
  }, [aramaMetni, tarihAraligi, islemFiltresi, hareketler]);

  const handleExport = () => {
    const formatliVeri = filtrelenmisHareketler.map(h => ({
      'Tarih': new Date(h.islemTarihi).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' }),
      'Ürün Adı': h.urunAdi,
      'İşlem Türü': h.islemTuru,
      'Miktar': h.miktar,
      'Konum': h.konum || 'Belirtilmedi',
      'Açıklama': h.aciklama || '-'
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(formatliVeri);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Stok_Hareketleri");
    XLSX.writeFile(workbook, "Stok_Hareketleri.xlsx");
  };

  const getTagStyle = (islemTuru) => {
    const kucuk = islemTuru?.toLowerCase() || '';
    if (kucuk.includes('giriş') || kucuk.includes('giris')) return { color: '#059669', bg: '#D1FAE5' };
    if (kucuk.includes('çıkış') || kucuk.includes('cikis')) return { color: '#E11D48', bg: '#FEE2E2' };
    return { color: 'var(--ant-color-text)', bg: 'var(--ant-color-bg-layout)' };
  };

  const tabloSutunlari = [
    { 
      title: 'Ürün', 
      dataIndex: 'urunAdi', 
      key: 'urunAdi',
      width: '30%',
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>
    },
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
              <span style={{ backgroundColor: tag.bg, color: tag.color, padding: '2px 8px', borderRadius: 4, fontWeight: 600, fontSize: 11 }}>
                {record.islemTuru?.toUpperCase()}
              </span>
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
    { 
      title: 'Notlar', 
      dataIndex: 'aciklama', 
      key: 'aciklama',
      width: '35%',
      render: (text) => <span style={{ color: 'var(--ant-color-text-secondary)', fontSize: 13 }}>{text || '-'}</span>
    }
  ];

  const mobilListeRender = (record) => {
    const tag = getTagStyle(record.islemTuru);
    const islemZamani = record.islemTarihi ? new Date(record.islemTarihi).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' }) : '-';

    return (
      <List.Item style={{ padding: '0 0 16px 0', border: 'none' }}>
        <Card 
          style={{ width: '100%', borderRadius: 12, border: '1px solid var(--ant-color-border-secondary)', boxShadow: 'none' }}
          bodyStyle={{ padding: 16 }}
        >
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>
            {record.urunAdi}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ backgroundColor: tag.bg, color: tag.color, padding: '4px 10px', borderRadius: 6, fontWeight: 600, fontSize: 12 }}>
              {record.islemTuru?.toUpperCase()}
            </span>
            <span style={{ fontWeight: 600, fontSize: 14 }}>
              {record.miktar} Adet
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--ant-color-text-secondary)', fontSize: 13 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CalendarOutlined style={{ fontSize: 14 }} /> {islemZamani}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <EnvironmentOutlined style={{ fontSize: 14 }} /> {record.konum || 'Belirtilmedi'}
            </span>
          </div>

          {record.aciklama && (
            <>
              <div style={{ borderTop: '1px solid var(--ant-color-border-secondary)', margin: '16px 0' }} />
              <div style={{ color: 'var(--ant-color-text-secondary)', fontSize: 13 }}>
                {record.aciklama}
              </div>
            </>
          )}
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
          <Button onClick={handleExport} icon={<DownloadOutlined />} style={{ borderRadius: 8, height: 40 }}>
            Excel İndir
          </Button>
          {kullaniciRolu !== 'izleyici' && kullaniciRolu !== 'i̇zleyici' && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalAcik(true)} style={{ borderRadius: 8, height: 40 }}>
              Yeni İşlem
            </Button>
          )}
        </Space>
      </div>

      <Card style={{ borderRadius: 12, border: '1px solid var(--ant-color-border-secondary)', boxShadow: 'none' }} bodyStyle={{ padding: 16 }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 16, flexWrap: 'wrap' }}>
          <Input 
            placeholder="Öğeleri veya konumları ara..." 
            prefix={<SearchOutlined style={{ color: 'var(--ant-color-text-secondary)' }} />}
            style={{ width: isMobile ? '100%' : 260, borderRadius: 8 }}
            allowClear
            onChange={(e) => setAramaMetni(e.target.value)}
          />
          <Select
            placeholder="İşlem Türü"
            style={{ width: isMobile ? '100%' : 150 }}
            allowClear
            onChange={(value) => setIslemFiltresi(value)}
            options={[
              { value: 'Giriş', label: 'Giriş' },
              { value: 'Çıkış', label: 'Çıkış' }
            ]}
          />
          <RangePicker 
            style={{ width: isMobile ? '100%' : 280, flex: isMobile ? 'none' : 1, minWidth: isMobile ? 0 : 250, borderRadius: 8 }}
            onChange={(dates) => setTarihAraligi(dates)}
          />
        </div>
      </Card>

      {isMobile ? (
        <List
          dataSource={filtrelenmisHareketler}
          renderItem={mobilListeRender}
          loading={yukleniyor}
          rowKey="hareketID"
          pagination={{ position: 'bottom', align: 'center', pageSize: 10 }}
        />
      ) : (
        <Card style={{ borderRadius: 12, border: '1px solid var(--ant-color-border-secondary)', boxShadow: 'none' }} bodyStyle={{ padding: 0 }}>
          <Table 
            dataSource={filtrelenmisHareketler} 
            columns={tabloSutunlari} 
            rowKey="hareketID" 
            loading={yukleniyor} 
            scroll={{ x: 'max-content' }}
            pagination={{ pageSize: 10, position: ['bottomCenter'] }}
            rowClassName={() => 'custom-row-hover'}
            style={{ background: 'transparent' }}
          />
        </Card>
      )}

      <Modal title="Yeni Stok Hareketi" open={modalAcik} onOk={() => form.submit()} onCancel={() => { setModalAcik(false); form.resetFields(); }} okText="Kaydet" cancelText="İptal" destroyOnHidden>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item label="Ürün Seç" name="urunID" rules={[{ required: true, message: 'Ürün seçimi zorunlu!' }]}>
            <Select showSearch placeholder="Ürün ara veya seç..." optionFilterProp="label" size="large" options={urunListesi.map((urun) => ({ value: urun.urunID || urun.urunId, label: urun.urunAdi }))} />
          </Form.Item>
          <Form.Item label="İşlem Türü" name="islemTuru" rules={[{ required: true, message: 'İşlem türü seçin!' }]}>
            <Select placeholder="Seçiniz..." size="large"><Select.Option value="Giriş">Giriş</Select.Option><Select.Option value="Çıkış">Çıkış</Select.Option></Select>
          </Form.Item>
          <Form.Item label="Miktar" name="miktar" rules={[{ required: true, message: 'Miktar girin!' }]}>
            <InputNumber style={{ width: '100%' }} min={1} size="large" />
          </Form.Item>
          <Form.Item label="Konum / Depo" name="konum" rules={[{ required: true, message: 'Konum belirtmek zorunlu!' }]}>
            <Input placeholder="Örn: Merkez Depo - Raf A5" size="large" />
          </Form.Item>
          <Form.Item label="Açıklama" name="aciklama">
            <Input.TextArea rows={3} placeholder="İşlem detaylarını girin..." />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .ant-table-wrapper .ant-table-thead > tr > th { background: var(--ant-color-bg-container); color: var(--ant-color-text-secondary); font-weight: 600; font-size: 12px; border-bottom: 1px solid var(--ant-color-border-secondary); }
        .custom-row-hover:hover > td { background: var(--ant-color-bg-text-hover) !important; }
        .ant-table-wrapper .ant-table-tbody > tr > td { border-bottom: 1px solid var(--ant-color-border-secondary); }
      `}</style>
    </div>
  );
};

export default StokHareketleri;