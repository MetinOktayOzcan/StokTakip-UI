import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, message, Popconfirm, Grid, List, Card } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined, TagsOutlined } from '@ant-design/icons';
import axios from 'axios';

const { useBreakpoint } = Grid;

const Kategoriler = () => {
  const [kategoriler, setKategoriler] = useState([]);
  const [filtrelenmisKategoriler, setFiltrelenmisKategoriler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [modalAcik, setModalAcik] = useState(false);
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
      setModalAcik(false);
      form.resetFields();
      setSeciliKategori(null);
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
    setModalAcik(true);
  };

  const tabloSutunlari = [
    { 
      title: 'Kategori Adı', 
      dataIndex: 'kategoriAdi', 
      key: 'kategoriAdi', 
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: '#F4F4F5', padding: '6px', borderRadius: '6px', display: 'flex' }}>
            <TagsOutlined style={{ color: '#71717A' }} />
          </div>
          <span style={{ fontWeight: 500, color: '#18181B' }}>{text}</span>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ background: '#F4F4F5', padding: '6px', borderRadius: '6px', display: 'flex' }}>
            <TagsOutlined style={{ color: '#71717A' }} />
          </div>
          <span style={{ fontWeight: 600, color: '#18181B', fontSize: 15 }}>{record.kategoriAdi}</span>
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
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#18181B' }}>Kategori Yönetimi</h2>
        <div style={{ display: 'flex', gap: 8, width: isMobile ? '100%' : 'auto' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()} style={{ flex: isMobile ? 1 : 'none', borderRadius: 20, background: '#2563EB', fontWeight: 500, height: 40 }}>
            Yeni Kategori Ekle
          </Button>
        </div>
      </div>

      <Card style={{ borderRadius: 8, border: '1px solid #E4E4E7', boxShadow: 'none' }} bodyStyle={{ padding: 16 }}>
        <Input 
          placeholder="Kategori adı ara..." 
          prefix={<SearchOutlined style={{ color: '#A1A1AA' }} />}
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
        <Card style={{ borderRadius: 8, border: '1px solid #E4E4E7', boxShadow: 'none' }} bodyStyle={{ padding: 0 }}>
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

      <Modal title={seciliKategori ? "Kategoriyi Düzenle" : "Yeni Kategori Ekle"} open={modalAcik} onOk={() => form.submit()} onCancel={() => { setModalAcik(false); setSeciliKategori(null); form.resetFields(); }} okText="Kaydet" cancelText="İptal" destroyOnHidden forceRender>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item label="Kategori Adı" name="kategoriAdi" rules={[{ required: true, message: 'Kategori adı zorunlu!' }]}>
            <Input placeholder="Örn: Ağ Cihazları" size="large" style={{ borderRadius: 8 }} />
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

export default Kategoriler;