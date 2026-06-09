import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, Grid, Card, List } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, UserAddOutlined } from '@ant-design/icons';
import axios from 'axios';

const { useBreakpoint } = Grid;

const Kullanicilar = () => {
  const [kullanicilar, setKullanicilar] = useState([]);
  const [filtrelenmisKullanicilar, setFiltrelenmisKullanicilar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [modalAcik, setModalAcik] = useState(false);
  const [aramaMetni, setAramaMetni] = useState('');
  const [seciliKullanici, setSeciliKullanici] = useState(null);
  const [form] = Form.useForm();

  const screens = useBreakpoint();
  const isMobile = screens.xs;

  const fetchKullanicilar = async () => {
    try {
      const response = await axios.get('/api/kullanicilar');
      setKullanicilar(response.data);
      setFiltrelenmisKullanicilar(response.data);
      setYukleniyor(false);
    } catch (error) {
      setYukleniyor(false);
    }
  };

  useEffect(() => {
    fetchKullanicilar();
  }, []);

  useEffect(() => {
    if (aramaMetni) {
      const sonuc = kullanicilar.filter(k => 
        k.adSoyad?.toLowerCase().includes(aramaMetni.toLowerCase()) || 
        k.kullaniciAdi?.toLowerCase().includes(aramaMetni.toLowerCase()) ||
        k.rol?.toLowerCase().includes(aramaMetni.toLowerCase())
      );
      setFiltrelenmisKullanicilar(sonuc);
    } else {
      setFiltrelenmisKullanicilar(kullanicilar);
    }
  }, [aramaMetni, kullanicilar]);

  const handleSave = async (degerler) => {
    try {
      const gercekID = seciliKullanici ? (seciliKullanici.kullaniciID || seciliKullanici.kullaniciId || seciliKullanici.id) : 0;
      
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
      setModalAcik(false);
      form.resetFields();
      setSeciliKullanici(null);
      fetchKullanicilar();
    } catch (error) {
      message.error(error.response?.data?.mesaj || "Kayıt işlemi başarısız.");
    }
  };

  const handleDelete = async (kullanici) => {
    const gercekID = kullanici.kullaniciID || kullanici.kullaniciId || kullanici.id;
    try {
      await axios.delete(`/api/kullanicilar/${gercekID}`);
      message.success("Kullanıcı sistemden silindi.");
      fetchKullanicilar();
    } catch (error) {
      message.error("Silme başarısız.");
    }
  };

  const openModal = (kullanici = null) => {
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
    setModalAcik(true);
  };

  const getRoleBadge = (rol) => {
    const kucukRol = rol?.toLowerCase() || '';
    if (kucukRol === 'admin') return <span style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', padding: '4px 10px', borderRadius: 6, fontWeight: 600, fontSize: 12 }}>ADMIN</span>;
    if (kucukRol === 'depo sorumlusu') return <span style={{ backgroundColor: '#F8FAFC', color: '#475569', padding: '4px 10px', borderRadius: 6, fontWeight: 600, fontSize: 12 }}>DEPO SORUMLUSU</span>;
    return <span style={{ backgroundColor: '#F4F4F5', color: '#71717A', padding: '4px 10px', borderRadius: 6, fontWeight: 600, fontSize: 12 }}>İZLEYİCİ</span>;
  };

  const tabloSutunlari = [
    { 
      title: 'İsim Soyisim', 
      dataIndex: 'adSoyad', 
      key: 'adSoyad', 
      render: (text) => <span style={{ fontWeight: 600, color: '#18181B' }}>{text || '-'}</span> 
    },
    { 
      title: 'Kullanıcı Adı', 
      dataIndex: 'kullaniciAdi', 
      key: 'kullaniciAdi', 
      render: (text) => <span style={{ color: '#71717A', fontWeight: 500 }}>@{text}</span> 
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
          <Button type="text" icon={<EditOutlined style={{ color: '#71717A' }} />} onClick={() => openModal(record)} />
          <Popconfirm title="Emin misiniz?" onConfirm={() => handleDelete(record)} okText="Evet" cancelText="Hayır" placement="left">
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const mobilListeRender = (record) => (
    <List.Item style={{ padding: '0 0 16px 0', border: 'none' }}>
      <Card 
        style={{ width: '100%', borderRadius: 8, border: '1px solid #E4E4E7', boxShadow: 'none' }}
        bodyStyle={{ padding: 16 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <span style={{ fontWeight: 600, color: '#18181B', fontSize: 15 }}>{record.adSoyad || record.kullaniciAdi}</span>
          {getRoleBadge(record.rol)}
        </div>

        <div style={{ color: '#71717A', fontSize: 13, marginBottom: 12 }}>
          @{record.kullaniciAdi}
        </div>
        
        <div style={{ borderTop: '1px solid #E4E4E7', margin: '0 0 12px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button size="small" icon={<EditOutlined />} onClick={() => openModal(record)} style={{ borderRadius: 6 }}>Düzenle</Button>
          <Popconfirm title="Silinsin mi?" onConfirm={() => handleDelete(record)} okText="Evet" cancelText="Hayır">
            <Button size="small" danger icon={<DeleteOutlined />} style={{ borderRadius: 6 }}>Sil</Button>
          </Popconfirm>
        </div>
      </Card>
    </List.Item>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#18181B' }}>Kullanıcı Yönetimi</h2>
        <div style={{ display: 'flex', gap: 8, width: isMobile ? '100%' : 'auto' }}>
          <Button type="primary" icon={<UserAddOutlined />} onClick={() => openModal()} style={{ flex: isMobile ? 1 : 'none', borderRadius: 20, background: '#2563EB', fontWeight: 500, height: 40 }}>
            Yeni Kullanıcı Ekle
          </Button>
        </div>
      </div>

      <Card style={{ borderRadius: 8, border: '1px solid #E4E4E7', boxShadow: 'none' }} bodyStyle={{ padding: 16 }}>
        <Input 
          placeholder="İsim, kullanıcı adı veya rol ara..." 
          prefix={<SearchOutlined style={{ color: '#A1A1AA' }} />}
          style={{ width: '100%', borderRadius: 8, height: 40 }}
          allowClear
          onChange={(e) => setAramaMetni(e.target.value)}
        />
      </Card>

      {isMobile ? (
        <List 
          dataSource={filtrelenmisKullanicilar} 
          renderItem={mobilListeRender} 
          loading={yukleniyor} 
          rowKey={(r) => r.kullaniciID || r.id} 
          pagination={{ position: 'bottom', align: 'center', pageSize: 10 }} 
        />
      ) : (
        <Card style={{ borderRadius: 8, border: '1px solid #E4E4E7', boxShadow: 'none' }} bodyStyle={{ padding: 0 }}>
          <Table 
            dataSource={filtrelenmisKullanicilar} 
            columns={tabloSutunlari} 
            rowKey={(r) => r.kullaniciID || r.id} 
            loading={yukleniyor} 
            scroll={{ x: 'max-content' }}
            pagination={{ pageSize: 10, position: ['bottomCenter'] }}
            rowClassName={() => 'custom-row-hover'}
            style={{ background: 'transparent' }}
          />
        </Card>
      )}

      <Modal title={seciliKullanici ? "Kullanıcıyı Düzenle" : "Yeni Kullanıcı Ekle"} open={modalAcik} onOk={() => form.submit()} onCancel={() => { setModalAcik(false); setSeciliKullanici(null); form.resetFields(); }} okText="Kaydet" cancelText="İptal" destroyOnHidden>
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
              <Select.Option value="Depo Sorumlusu">Depo Sorumlusu (Sınırlı Yetki)</Select.Option>
              <Select.Option value="İzleyici">İzleyici (Sadece Okuma)</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label={seciliKullanici ? "Yeni Şifre (Boş bırakılabilir)" : "Şifre"} name="sifre" rules={[{ required: !seciliKullanici, message: 'Şifre zorunlu!' }]}>
            <Input.Password placeholder="Güvenli şifre giriniz" size="large" style={{ borderRadius: 8 }} />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .ant-table-wrapper .ant-table-thead > tr > th { background: #FAFAFA; color: #71717A; font-weight: 600; font-size: 12px; letter-spacing: 0.5px; border-bottom: 1px solid #E4E4E7; }
        .custom-row-hover:hover > td { background: #F4F4F5 !important; }
        .ant-table-wrapper .ant-table-tbody > tr > td { border-bottom: 1px solid #F4F4F5; }
      `}</style>
    </div>
  );
};

export default Kullanicilar;