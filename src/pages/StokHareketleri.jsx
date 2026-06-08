import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, DatePicker, Space, Tag, Grid, List, Card } from 'antd';
import { SearchOutlined, PlusOutlined, CalendarOutlined, EnvironmentOutlined } from '@ant-design/icons';
import axios from 'axios';

const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;

const StokHareketleri = () => {
  const [urunler, setUrunler] = useState([]);
  const [filtrelenmisUrunler, setFiltrelenmisUrunler] = useState([]);
  const [urunListesi, setUrunListesi] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [modalAcik, setModalAcik] = useState(false);
  const [aramaMetni, setAramaMetni] = useState('');
  const [tarihAraligi, setTarihAraligi] = useState(null);
  const [islemFiltresi, setIslemFiltresi] = useState(null);
  
  const [form] = Form.useForm();
  
  // mobile cihaz algılama
  const screens = useBreakpoint();
  const isMobile = screens.xs; 

  const verileriCek = async () => {
    try {
      const response = await axios.get('/api/stokhareketleri');
      setUrunler(response.data);
      setFiltrelenmisUrunler(response.data);
      setYukleniyor(false);
    } catch (error) {
      console.log(error);
      setYukleniyor(false);
    }
  };

  const urunleriCek = async () => {
    try {
      const response = await axios.get('/api/urunler');
      setUrunListesi(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const islemKaydet = async (degerler) => {
    try {
      await axios.post('/api/stokhareketleri', degerler);
      setModalAcik(false);
      form.resetFields();
      verileriCek();
      message.success("İşlem başarıyla kaydedildi.");
    } catch (error) {
      const hataDetayi = error.response?.data?.mesaj || error.response?.data?.message || "Beklenmedik hata oluştu";
      message.error(hataDetayi);
    }
  };

  useEffect(() => {
    verileriCek();
    urunleriCek();
  }, []);

  useEffect(() => {
    let sonuc = urunler;

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

    setFiltrelenmisUrunler(sonuc);
  }, [aramaMetni, tarihAraligi, islemFiltresi, urunler]);

  const tabloSutunlari = [
    { 
      title: 'Ürün Adı', 
      dataIndex: 'urunAdi', 
      key: 'urunAdi',
      width: '30%',
      render: (text) => <span style={{ fontWeight: 500, fontSize: '14px' }}>{text}</span>
    },
    { 
      title: 'İşlem Detayları', 
      key: 'islemDetayi',
      width: '35%',
      render: (_, record) => {
        const kucukHarf = record.islemTuru?.toLowerCase() || '';
        const isGiris = kucukHarf.includes('giriş') || kucukHarf.includes('giris');
        const renk = isGiris ? 'green' : 'red';
        const tarihFormatli = record.islemTarihi ? new Date(record.islemTarihi).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' }) : '-';
        const konumMetni = record.konum ? record.konum : 'Belirtilmedi';

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag color={renk} bordered={false} style={{ margin: 0, fontWeight: 500, borderRadius: '4px', padding: '0 8px' }}>
                {record.islemTuru?.toUpperCase()}
              </Tag>
              <span style={{ fontWeight: 500, fontSize: '14px' }}>
                {record.miktar} Adet
              </span>
            </div>
            <div style={{ color: '#8c98a4', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <CalendarOutlined style={{ marginRight: 6, opacity: 0.8 }} />
                {tarihFormatli}
              </span>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <EnvironmentOutlined style={{ marginRight: 6, opacity: 0.8 }} />
                {konumMetni}
              </span>
            </div>
          </div>
        );
      }
    },
    { 
      title: 'Açıklama', 
      dataIndex: 'aciklama', 
      key: 'aciklama',
      width: '35%',
      render: (text) => (
        <div style={{ wordWrap: 'break-word', wordBreak: 'break-word', whiteSpace: 'normal', color: '#8c98a4', fontSize: '13px' }}>
          {text ? text : '-'}
        </div>
      )
    }
  ];

  // --- mobil uyumlu tasarım entegrasyonu
  const mobilListeRender = (record) => {
    const kucukHarf = record.islemTuru?.toLowerCase() || '';
    const isGiris = kucukHarf.includes('giriş') || kucukHarf.includes('giris');
    const renk = isGiris ? 'green' : 'red';
    const tarihFormatli = record.islemTarihi ? new Date(record.islemTarihi).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' }) : '-';
    const konumMetni = record.konum ? record.konum : 'Belirtilmedi';

    return (
      <List.Item style={{ padding: '0 0 16px 0', border: 'none' }}>
        <Card 
          size="small" 
          style={{ width: '100%', borderRadius: 8, border: '1px solid var(--ant-color-border-secondary)', background: 'var(--ant-color-bg-container)' }}
          bodyStyle={{ padding: '16px' }}
        >
          <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: 12 }}>{record.urunAdi}</div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Tag color={renk} bordered={false} style={{ margin: 0, fontWeight: 500, borderRadius: '4px', padding: '2px 8px' }}>
              {record.islemTuru?.toUpperCase()}
            </Tag>
            <span style={{ fontWeight: 600, fontSize: '14px', color: isGiris ? '#36b37e' : '#ff5630' }}>
              {record.miktar} Adet
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#8c98a4', fontSize: '13px' }}>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <CalendarOutlined style={{ marginRight: 8, fontSize: '14px' }} />
              {tarihFormatli}
            </span>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <EnvironmentOutlined style={{ marginRight: 8, fontSize: '14px' }} />
              {konumMetni}
            </span>
          </div>

          {record.aciklama && (
            <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--ant-color-border-secondary)', color: '#8c98a4', fontSize: '13px', lineHeight: '1.5' }}>
              {record.aciklama}
            </div>
          )}
        </Card>
      </List.Item>
    );
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: '16px' }}>
        <h2 style={{ margin: 0 }}>Stok Hareketleri</h2>
        <Button type="primary" size={isMobile ? "middle" : "large"} icon={<PlusOutlined />} onClick={() => setModalAcik(true)}>
          Yeni İşlem Ekle
        </Button>
      </div>

      {/* Dinamik Filtreleme Çubuğu (Mobilde Alt Alta, Masaüstünde Yan Yana) */}
      <div style={{ marginBottom: 24, padding: 16, background: 'var(--ant-color-bg-container)', borderRadius: 8, border: '1px solid var(--ant-color-border-secondary)' }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px', flexWrap: 'wrap' }}>
          <Input 
            placeholder="Ürün, Konum veya Açıklama ara..." 
            prefix={<SearchOutlined style={{ color: '#8c98a4' }} />}
            style={{ width: isMobile ? '100%' : 260 }}
            allowClear
            onChange={(e) => setAramaMetni(e.target.value)}
          />
          <Select
            placeholder="İşlem Türü"
            style={{ width: isMobile ? '100%' : 150 }}
            allowClear
            onChange={(value) => setIslemFiltresi(value)}
            options={[
              { value: 'Giriş', label: 'Sadece Girişler' },
              { value: 'Çıkış', label: 'Sadece Çıkışlar' }
            ]}
          />
          <RangePicker 
            placeholder={['Başlangıç', 'Bitiş']}
            style={{ width: isMobile ? '100%' : 280, flex: isMobile ? 'none' : 1, minWidth: isMobile ? 0 : 250 }}
            onChange={(dates) => setTarihAraligi(dates)}
          />
        </div>
      </div>

      {/* Ekran Boyutuna Göre Tablo veya Kart Gösterimi */}
      {isMobile ? (
        <List
          dataSource={filtrelenmisUrunler}
          renderItem={mobilListeRender}
          loading={yukleniyor}
          rowKey="hareketID"
          pagination={{ position: 'bottom', align: 'center', pageSize: 10 }}
        />
      ) : (
        <Table 
          dataSource={filtrelenmisUrunler} 
          columns={tabloSutunlari} 
          rowKey="hareketID" 
          loading={yukleniyor} 
          scroll={{ x: 'max-content' }}
        />
      )}

      <Modal 
        title="Yeni Stok Hareketi" 
        open={modalAcik} 
        onOk={() => form.submit()} 
        onCancel={() => { setModalAcik(false); form.resetFields(); }}
        okText="Kaydet"
        cancelText="İptal"
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={islemKaydet}>
          
          <Form.Item label="Ürün Seç" name="urunID" rules={[{ required: true, message: 'Ürün seçimi zorunlu!' }]}>
            <Select
              showSearch
              placeholder="Ürün ara veya seç..."
              optionFilterProp="label"
              options={urunListesi.map((urun) => ({
                value: urun.urunID || urun.urunId,
                label: urun.urunAdi,
              }))}
            />
          </Form.Item>
          
          <Form.Item label="İşlem Türü" name="islemTuru" rules={[{ required: true, message: 'İşlem türü seçin!' }]}>
            <Select placeholder="Seçiniz...">
              <Select.Option value="Giriş">Giriş</Select.Option>
              <Select.Option value="Çıkış">Çıkış</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="Miktar" name="miktar" rules={[{ required: true, message: 'Miktar girin!' }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>

          <Form.Item label="Konum / Depo" name="konum" rules={[{ required: true, message: 'Konum belirtmek zorunlu!' }]}>
            <Input placeholder="Örn: Merkez Depo - Raf A5" />
          </Form.Item>

          <Form.Item label="Açıklama" name="aciklama">
            <Input.TextArea rows={3} placeholder="İşlem detaylarını girin..." />
          </Form.Item>

        </Form>
      </Modal>
    </>
  );
};

export default StokHareketleri;