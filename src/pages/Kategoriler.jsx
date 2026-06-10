import React, { useState, useEffect } from 'react';
import { Table, Button, Drawer, Form, Input, Space, message, Popconfirm, Grid, List, Card } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined, TagsOutlined } from '@ant-design/icons';
import axios from 'axios';

const { useBreakpoint } = Grid;

const Kategoriler = () => {
  const [kategoriler, setKategoriler] = useState([]);
  const [filtrelenmisKategoriler, setFiltrelenmisKategoriler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [drawerAcik, setDrawerAcik] = useState(false);
  const [aramaMetni, setAramaMetni] = useState('');
  const [seciliKategori, setSeciliKategori] = useState(null);
  const [form] = Form.useForm();

  const screens = useBreakpoint();
  const isMobile = screens.xs;

  const verileriCek = async () => {
    try {
      const response = await axios.get('/api/kategoriler');
      setKategoriler(response.data);
      setFiltrelenmisKategoriler(response.data);
      setYukleniyor(false);
    } catch (error) {
      setYukleniyor(false);
    }
  };

  useEffect(() => {
    verileriCek();
  }, []);

  useEffect(() => {
    if (aramaMetni) {
      const sonuc = kategoriler.filter(k => 
        k.kategoriAdi?.toLowerCase().includes(aramaMetni.toLowerCase())
      );
      setFiltrelenmisKategoriler(sonuc);
    } else {
      setFiltrelenmisKategoriler(kategoriler);
    }
  }, [aramaMetni, kategoriler]);

  const handleSave = async (degerler) => {
    try {
      const gercekID = seciliKategori ? (seciliKategori.kategoriID || seciliKategori.kategoriId || seciliKategori.id) : 0;
      
      const payload = {
        kategoriID: gercekID,
        kategoriAdi: degerler.kategoriAdi
      };

      if (seciliKategori) {
        await axios.put(`/api/kategoriler/${gercekID}`, payload);
        message.success("Kategori başarıyla güncellendi.");
      } else {
        await axios.post('/api/kategoriler', payload);
        message.success("Yeni kategori eklendi.");
      }
      formKapat();
      verileriCek();
    } catch (error) {
      message.error(error.response?.data?.mesaj || "Kayıt işlemi başarısız.");
    }
  };

  const handleDelete = async (kategori) => {
    const gercekID = kategori.kategoriID || kategori.kategoriId || kategori.id;
    try {
      await axios.delete(`/api/kategoriler/${gercekID}`);
      message.success("Kategori sistemden silindi.");
      verileriCek();
    } catch (error) {
      message.error("Silme başarısız. Bu kategoriye ait ürünler olabilir.");
    }
  };

  const openModal = (kategori = null) => {
    setSeciliKategori(kategori);
    if (kategori) {
      form.setFieldsValue({ kategoriAdi: kategori.kategoriAdi });
    } else {
      form.resetFields();
    }
    setDrawerAcik(true);
  };

  const formKapat = () => {
    setDrawerAcik(false);
    setSeciliKategori(null);
    form.resetFields();
  };

  const tabloSutunlari = [
    { 
      title: 'Kategori Adı', 
      dataIndex: 'kategoriAdi', 
      key: 'kategoriAdi', 
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: 'var(--ant-color-bg-layout)', padding: '6px', borderRadius: '6px', display: 'flex' }}>
            <TagsOutlined style={{ color: 'var(--ant-color-text-secondary)' }} />
          </div>
          <span style={{ fontWeight: 500, color: 'var(--ant-color-text)' }}>{text}</span>
        </div>
      ) 
    },
    {
      title: 'İşlemler',
      key: 'islemler',
      width: '15%',
      align: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined style={{ color: 'var(--ant-color-text-secondary)' }} />} onClick={() => openModal(record)} />
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
        style={{ width: '100%', borderRadius: 8, border: '1px solid var(--ant-color-border-secondary)', boxShadow: 'none' }}
        bodyStyle={{ padding: 16 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ background: 'var(--ant-color-bg-layout)', padding: '6px', borderRadius: '6px', display: 'flex' }}>
            <TagsOutlined style={{ color: 'var(--ant-color-text-secondary)' }} />
          </div>
          <span style={{ fontWeight: 600, color: 'var(--ant-color-text)', fontSize: 15 }}>{record.kategoriAdi}</span>
        </div>
        
        <div style={{ borderTop: '1px solid var(--ant-color-border-secondary)', margin: '0 0 12px 0' }} />
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
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--ant-color-text)' }}>Kategori Yönetimi</h2>
        <div style={{ display: 'flex', gap: 8, width: isMobile ? '100%' : 'auto' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()} style={{ flex: isMobile ? 1 : 'none', borderRadius: 8, background: '#2563EB', fontWeight: 500, height: 40 }}>
            Yeni Kategori Ekle
          </Button>
        </div>
      </div>

      <Card style={{ borderRadius: 8, border: '1px solid var(--ant-color-border-secondary)', boxShadow: 'none' }} bodyStyle={{ padding: 16 }}>
        <Input 
          placeholder="Kategori adı ara..." 
          prefix={<SearchOutlined style={{ color: 'var(--ant-color-text-secondary)' }} />}
          style={{ width: '100%', borderRadius: 8, height: 40 }}
          allowClear
          onChange={(e) => setAramaMetni(e.target.value)}
        />
      </Card>

      {isMobile ? (
        <List 
          dataSource={filtrelenmisKategoriler} 
          renderItem={mobilListeRender} 
          loading={yukleniyor} 
          rowKey={(r) => r.kategoriID || r.kategoriId || Math.random().toString()} 
          pagination={{ position: 'bottom', align: 'center', pageSize: 10 }} 
        />
      ) : (
        <Card style={{ borderRadius: 8, border: '1px solid var(--ant-color-border-secondary)', boxShadow: 'none' }} bodyStyle={{ padding: 0 }}>
          <Table 
            dataSource={filtrelenmisKategoriler} 
            columns={tabloSutunlari} 
            rowKey={(r) => r.kategoriID || r.kategoriId || Math.random().toString()} 
            loading={yukleniyor} 
            scroll={{ x: 'max-content' }}
            pagination={{ pageSize: 10, position: ['bottomCenter'] }}
            rowClassName={() => 'custom-row-hover'}
            style={{ background: 'transparent' }}
          />
        </Card>
      )}

      <Drawer
        title={seciliKategori ? "Kategoriyi Düzenle" : "Yeni Kategori Ekle"}
        width={isMobile ? '100%' : 400}
        onClose={formKapat}
        open={drawerAcik}
        destroyOnClose
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button onClick={formKapat} style={{ borderRadius: 8 }}>İptal</Button>
            <Button onClick={() => form.submit()} type="primary" style={{ background: 'var(--ant-color-text)', borderRadius: 8 }}>
              {seciliKategori ? "Değişiklikleri Kaydet" : "Kategori Ekle"}
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item label="Kategori Adı" name="kategoriAdi" rules={[{ required: true, message: 'Kategori adı zorunlu!' }]}>
            <Input placeholder="Örn: Ağ Cihazları" size="large" style={{ borderRadius: 8 }} />
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

export default Kategoriler;