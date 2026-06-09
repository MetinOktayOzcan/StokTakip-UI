import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, message, Popconfirm, Grid, List, Card, Tag } from 'antd';
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
      message.error("Kategoriler yüklenemedi.");
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

  const islemKaydet = async (degerler) => {
    try {
      const gercekID = seciliKategori ? (seciliKategori.kategoriID || seciliKategori.kategoriId || seciliKategori.id) : 0;
      
      const gonderilecekVeri = {
        kategoriID: gercekID,
        kategoriAdi: degerler.kategoriAdi
      };

      if (seciliKategori) {
        await axios.put(`/api/kategoriler/${gercekID}`, gonderilecekVeri);
        message.success("Kategori başarıyla güncellendi.");
      } else {
        await axios.post('/api/kategoriler', gonderilecekVeri);
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

  const kategoriSil = async (kategori) => {
    const gercekID = kategori.kategoriID || kategori.kategoriId || kategori.id;
    try {
      await axios.delete(`/api/kategoriler/${gercekID}`);
      message.success("Kategori sistemden silindi.");
      verileriCek();
    } catch (error) {
      message.error("Silme başarısız. Bu kategoriye ait ürünler olabilir.");
    }
  };

  const modalAc = (kategori = null) => {
    setSeciliKategori(kategori);
    if (kategori) {
      form.setFieldsValue({
        kategoriAdi: kategori.kategoriAdi
      });
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
      render: (text) => <Tag color="blue" variant="filled"><TagsOutlined style={{ marginRight: 4 }}/>{text}</Tag> 
    },
    {
      title: 'İşlemler',
      key: 'islemler',
      width: '15%',
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined style={{ color: '#1890ff', fontSize: '16px' }} />} onClick={() => modalAc(record)} />
          <Popconfirm title="Kategoriyi silmek istediğinize emin misiniz?" onConfirm={() => kategoriSil(record)} okText="Evet" cancelText="Hayır" placement="left">
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
          <Tag color="blue" variant="filled" style={{ margin: 0 }}><TagsOutlined style={{ marginRight: 4 }}/>{record.kategoriAdi}</Tag>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--ant-color-border-secondary)', paddingTop: '12px' }}>
          <Button size="small" icon={<EditOutlined style={{ color: '#1890ff' }} />} onClick={() => modalAc(record)}>Düzenle</Button>
          <Popconfirm title="Emin misiniz?" onConfirm={() => kategoriSil(record)} okText="Evet" cancelText="Hayır">
            <Button size="small" danger icon={<DeleteOutlined />}>Sil</Button>
          </Popconfirm>
        </div>
      </Card>
    </List.Item>
  );

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: '16px' }}>
        <h2 style={{ margin: 0 }}>Kategori Yönetimi</h2>
        <Button type="primary" size={isMobile ? "middle" : "large"} icon={<PlusOutlined />} onClick={() => modalAc()}>
          Yeni Kategori Ekle
        </Button>
      </div>

      <div style={{ marginBottom: 24, padding: 16, background: 'var(--ant-color-bg-container)', borderRadius: 8, border: '1px solid var(--ant-color-border-secondary)' }}>
        <Input 
          placeholder="Kategori adı ara..." 
          prefix={<SearchOutlined style={{ color: '#8c98a4' }} />}
          style={{ width: isMobile ? '100%' : 400 }}
          allowClear
          onChange={(e) => setAramaMetni(e.target.value)}
        />
      </div>

      {isMobile ? (
        <List 
          dataSource={filtrelenmisKategoriler} 
          renderItem={mobilListeRender} 
          loading={yukleniyor} 
          rowKey={(r) => r.kategoriID || r.kategoriId || Math.random().toString()} 
          pagination={{ position: 'bottom', align: 'center', pageSize: 10 }} 
        />
      ) : (
        <Table 
          dataSource={filtrelenmisKategoriler} 
          columns={tabloSutunlari} 
          rowKey={(r) => r.kategoriID || r.kategoriId || Math.random().toString()} 
          loading={yukleniyor} 
          scroll={{ x: 'max-content' }} 
        />
      )}

      <Modal title={seciliKategori ? "Kategoriyi Düzenle" : "Yeni Kategori Ekle"} open={modalAcik} onOk={() => form.submit()} onCancel={() => { setModalAcik(false); setSeciliKategori(null); form.resetFields(); }} okText="Kaydet" cancelText="İptal" destroyOnHidden forceRender>
        <Form form={form} layout="vertical" onFinish={islemKaydet}>
          <Form.Item label="Kategori Adı" name="kategoriAdi" rules={[{ required: true, message: 'Kategori adı zorunlu!' }]}>
            <Input placeholder="Örn: Ağ Cihazları" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Kategoriler;