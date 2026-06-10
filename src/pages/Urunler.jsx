import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, message, Popconfirm, Select, Grid, List, Card, Tag } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined, DownloadOutlined, EnvironmentOutlined } from '@ant-design/icons';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { jwtDecode } from 'jwt-decode';

const { useBreakpoint } = Grid;

const Urunler = () => {
  const [urunler, setUrunler] = useState([]);
  const [filtrelenmisUrunler, setFiltrelenmisUrunler] = useState([]);
  const [kategoriler, setKategoriler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [modalAcik, setModalAcik] = useState(false);
  const [aramaMetni, setAramaMetni] = useState('');
  const [seciliUrun, setSeciliUrun] = useState(null);
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

  const fetchUrunler = async () => {
    try {
      const response = await axios.get('/api/urunler');
      setUrunler(response.data);
      setFiltrelenmisUrunler(response.data);
      setYukleniyor(false);
    } catch (error) {
      setYukleniyor(false);
      message.error("Ürünler çekilirken hata oluştu.");
    }
  };

  const fetchKategoriler = async () => {
    try {
      const response = await axios.get('/api/kategoriler');
      if (response.data) {
        setKategoriler(response.data);
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    rolCek();
    fetchUrunler();
    fetchKategoriler();
  }, []);

  useEffect(() => {
    if (aramaMetni) {
      const sonuc = urunler.filter(u => 
        u.urunAdi?.toLowerCase().includes(aramaMetni.toLowerCase()) || 
        u.kategoriAdi?.toLowerCase().includes(aramaMetni.toLowerCase()) ||
        u.konum?.toLowerCase().includes(aramaMetni.toLowerCase())
      );
      setFiltrelenmisUrunler(sonuc);
    } else {
      setFiltrelenmisUrunler(urunler);
    }
  }, [aramaMetni, urunler]);

  const kaydet = async (degerler) => {
    try {
      const gercekUrunID = seciliUrun ? (seciliUrun.urunID || seciliUrun.urunId) : 0;
      
      const payload = {
        urunID: gercekUrunID,
        urunAdi: degerler.urunAdi,
        birimFiyat: degerler.birimFiyat,
        stokMiktari: degerler.stokMiktari,
        kategoriID: degerler.kategoriID,
        konum: degerler.konum
      };

      if (seciliUrun) {
        await axios.put(`/api/urunler/${gercekUrunID}`, payload);
        message.success("Ürün güncellendi.");
      } else {
        await axios.post('/api/urunler', payload);
        message.success("Ürün eklendi.");
      }
      setModalAcik(false);
      form.resetFields();
      setSeciliUrun(null);
      fetchUrunler();
    } catch (error) {
      message.error("Kayıt başarısız oldu. Lütfen verileri kontrol edin.");
    }
  };

  const urunSil = async (urun) => {
    const gercekUrunID = urun.urunID || urun.urunId;
    try {
      await axios.delete(`/api/urunler/${gercekUrunID}`);
      message.success("Ürün silindi.");
      fetchUrunler();
    } catch (error) {
      message.error("Silme işlemi başarısız. Ürüne ait stok hareketi olabilir.");
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
        kategoriID: gecerliKategoriID,
        konum: urun.konum
      });
    } else {
      form.resetFields();
    }
    setModalAcik(true);
  };

  const excelIndir = () => {
    const formatliVeri = filtrelenmisUrunler.map(u => ({
      'Ürün Adı': u.urunAdi,
      'Kategori': u.kategoriAdi || 'Yok',
      'Konum': u.konum || '-',
      'Fiyat (TL)': u.birimFiyat,
      'Stok Miktarı': u.stokMiktari
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(formatliVeri);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Urunler");
    XLSX.writeFile(workbook, "Urun_Listesi.xlsx");
  };

  let tabloSutunlari = [
    { title: 'Ürün Adı', dataIndex: 'urunAdi', key: 'urunAdi', render: (text) => <span style={{ fontWeight: 500 }}>{text}</span> },
    { title: 'Kategori', dataIndex: 'kategoriAdi', key: 'kategoriAdi', render: (text) => <Tag color="blue" bordered={false}>{text || 'Kategori Yok'}</Tag> },
    { title: 'Konum', dataIndex: 'konum', key: 'konum', render: (text) => <span style={{ color: 'var(--ant-color-text-secondary)' }}>{text || '-'}</span> },
    { title: 'Fiyat', dataIndex: 'birimFiyat', key: 'birimFiyat', render: (text) => <span style={{ fontWeight: 500, color: '#36b37e' }}>{text} TL</span> },
    { title: 'Stok', dataIndex: 'stokMiktari', key: 'stokMiktari', render: (text) => <span style={{ fontWeight: 500 }}>{text} Adet</span> }
  ];

  if (kullaniciRolu !== 'izleyici' && kullaniciRolu !== 'i̇zleyici') {
    tabloSutunlari.push({
      title: 'İşlemler',
      key: 'islemler',
      width: '15%',
      align: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined style={{ color: '#1890ff', fontSize: '16px' }} />} 
            onClick={() => modalAc(record)} 
          />
          <Popconfirm 
            title="Emin misiniz?" 
            onConfirm={() => urunSil(record)} 
            okText="Evet" 
            cancelText="Hayır"
            placement="left"
          >
            <Button type="text" danger icon={<DeleteOutlined style={{ fontSize: '16px' }} />} />
          </Popconfirm>
        </Space>
      )
    });
  }

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
        
        <div style={{ color: 'var(--ant-color-text-secondary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
          <EnvironmentOutlined />
          {record.konum || 'Konum Belirtilmedi'}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ color: 'var(--ant-color-text-secondary)', fontSize: '13px' }}>
            Stok: <span style={{ fontWeight: 600, color: 'var(--ant-color-text)' }}>{record.stokMiktari} Adet</span>
          </div>
          <div style={{ fontWeight: 600, fontSize: '15px', color: '#36b37e' }}>
            {record.birimFiyat} TL
          </div>
        </div>

        {kullaniciRolu !== 'izleyici' && kullaniciRolu !== 'i̇zleyici' && (
          <>
            <div style={{ borderTop: '1px solid var(--ant-color-border-secondary)', margin: '16px 0 12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button size="small" icon={<EditOutlined style={{ color: '#1890ff' }} />} onClick={() => modalAc(record)} style={{ borderRadius: 6 }}>
                Düzenle
              </Button>
              <Popconfirm title="Emin misiniz?" onConfirm={() => urunSil(record)} okText="Evet" cancelText="Hayır">
                <Button size="small" danger icon={<DeleteOutlined />} style={{ borderRadius: 6 }}>
                  Sil
                </Button>
              </Popconfirm>
            </div>
          </>
        )}
      </Card>
    </List.Item>
  );

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: '16px' }}>
        <h2 style={{ margin: 0 }}>Ürün Listesi</h2>
        <Space style={{ width: isMobile ? '100%' : 'auto', display: 'flex', justifyContent: isMobile ? 'flex-end' : 'flex-start' }}>
          <Button type="default" size={isMobile ? "middle" : "large"} icon={<DownloadOutlined />} onClick={excelIndir} style={{ borderRadius: 20 }}>
            Excel İndir
          </Button>
          {kullaniciRolu !== 'izleyici' && kullaniciRolu !== 'i̇zleyici' && (
            <Button type="primary" size={isMobile ? "middle" : "large"} icon={<PlusOutlined />} onClick={() => modalAc()} style={{ borderRadius: 20 }}>
              Yeni Ürün Ekle
            </Button>
          )}
        </Space>
      </div>

      <div style={{ marginBottom: 24, padding: 16, background: 'var(--ant-color-bg-container)', borderRadius: 8, border: '1px solid var(--ant-color-border-secondary)' }}>
        <Input 
          placeholder="Ürün adı, kategori veya konum ara..." 
          prefix={<SearchOutlined style={{ color: 'var(--ant-color-text-secondary)' }} />}
          style={{ width: isMobile ? '100%' : 400, height: 40, borderRadius: 8 }}
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
        <Card style={{ borderRadius: 8, border: '1px solid var(--ant-color-border-secondary)', boxShadow: 'none' }} bodyStyle={{ padding: 0 }}>
          <Table 
            dataSource={filtrelenmisUrunler} 
            columns={tabloSutunlari} 
            rowKey={(record) => record.urunID || record.urunId} 
            loading={yukleniyor}
            scroll={{ x: 'max-content' }}
            pagination={{ pageSize: 10, position: ['bottomCenter'] }}
            rowClassName={() => 'custom-row-hover'}
            style={{ background: 'transparent' }}
          />
        </Card>
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
        <Form form={form} layout="vertical" onFinish={kaydet}>
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
                value: kat.kategoriID || kat.kategoriId,
                label: kat.kategoriAdi,
              }))}
            />
          </Form.Item>

          <Form.Item label="Konum / Raf" name="konum">
            <Input placeholder="Örn: Merkez Depo - Raf A5" size="large" style={{ borderRadius: 8 }} />
          </Form.Item>
          
          <Form.Item label="Birim Fiyat (TL)" name="birimFiyat" rules={[{ required: true, message: 'Fiyat zorunlu!' }]}>
            <InputNumber style={{ width: '100%', borderRadius: 8 }} size="large" min={0} step={0.01} />
          </Form.Item>

          <Form.Item label="Stok Miktarı" name="stokMiktari" rules={[{ required: true, message: 'Stok miktarı zorunlu!' }]}>
            <InputNumber style={{ width: '100%', borderRadius: 8 }} size="large" min={0} />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .ant-table-wrapper .ant-table-thead > tr > th { background: var(--ant-color-bg-container); color: var(--ant-color-text-secondary); font-weight: 600; font-size: 12px; border-bottom: 1px solid var(--ant-color-border-secondary); }
        .custom-row-hover:hover > td { background: var(--ant-color-bg-text-hover) !important; }
        .ant-table-wrapper .ant-table-tbody > tr > td { border-bottom: 1px solid var(--ant-color-border-secondary); }
      `}</style>
    </>
  );
};

export default Urunler;