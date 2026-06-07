import React, { useState, useEffect } from 'react';
import { Table } from 'antd';
import axios from 'axios';

const Urunler = () => {
  const [urunler, setUrunler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  const verileriCek = async () => {
    try {
      const response = await axios.get('/api/urunler');
      setUrunler(response.data);
      setYukleniyor(false);
    } catch (error) {
      console.log(error);
      setYukleniyor(false);
    }
  };

  useEffect(() => {
    verileriCek();
  }, []);

  const tabloSutunlari = [
    { title: 'ID', dataIndex: 'urunID', key: 'urunID' },
    { title: 'Ürün Adı', dataIndex: 'urunAdi', key: 'urunAdi' },
    { title: 'Kategori', dataIndex: 'kategoriAdi', key: 'kategoriAdi' },
    { title: 'Fiyat', dataIndex: 'birimFiyat', key: 'birimFiyat', render: (text) => <span>{text} TL</span> },
    { title: 'Stok', dataIndex: 'stokMiktari', key: 'stokMiktari' }
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Ürün Listesi</h2>
      </div>
      <Table 
        dataSource={urunler} 
        columns={tabloSutunlari} 
        rowKey="urunID" 
        loading={yukleniyor} 
      />
    </>
  );
};

export default Urunler;