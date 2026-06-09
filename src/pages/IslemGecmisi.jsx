import React, { useState, useEffect } from 'react';
import { Table, Input, Select, DatePicker, Tag, Grid, List, Card, Button } from 'antd';
import { SearchOutlined, ClockCircleOutlined, UserOutlined, DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import * as XLSX from 'xlsx';

const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;

const IslemGecmisi = () => {
  const [loglar, setLoglar] = useState([]);
  const [filtrelenmisLoglar, setFiltrelenmisLoglar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  const [aramaMetni, setAramaMetni] = useState('');
  const [tarihAraligi, setTarihAraligi] = useState(null);
  const [tipFiltresi, setTipFiltresi] = useState(null);

  const screens = useBreakpoint();
  const isMobile = screens.xs;

  const verileriCek = async () => {
    try {
      const response = await axios.get('/api/islemgecmisi');
      setLoglar(response.data);
      setFiltrelenmisLoglar(response.data);
      setYukleniyor(false);
    } catch (error) {
      setYukleniyor(false);
    }
  };

  useEffect(() => {
    verileriCek();
  }, []);

  useEffect(() => {
    let sonuc = loglar;

    if (aramaMetni) {
      sonuc = sonuc.filter(l => 
        l.detay?.toLowerCase().includes(aramaMetni.toLowerCase()) || 
        l.kullanici?.toLowerCase().includes(aramaMetni.toLowerCase()) ||
        l.islemTipi?.toLowerCase().includes(aramaMetni.toLowerCase())
      );
    }

    if (tipFiltresi) {
      sonuc = sonuc.filter(l => l.islemTipi?.toLowerCase().includes(tipFiltresi.toLowerCase()));
    }

    if (tarihAraligi && tarihAraligi[0] && tarihAraligi[1]) {
      const baslangicTarihi = new Date(tarihAraligi[0].format('YYYY-MM-DD')).getTime();
      const bitisTarihi = new Date(tarihAraligi[1].format('YYYY-MM-DD')).getTime() + 86399999; 
      
      sonuc = sonuc.filter(l => {
        const islemZamani = new Date(l.islemTarihi).getTime();
        return islemZamani >= baslangicTarihi && islemZamani <= bitisTarihi;
      });
    }

    setFiltrelenmisLoglar(sonuc);
  }, [aramaMetni, tarihAraligi, tipFiltresi, loglar]);

  const renkBelirle = (tip) => {
    const kucukTip = tip?.toLowerCase() || '';
    if (kucukTip.includes('ekle') || kucukTip.includes('giriş')) return 'green';
    if (kucukTip.includes('sil') || kucukTip.includes('çıkış')) return 'red';
    if (kucukTip.includes('güncelle')) return 'orange';
    return 'blue';
  };

  const excelIndir = () => {
    const formatliVeri = filtrelenmisLoglar.map(l => ({
      'Tarih': new Date(l.islemTarihi).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' }),
      'İşlem Tipi': l.islemTipi,
      'Kullanıcı': l.kullanici,
      'Detay': l.detay
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(formatliVeri);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sistem_Loglari");
    XLSX.writeFile(workbook, "Sistem_Loglari.xlsx");
  };

  const tabloSutunlari = [
    {
      title: 'İşlem Tipi',
      dataIndex: 'islemTipi',
      key: 'islemTipi',
      width: '15%',
      render: (text) => <Tag color={renkBelirle(text)} bordered={false} style={{ fontWeight: 500, padding: '2px 8px', borderRadius: '4px' }}>{text?.toUpperCase()}</Tag>
    },
    {
      title: 'Detay',
      dataIndex: 'detay',
      key: 'detay',
      width: '50%',
      render: (text) => <span style={{ color: 'var(--ant-color-text)' }}>{text}</span>
    },
    {
      title: 'Kullanıcı',
      dataIndex: 'kullanici',
      key: 'kullanici',
      width: '15%',
      render: (text) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
          <UserOutlined style={{ color: '#8c98a4' }} />
          {text}
        </span>
      )
    },
    {
      title: 'Tarih',
      dataIndex: 'islemTarihi',
      key: 'islemTarihi',
      width: '20%',
      render: (text) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8c98a4', fontSize: '13px' }}>
          <ClockCircleOutlined />
          {new Date(text).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
        </span>
      )
    }
  ];

  const mobilListeRender = (record) => (
    <List.Item style={{ padding: '0 0 16px 0', border: 'none' }}>
      <Card 
        size="small" 
        style={{ width: '100%', borderRadius: 8, border: '1px solid var(--ant-color-border-secondary)', background: 'var(--ant-color-bg-container)' }}
        bodyStyle={{ padding: '16px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <Tag color={renkBelirle(record.islemTipi)} bordered={false} style={{ margin: 0, fontWeight: 500, borderRadius: '4px' }}>
            {record.islemTipi?.toUpperCase()}
          </Tag>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8c98a4', fontSize: '12px' }}>
            <ClockCircleOutlined />
            {new Date(record.islemTarihi).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
          </span>
        </div>
        
        <div style={{ color: 'var(--ant-color-text)', fontSize: '14px', lineHeight: '1.5', marginBottom: 16 }}>
          {record.detay}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderTop: '1px solid var(--ant-color-border-secondary)', paddingTop: '12px', color: '#8c98a4', fontSize: '13px' }}>
          <UserOutlined />
          <span style={{ fontWeight: 500, color: 'var(--ant-color-text)' }}>{record.kullanici}</span>
        </div>
      </Card>
    </List.Item>
  );

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: '16px' }}>
        <h2 style={{ margin: 0 }}>Sistem Logları</h2>
        <Button type="default" size={isMobile ? "middle" : "large"} icon={<DownloadOutlined />} onClick={excelIndir} style={{ borderColor: '#36b37e', color: '#36b37e' }}>
          Excel İndir
        </Button>
      </div>

      <div style={{ marginBottom: 24, padding: 16, background: 'var(--ant-color-bg-container)', borderRadius: 8, border: '1px solid var(--ant-color-border-secondary)' }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px', flexWrap: 'wrap' }}>
          <Input 
            placeholder="Detay, Kullanıcı veya İşlem Tipi ara..." 
            prefix={<SearchOutlined style={{ color: '#8c98a4' }} />}
            style={{ width: isMobile ? '100%' : 300 }}
            allowClear
            onChange={(e) => setAramaMetni(e.target.value)}
          />
          <Select
            placeholder="İşlem Tipi Filtrele"
            style={{ width: isMobile ? '100%' : 180 }}
            allowClear
            onChange={(value) => setTipFiltresi(value)}
            options={[
              { value: 'Ekleme', label: 'Ekleme İşlemleri' },
              { value: 'Güncelleme', label: 'Güncelleme İşlemleri' },
              { value: 'Silme', label: 'Silme İşlemleri' },
              { value: 'Hareket', label: 'Stok Hareketleri' }
            ]}
          />
          <RangePicker 
            placeholder={['Başlangıç', 'Bitiş']}
            style={{ width: isMobile ? '100%' : 280, flex: isMobile ? 'none' : 1, minWidth: isMobile ? 0 : 250 }}
            onChange={(dates) => setTarihAraligi(dates)}
          />
        </div>
      </div>

      {isMobile ? (
        <List
          dataSource={filtrelenmisLoglar}
          renderItem={mobilListeRender}
          loading={yukleniyor}
          rowKey={(record) => record.logID || record.logId}
          pagination={{ position: 'bottom', align: 'center', pageSize: 15 }}
        />
      ) : (
        <Table 
          dataSource={filtrelenmisLoglar} 
          columns={tabloSutunlari} 
          rowKey={(record) => record.logID || record.logId}
          loading={yukleniyor} 
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 15 }}
        />
      )}
    </>
  );
};

export default IslemGecmisi;