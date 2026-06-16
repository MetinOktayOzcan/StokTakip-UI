import React, { useState, useEffect } from 'react';
import { Table, Button, Drawer, Form, Input, Select, Space, message, Popconfirm, Grid, Card, Tag, Pagination } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, UserAddOutlined } from '@ant-design/icons';
import axios from 'axios';

const { useBreakpoint } = Grid;

const getId = (kullanici) => kullanici?.kullaniciID || kullanici?.kullaniciId || kullanici?.id;

const Kullanicilar = () => {
  const [kullanicilar, setKullanicilar] = useState([]);
  const [filtrelenmisKullanicilar, setFiltrelenmisKullanicilar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [drawerAcik, setDrawerAcik] = useState(false);
  const [aramaMetni, setAramaMetni] = useState('');
  const [seciliKullanici, setSeciliKullanici] = useState(null);
  const [mobilSayfa, setMobilSayfa] = useState(1);
  const [form] = Form.useForm();

  const screens = useBreakpoint();
  const isMobile = screens.xs;

  const fetchKullanicilar = async () => {
    try {
      setYukleniyor(true);
      const response = await axios.get('/api/kullanicilar');
      setKullanicilar(response.data);
      setFiltrelenmisKullanicilar(response.data);
    } catch {
      message.error("Kullanıcılar yüklenirken bir hata oluştu.");
    } finally {
      setYukleniyor(false);
    }
  };

  useEffect(() => {
    fetchKullanicilar();
  }, []);

  useEffect(() => {
    if (aramaMetni) {
      const aramaKucuk = aramaMetni.toLowerCase();
      const sonuc = kullanicilar.filter(k => 
        k.adSoyad?.toLowerCase().includes(aramaKucuk) || 
        k.kullaniciAdi?.toLowerCase().includes(aramaKucuk) ||
        k.rol?.toLowerCase().includes(aramaKucuk)
      );
      setFiltrelenmisKullanicilar(sonuc);
    } else {
      setFiltrelenmisKullanicilar(kullanicilar);
    }
    setMobilSayfa(1);
  }, [aramaMetni, kullanicilar]);

  const handleSave = async (degerler) => {
    try {
      const gercekID = seciliKullanici ? getId(seciliKullanici) : 0;
      
      const payload = {
        id: gercekID,
        kullaniciAdi: degerler.kullaniciAdi,
        adSoyad: degerler.adSoyad,
        rol: degerler.rol,
        sifre: degerler.sifre || null
      };

      if (seciliKullanici) {
        await axios.put(`/api/kullanicilar/${gercekID}`, payload);
        message.success("Kullanıcı başarıyla güncellendi.");
      } else {
        await axios.post('/api/kullanicilar', payload);
        message.success("Yeni kullanıcı eklendi.");
      }
      formKapat();
      fetchKullanicilar();
    } catch (error) {
      message.error(error.response?.data?.mesaj || "Kayıt işlemi başarısız.");
    }
  };

  const handleDelete = async (kullanici) => {
    try {
      await axios.delete(`/api/kullanicilar/${getId(kullanici)}`);
      message.success("Kullanıcı sistemden silindi.");
      fetchKullanicilar();
    } catch {
      message.error("Silme başarısız.");
    }
  };

  const openDrawer = (kullanici = null) => {
    setSeciliKullanici(kullanici);
    if (kullanici) {
      form.setFieldsValue({
        kullaniciAdi: kullanici.kullaniciAdi,
        adSoyad: kullanici.adSoyad,
        rol: kullanici.rol,
        sifre: ''
      });
    } else {
      form.resetFields();
    }
    setDrawerAcik(true);
  };

  const formKapat = () => {
    setDrawerAcik(false);
    setSeciliKullanici(null);
    form.resetFields();
  };

  const getRoleBadge = (rol) => {
    const kucukRol = rol?.toLowerCase() || '';
    if (kucukRol === 'admin') return <Tag color="blue" variant="filled" style={{ borderRadius: 6, fontWeight: 600 }}>ADMIN</Tag>;
    if (kucukRol === 'depo sorumlusu') return <Tag color="orange" variant="filled" style={{ borderRadius: 6, fontWeight: 600 }}>DEPO SORUMLUSU</Tag>;
    return <Tag color="default" variant="filled" style={{ borderRadius: 6, fontWeight: 600 }}>İZLEYİCİ</Tag>;
  };

  const tabloSutunlari = [
    { 
      title: 'İsim Soyisim', 
      dataIndex: 'adSoyad', 
      key: 'adSoyad', 
      render: (text) => <span style={{ fontWeight: 600, color: 'var(--ant-color-text)' }}>{text || '-'}</span> 
    },
    { 
      title: 'Kullanıcı Adı', 
      dataIndex: 'kullaniciAdi', 
      key: 'kullaniciAdi', 
      render: (text) => <span style={{ color: 'var(--ant-color-text-secondary)', fontWeight: 500 }}>@{text}</span> 
    },
    { 
      title: 'Rol', 
      dataIndex: 'rol', 
      key: 'rol', 
      render: (text) => getRoleBadge(text) 
    },
    {
      title: 'İşlemler',
      key: 'islemler',
      width: '15%',
      align: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined style={{ color: 'var(--ant-color-text-secondary)' }} />} onClick={() => openDrawer(record)} />
          <Popconfirm title="Emin misiniz?" onConfirm={() => handleDelete(record)} okText="Evet" cancelText="Hayır" placement="left">
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const mobilListeRender = (record) => (
    <Card 
      key={getId(record)}
      style={{ width: '100%', borderRadius: 8, border: '1px solid var(--ant-color-border-secondary)', boxShadow: 'none' }}
      styles={{ body: { padding: 16 } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontWeight: 600, color: 'var(--ant-color-text)', fontSize: 15 }}>{record.adSoyad || record.kullaniciAdi}</span>
        {getRoleBadge(record.rol)}
      </div>

      <div style={{ color: 'var(--ant-color-text-secondary)', fontSize: 13, marginBottom: 12 }}>
        @{record.kullaniciAdi}
      </div>
      
      <div style={{ borderTop: '1px solid var(--ant-color-border-secondary)', margin: '0 0 12px 0' }} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Button size="small" icon={<EditOutlined />} onClick={() => openDrawer(record)} style={{ borderRadius: 6 }}>Düzenle</Button>
        <Popconfirm title="Silinsin mi?" onConfirm={() => handleDelete(record)} okText="Evet" cancelText="Hayır">
          <Button size="small" danger icon={<DeleteOutlined />} style={{ borderRadius: 6 }}>Sil</Button>
        </Popconfirm>
      </div>
    </Card>
  );

  const sayfaVerisi = filtrelenmisKullanicilar.slice((mobilSayfa - 1) * 10, mobilSayfa * 10);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--ant-color-text)' }}>Kullanıcı Yönetimi</h2>
        <div style={{ display: 'flex', gap: 8, width: isMobile ? '100%' : 'auto' }}>
          <Button type="primary" icon={<UserAddOutlined />} onClick={() => openDrawer()} style={{ flex: isMobile ? 1 : 'none', borderRadius: 8, background: '#2563EB', fontWeight: 500, height: 40 }}>
            Yeni Kullanıcı Ekle
          </Button>
        </div>
      </div>

      <Card style={{ borderRadius: 8, border: '1px solid var(--ant-color-border-secondary)', boxShadow: 'none' }} styles={{ body: { padding: 16 } }}>
        <Input 
          placeholder="İsim, kullanıcı adı veya rol ara..." 
          prefix={<SearchOutlined style={{ color: 'var(--ant-color-text-secondary)' }} />}
          style={{ width: '100%', borderRadius: 8, height: 40 }}
          allowClear
          onChange={(e) => setAramaMetni(e.target.value)}
        />
      </Card>

      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!yukleniyor && sayfaVerisi.map(mobilListeRender)}
          {!yukleniyor && filtrelenmisKullanicilar.length > 0 && (
            <Pagination 
              current={mobilSayfa} 
              total={filtrelenmisKullanicilar.length} 
              pageSize={10} 
              onChange={setMobilSayfa} 
              align="center" 
              size="small"
            />
          )}
        </div>
      ) : (
        <Card style={{ borderRadius: 8, border: '1px solid var(--ant-color-border-secondary)', boxShadow: 'none' }} styles={{ body: { padding: 0 } }}>
          <Table 
            dataSource={filtrelenmisKullanicilar} 
            columns={tabloSutunlari} 
            rowKey={getId} 
            loading={yukleniyor} 
            scroll={{ x: 'max-content' }}
            pagination={{ placement: ['bottomCenter'], pageSize: 10 }}
            rowClassName={() => 'custom-row-hover'}
            style={{ background: 'transparent' }}
          />
        </Card>
      )}

      <Drawer
        title={seciliKullanici ? "Kullanıcıyı Düzenle" : "Yeni Kullanıcı Ekle"}
        size="default"
        onClose={formKapat}
        open={drawerAcik}
        destroyOnClose
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button onClick={formKapat} style={{ borderRadius: 8 }}>İptal</Button>
            <Button onClick={() => form.submit()} type="primary" style={{ background: 'var(--ant-color-text)', borderRadius: 8 }}>
              {seciliKullanici ? "Değişiklikleri Kaydet" : "Kullanıcı Ekle"}
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item label="Ad Soyad" name="adSoyad" rules={[{ required: true, message: 'Ad Soyad giriniz!' }]}>
            <Input placeholder="Örn: Yaver Polat" size="large" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item label="Kullanıcı Adı" name="kullaniciAdi" rules={[{ required: true, message: 'Kullanıcı adı zorunlu!' }]}>
            <Input placeholder="admin.user" size="large" style={{ borderRadius: 8 }} disabled={!!seciliKullanici} />
          </Form.Item>
          <Form.Item label="Rol / Yetki" name="rol" rules={[{ required: true, message: 'Rol seçimi zorunlu!' }]}>
            <Select placeholder="Sistem yetkisini seçin" size="large" style={{ borderRadius: 8 }}>
              <Select.Option value="Admin">Admin (Tam Yetki)</Select.Option>
              <Select.Option value="Yonetici">Yönetici (Sınırlı Yetki)</Select.Option>
              <Select.Option value="Personel">Personel (Sadece Okuma)</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label={seciliKullanici ? "Yeni Şifre (Boş bırakılabilir)" : "Şifre"} name="sifre" rules={[{ required: !seciliKullanici, message: 'Şifre zorunlu!' }]}>
            <Input.Password placeholder="Güvenli şifre giriniz" size="large" style={{ borderRadius: 8 }} />
          </Form.Item>
        </Form>
      </Drawer>

      <style>{`
        .ant-table-wrapper .ant-table-thead > tr > th { background: var(--ant-color-bg-layout); color: var(--ant-color-text-secondary); font-weight: 600; font-size: 12px; letter-spacing: 0.5px; border-bottom: 1px solid var(--ant-color-border-secondary); }
        .custom-row-hover:hover > td { background: var(--ant-color-bg-text-hover) !important; }
        .ant-table-wrapper .ant-table-tbody > tr > td { border-bottom: 1px solid var(--ant-color-border-secondary); }
      `}</style>
    </div>
  );
};

export default Kullanicilar;