import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, Tag, Grid, List, Card } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, UserAddOutlined, SafetyOutlined } from '@ant-design/icons';
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

  const verileriCek = async () => {
    try {
      const response = await axios.get('/api/kullanicilar');
      setKullanicilar(response.data);
      setFiltrelenmisKullanicilar(response.data);
      setYukleniyor(false);
    } catch (error) {
      setYukleniyor(false);
      message.error("Kullanıcılar yüklenemedi.");
    }
  };

  useEffect(() => {
    verileriCek();
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

  const islemKaydet = async (degerler) => {
    try {
      const gercekID = seciliKullanici ? (seciliKullanici.kullaniciID || seciliKullanici.kullaniciId || seciliKullanici.id) : 0;
      
      const gonderilecekVeri = {
        id: gercekID,
        kullaniciAdi: degerler.kullaniciAdi,
        adSoyad: degerler.adSoyad,
        rol: degerler.rol,
        sifre: degerler.sifre || null
      };

      if (seciliKullanici) {
        await axios.put(`/api/kullanicilar/${gercekID}`, gonderilecekVeri);
        message.success("Kullanıcı güncellendi.");
      } else {
        await axios.post('/api/kullanicilar', gonderilecekVeri);
        message.success("Yeni kullanıcı eklendi.");
      }
      setModalAcik(false);
      form.resetFields();
      setSeciliKullanici(null);
      verileriCek();
    } catch (error) {
      message.error(error.response?.data?.mesaj || "Kayıt işlemi başarısız.");
    }
  };

  const kullaniciSil = async (kullanici) => {
    const gercekID = kullanici.kullaniciID || kullanici.kullaniciId || kullanici.id;
    try {
      await axios.delete(`/api/kullanicilar/${gercekID}`);
      message.success("Kullanıcı sistemden silindi.");
      verileriCek();
    } catch (error) {
      message.error("Silme başarısız.");
    }
  };

  const modalAc = (kullanici = null) => {
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

  const rolRengi = (rol) => {
    const kucukRol = rol?.toLowerCase() || '';
    if (kucukRol === 'admin') return 'red';
    if (kucukRol === 'depo sorumlusu') return 'blue';
    if (kucukRol === 'izleyici') return 'default';
    return 'purple';
  };

  const tabloSutunlari = [
    { title: 'Ad Soyad', dataIndex: 'adSoyad', key: 'adSoyad', render: (text) => <span style={{ fontWeight: 500 }}>{text || '-'}</span> },
    { title: 'Kullanıcı Adı', dataIndex: 'kullaniciAdi', key: 'kullaniciAdi', render: (text) => <span style={{ color: '#8c98a4' }}>@{text}</span> },
    { title: 'Rol Yetkisi', dataIndex: 'rol', key: 'rol', render: (text) => <Tag color={rolRengi(text)} bordered={false}><SafetyOutlined style={{ marginRight: 4 }}/>{text}</Tag> },
    {
      title: 'İşlemler',
      key: 'islemler',
      width: '15%',
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined style={{ color: '#1890ff', fontSize: '16px' }} />} onClick={() => modalAc(record)} />
          <Popconfirm title="Kullanıcıyı silmek istediğinize emin misiniz?" onConfirm={() => kullaniciSil(record)} okText="Evet" cancelText="Hayır" placement="left">
            <Button type="text" danger icon={<DeleteOutlined style={{ fontSize: '16px' }} />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const mobilListeRender = (record) => (
    <List.Item style={{ padding: '0 0 16px 0', border: 'none' }}>
      <Card size="small" style={{ width: '100%', borderRadius: 8, border: '1px solid var(--ant-color-border-secondary)', background: 'var(--ant-color-bg-container)' }} bodyStyle={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ fontWeight: 600, fontSize: '15px' }}>{record.adSoyad || record.kullaniciAdi}</div>
          <Tag color={rolRengi(record.rol)} bordered={false} style={{ margin: 0 }}><SafetyOutlined style={{ marginRight: 4 }}/>{record.rol}</Tag>
        </div>
        <div style={{ color: '#8c98a4', fontSize: '13px', marginBottom: 16 }}>@{record.kullaniciAdi}</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--ant-color-border-secondary)', paddingTop: '12px' }}>
          <Button size="small" icon={<EditOutlined style={{ color: '#1890ff' }} />} onClick={() => modalAc(record)}>Düzenle</Button>
          <Popconfirm title="Emin misiniz?" onConfirm={() => kullaniciSil(record)} okText="Evet" cancelText="Hayır">
            <Button size="small" danger icon={<DeleteOutlined />}>Sil</Button>
          </Popconfirm>
        </div>
      </Card>
    </List.Item>
  );

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: '16px' }}>
        <h2 style={{ margin: 0 }}>Kullanıcı Yönetimi</h2>
        <Button type="primary" size={isMobile ? "middle" : "large"} icon={<UserAddOutlined />} onClick={() => modalAc()}>
          Yeni Kullanıcı Ekle
        </Button>
      </div>

      <div style={{ marginBottom: 24, padding: 16, background: 'var(--ant-color-bg-container)', borderRadius: 8, border: '1px solid var(--ant-color-border-secondary)' }}>
        <Input 
          placeholder="İsim, kullanıcı adı veya rol ara..." 
          prefix={<SearchOutlined style={{ color: '#8c98a4' }} />}
          style={{ width: isMobile ? '100%' : 400 }}
          allowClear
          onChange={(e) => setAramaMetni(e.target.value)}
        />
      </div>

      {isMobile ? (
        <List dataSource={filtrelenmisKullanicilar} renderItem={mobilListeRender} loading={yukleniyor} rowKey={(r) => r.kullaniciID || r.id} pagination={{ position: 'bottom', align: 'center', pageSize: 10 }} />
      ) : (
        <Table dataSource={filtrelenmisKullanicilar} columns={tabloSutunlari} rowKey={(r) => r.kullaniciID || r.id} loading={yukleniyor} scroll={{ x: 'max-content' }} />
      )}

      <Modal title={seciliKullanici ? "Kullanıcıyı Düzenle" : "Yeni Kullanıcı Ekle"} open={modalAcik} onOk={() => form.submit()} onCancel={() => { setModalAcik(false); setSeciliKullanici(null); form.resetFields(); }} okText="Kaydet" cancelText="İptal" destroyOnHidden>
        <Form form={form} layout="vertical" onFinish={islemKaydet}>
          <Form.Item label="Ad Soyad" name="adSoyad" rules={[{ required: true, message: 'Ad Soyad giriniz!' }]}>
            <Input placeholder="Sistem Yöneticisi" />
          </Form.Item>
          <Form.Item label="Kullanıcı Adı" name="kullaniciAdi" rules={[{ required: true, message: 'Kullanıcı adı zorunlu!' }]}>
            <Input placeholder="admin.user" disabled={!!seciliKullanici} />
          </Form.Item>
          <Form.Item label="Rol / Yetki" name="rol" rules={[{ required: true, message: 'Rol seçimi zorunlu!' }]}>
            <Select placeholder="Sistem yetkisini seçin">
              <Select.Option value="Admin">Admin (Tam Yetki)</Select.Option>
              <Select.Option value="Depo Sorumlusu">Depo Sorumlusu (Ürün ve Stok İşlemleri)</Select.Option>
              <Select.Option value="İzleyici">İzleyici (Sadece Okuma)</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label={seciliKullanici ? "Yeni Şifre (Değiştirmeyecekseniz boş bırakın)" : "Şifre"} name="sifre" rules={[{ required: !seciliKullanici, message: 'Şifre zorunlu!' }]}>
            <Input.Password placeholder="Güvenli şifre giriniz" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Kullanicilar;