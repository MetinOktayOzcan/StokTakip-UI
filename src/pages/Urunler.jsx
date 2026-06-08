import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, message, Popconfirm, Select, Grid, List, Card, Tag } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

const { useBreakpoint } = Grid;

const Urunler = () => {
  const [urunler, setUrunler] = useState([]);
  const [filtrelenmisUrunler, setFiltrelenmisUrunler] = useState([]);
  const [kategoriler, setKategoriler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [modalAcik, setModalAcik] = useState(false);
  const [aramaMetni, setAramaMetni] = useState('');
  const [seciliUrun, setSeciliUrun] = useState(null);
  const [form] = Form.useForm();

  // mobile cihaz algılama
  const screens = useBreakpoint();
  const isMobile = screens.xs; 

  const verileriCek = async () => {
    try {
      const response = await axios.get('/api/urunler');
      setUrunler(response.data);
      setFiltrelenmisUrunler(response.data);
      setYukleniyor(false);
    } catch (error) {
      setYukleniyor(false);
      message.error("Ürünler yüklenirken bir sorun oluştu.");
    }
  };

  const kategorileriCek = async () => {
    try {
      const response = await axios.get('/api/kategoriler');
      if (response.data && response.data.length > 0) {
        setKategoriler(response.data);
      } else {
        message.warning("Sistemde kayıtlı kategori bulunamadı.");
      }
    } catch (error) {
      console.error("Kategori API Hatası: Backend'de /api/kategoriler ucu var mı?", error);
      message.error("Kategoriler sunucudan çekilemedi! Backend'i kontrol edin.");
    }
  };

  useEffect(() => {
    verileriCek();
    kategorileriCek();
  }, []);

  useEffect(() => {
    if (aramaMetni) {
      const sonuc = urunler.filter(u => 
        u.urunAdi?.toLowerCase().includes(aramaMetni.toLowerCase()) || 
        u.kategoriAdi?.toLowerCase().includes(aramaMetni.toLowerCase())
      );
      setFiltrelenmisUrunler(sonuc);
    } else {
      setFiltrelenmisUrunler(urunler);
    }
  }, [aramaMetni, urunler]);

  const islemKaydet = async (degerler) => {
    try {
      const gercekUrunID = seciliUrun ? (seciliUrun.urunID || seciliUrun.urunId) : 0;
      
      const gonderilecekVeri = {
        urunID: gercekUrunID,
        urunAdi: degerler.urunAdi,
        birimFiyat: degerler.birimFiyat,
        stokMiktari: degerler.stokMiktari,
        kategoriID: degerler.kategoriID
      };

      if (seciliUrun) {
        await axios.put(`/api/urunler/${gercekUrunID}`, gonderilecekVeri);
        message.success("Ürün başarıyla güncellendi.");
      } else {
        await axios.post('/api/urunler', gonderilecekVeri);
        message.success("Yeni ürün başarıyla eklendi.");
      }
      setModalAcik(false);
      form.resetFields();
      setSeciliUrun(null);
      verileriCek();
    } catch (error) {
      console.error("Kayıt Hatası Detayı:", error.response?.data);
      const hataDetayi = error.response?.data?.mesaj || error.response?.data?.message || "Kategori ID'si veya veriler hatalı olabilir.";
      message.error(`Kayıt Başarısız: ${hataDetayi}`);
    }
  };

  const urunSil = async (urun) => {
    const gercekUrunID = urun.urunID || urun.urunId;
    try {
      await axios.delete(`/api/urunler/${gercekUrunID}`);
      message.success("Ürün başarıyla silindi.");
      verileriCek();
    } catch (error) {
      console.error("Silme Hatası Detayı:", error.response?.data);
      message.error("Silme işlemi başarısız! Bu ürüne ait stok hareketi geçmişi olabilir.");
    }
  };

  const modalAc = (urun = null) => {
    setSeciliUrun(urun);
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
        kategoriID: gecerliKategoriID 
      });
    } else {
      form.resetFields();
    }
    setModalAcik(true);
  };

  const tabloSutunlari = [
    { title: 'Ürün Adı', dataIndex: 'urunAdi', key: 'urunAdi', render: (text) => <span style={{ fontWeight: 500 }}>{text}</span> },
    { title: 'Kategori', dataIndex: 'kategoriAdi', key: 'kategoriAdi', render: (text) => <Tag color="blue" bordered={false}>{text || 'Kategori Yok'}</Tag> },
    { title: 'Fiyat', dataIndex: 'birimFiyat', key: 'birimFiyat', render: (text) => <span style={{ fontWeight: 500, color: '#36b37e' }}>{text} TL</span> },
    { title: 'Stok', dataIndex: 'stokMiktari', key: 'stokMiktari', render: (text) => <span style={{ fontWeight: 500 }}>{text} Adet</span> },
    {
      title: 'İşlemler',
      key: 'islemler',
      width: '15%',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined style={{ color: '#1890ff', fontSize: '16px' }} />} 
            onClick={() => modalAc(record)} 
          />
          <Popconfirm 
            title="Ürünü silmek istediğinize emin misiniz?" 
            description="Üzerinde işlem geçmişi olan ürünler SİLİNEMEZ!"
            onConfirm={() => urunSil(record)} 
            okText="Evet" 
            cancelText="Hayır"
            placement="left"
          >
            <Button type="text" danger icon={<DeleteOutlined style={{ fontSize: '16px' }} />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // --- mobil uyumlu tasarım entegrasyonu
  const mobilListeRender = (record) => (
    <List.Item style={{ padding: '0 0 16px 0', border: 'none' }}>
      <Card 
        size="small" 
        style={{ width: '100%', borderRadius: 8, border: '1px solid var(--ant-color-border-secondary)', background: 'var(--ant-color-bg-container)' }}
        bodyStyle={{ padding: '16px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ fontWeight: 600, fontSize: '15px', paddingRight: '8px' }}>{record.urunAdi}</div>
          <Tag color="blue" bordered={false} style={{ margin: 0, whiteSpace: 'nowrap' }}>
            {record.kategoriAdi || 'Kategori Yok'}
          </Tag>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ color: '#8c98a4', fontSize: '13px' }}>
            Stok: <span style={{ fontWeight: 600, color: 'var(--ant-color-text)' }}>{record.stokMiktari} Adet</span>
          </div>
          <div style={{ fontWeight: 600, fontSize: '15px', color: '#36b37e' }}>
            {record.birimFiyat} TL
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--ant-color-border-secondary)', paddingTop: '12px' }}>
          <Button 
            size="small" 
            icon={<EditOutlined style={{ color: '#1890ff' }} />} 
            onClick={() => modalAc(record)} 
          >
            Düzenle
          </Button>
          <Popconfirm 
            title="Emin misiniz?" 
            onConfirm={() => urunSil(record)} 
            okText="Evet" 
            cancelText="Hayır"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Sil
            </Button>
          </Popconfirm>
        </div>
      </Card>
    </List.Item>
  );

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: '16px' }}>
        <h2 style={{ margin: 0 }}>Ürün Listesi</h2>
        <Button type="primary" size={isMobile ? "middle" : "large"} icon={<PlusOutlined />} onClick={() => modalAc()}>
          Yeni Ürün Ekle
        </Button>
      </div>

      <div style={{ marginBottom: 24, padding: 16, background: 'var(--ant-color-bg-container)', borderRadius: 8, border: '1px solid var(--ant-color-border-secondary)' }}>
        <Input 
          placeholder="Ürün adı veya kategori ara..." 
          prefix={<SearchOutlined style={{ color: '#8c98a4' }} />}
          style={{ width: isMobile ? '100%' : 400 }}
          allowClear
          onChange={(e) => setAramaMetni(e.target.value)}
        />
      </div>

      {isMobile ? (
        <List
          dataSource={filtrelenmisUrunler}
          renderItem={mobilListeRender}
          loading={yukleniyor}
          rowKey={(record) => record.urunID || record.urunId}
          pagination={{ position: 'bottom', align: 'center', pageSize: 10 }}
        />
      ) : (
        <Table 
          dataSource={filtrelenmisUrunler} 
          columns={tabloSutunlari} 
          rowKey={(record) => record.urunID || record.urunId} 
          loading={yukleniyor}
          scroll={{ x: 'max-content' }}
        />
      )}

      <Modal 
        title={seciliUrun ? "Ürün Düzenle" : "Yeni Ürün Ekle"} 
        open={modalAcik} 
        onOk={() => form.submit()} 
        onCancel={() => { setModalAcik(false); setSeciliUrun(null); form.resetFields(); }}
        okText="Kaydet"
        cancelText="İptal"
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={islemKaydet}>
          <Form.Item label="Ürün Adı" name="urunAdi" rules={[{ required: true, message: 'Ürün adı zorunlu!' }]}>
            <Input placeholder="Ürün adını girin..." />
          </Form.Item>
          
          <Form.Item label="Kategori Seç" name="kategoriID" rules={[{ required: true, message: 'Kategori seçimi zorunlu!' }]}>
            <Select
              showSearch
              placeholder="Kategori ara veya seç..."
              optionFilterProp="label"
              options={kategoriler.map((kat) => ({
                value: kat.kategoriID || kat.kategoriId,
                label: kat.kategoriAdi,
              }))}
            />
          </Form.Item>
          
          <Form.Item label="Birim Fiyat (TL)" name="birimFiyat" rules={[{ required: true, message: 'Fiyat zorunlu!' }]}>
            <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
          </Form.Item>

          <Form.Item label="Stok Miktarı" name="stokMiktari" rules={[{ required: true, message: 'Stok miktarı zorunlu!' }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Urunler;