import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message } from 'antd';
import axios from 'axios';

const Urunler = () => {
  const [urunler, setUrunler] = useState([]);
  const [urunListesi, setUrunListesi] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [modalAcik, setModalAcik] = useState(false);
  const [form] = Form.useForm();

  const verileriCek = async () => {
    try {
      const response = await axios.get('https://localhost:7140/api/stokhareketleri');
      setUrunler(response.data);
      setYukleniyor(false);
    } catch (error) {
      console.log(error);
      setYukleniyor(false);
    }
  };

  const urunleriCek = async () => {
    try {
      const response = await axios.get('https://localhost:7140/api/urunler');
      setUrunListesi(response.data);
    } catch (error) {
      console.log(error);
    }
  };

const islemKaydet = async (degerler) => {
    try {
      await axios.post('https://localhost:7140/api/stokhareketleri', degerler);
      setModalAcik(false);
      form.resetFields();
      verileriCek();
      message.success("İşlem başarıyla kaydedildi.");
    } catch (error) {
      console.log("API'den gelen hata:", error.response?.data);

      const hataDetayi = error.response?.data?.mesaj || 
                         error.response?.data?.message || 
                         "Beklenmedik hata oluştu";

      message.error(hataDetayi);
    }
  };

  useEffect(() => {
    verileriCek();
    urunleriCek();
  }, []);

  const tabloSutunlari = [
    { title: 'Hareket ID', dataIndex: 'hareketID', key: 'hareketID' },
    { title: 'Ürün Adı', dataIndex: 'urunAdi', key: 'urunAdi' },
    { 
      title: 'İşlem Türü', 
      dataIndex: 'islemTuru', 
      key: 'islemTuru',
      render: (text) => {
        if (!text) return <span>-</span>;
        
        const kucukHarf = text.toLowerCase();
        return (
          <span style={{ color: kucukHarf === 'giriş' || kucukHarf === 'giris' ? 'green' : 'red', fontWeight: 'bold' }}>
            {text}
          </span>
        );
      }
    },
    { title: 'Miktar', dataIndex: 'miktar', key: 'miktar', render: (text) => <span>{text ? `${text} Adet` : '-'}</span> },
    { 
      title: 'Tarih', 
      dataIndex: 'islemTarihi', 
      key: 'islemTarihi',
      render: (text) => text ? <span>{new Date(text).toLocaleString('tr-TR')}</span> : <span>-</span>
    },
    { 
      title: 'Açıklama', 
      dataIndex: 'aciklama', 
      key: 'aciklama',
      width: '35%',
      render: (text) => (
        <div style={{ wordWrap: 'break-word', wordBreak: 'break-word', whiteSpace: 'normal' }}>
          {text}
        </div>
      )
    }
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Stok Hareketleri</h2>
        <Button type="primary" size="large" onClick={() => setModalAcik(true)}>
          Yeni İşlem Ekle
        </Button>
      </div>

      <Table 
        dataSource={urunler} 
        columns={tabloSutunlari} 
        rowKey="hareketID" 
        loading={yukleniyor} 
      />

      <Modal 
        title="Yeni Stok Hareketi" 
        open={modalAcik} 
        onOk={() => form.submit()} 
        onCancel={() => { setModalAcik(false); form.resetFields(); }}
        okText="Kaydet"
        cancelText="İptal"
      >
        <Form form={form} layout="vertical" onFinish={islemKaydet}>
          
          <Form.Item label="Ürün Seç" name="urunID" rules={[{ required: true, message: 'Ürün seçimi zorunlu!' }]}>
            <Select
              showSearch
              placeholder="Ürün ara veya seç..."
              optionFilterProp="label"
              options={urunListesi.map((urun) => ({
                value: urun.urunID,
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

          <Form.Item label="Açıklama" name="aciklama">
            <Input.TextArea rows={3} />
          </Form.Item>

        </Form>
      </Modal>
    </>
  );
};

export default Urunler;