import React, { useState, useEffect } from 'react';
import { Table, Input, Select, DatePicker, Grid, List, Card, Button } from 'antd';
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

  const fetchLogs = async () => {
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
    fetchLogs();
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

  const getTagStyle = (tip) => {
    const kucukTip = tip?.toLowerCase() || '';
    if (kucukTip.includes('ekle') || kucukTip.includes('giriş')) return { color: '#059669', bg: '#D1FAE5' };
    if (kucukTip.includes('sil') || kucukTip.includes('çıkış')) return { color: '#E11D48', bg: '#FEE2E2' };
    if (kucukTip.includes('güncelle')) return { color: '#D97706', bg: '#FEF3C7' };
    return { color: '#2563EB', bg: '#DBEAFE' };
  };

  const handleExport = () => {
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
      render: (text) => {
        const style = getTagStyle(text);
        return <span style={{ backgroundColor: style.bg, color: style.color, padding: '4px 10px', borderRadius: 6, fontWeight: 600, fontSize: 12 }}>{text?.toUpperCase()}</span>
      }
    },
    {
      title: 'Detay',
      dataIndex: 'detay',
      key: 'detay',
      width: '50%',
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>
    },
    {
      title: 'Kullanıcı',
      dataIndex: 'kullanici',
      key: 'kullanici',
      width: '15%',
      render: (text) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
          <div style={{ background: 'var(--ant-color-bg-layout)', padding: '4px', borderRadius: '50%', display: 'flex' }}>
            <UserOutlined style={{ color: 'var(--ant-color-text-secondary)', fontSize: 12 }} />
          </div>
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
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ant-color-text-secondary)', fontSize: '13px' }}>
          <ClockCircleOutlined />
          {new Date(text).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
        </span>
      )
    }
  ];

  const mobilListeRender = (record) => {
    const style = getTagStyle(record.islemTipi);
    
    return (
      <List.Item style={{ padding: '0 0 16px 0', border: 'none' }}>
        <Card 
          style={{ width: '100%', borderRadius: 12, border: '1px solid var(--ant-color-border-secondary)', boxShadow: 'none' }}
          bodyStyle={{ padding: 16 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <span style={{ backgroundColor: style.bg, color: style.color, padding: '4px 10px', borderRadius: 6, fontWeight: 600, fontSize: 12 }}>
              {record.islemTipi?.toUpperCase()}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ant-color-text-secondary)', fontSize: '12px' }}>
              <ClockCircleOutlined />
              {new Date(record.islemTarihi).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
            </span>
          </div>
          
          <div style={{ fontSize: '14px', lineHeight: '1.5', marginBottom: 16, fontWeight: 500 }}>
            {record.detay}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--ant-color-border-secondary)', paddingTop: '12px', fontSize: '13px', fontWeight: 500 }}>
            <div style={{ background: 'var(--ant-color-bg-layout)', padding: '4px', borderRadius: '50%', display: 'flex' }}>
              <UserOutlined style={{ color: 'var(--ant-color-text-secondary)', fontSize: 12 }} />
            </div>
            {record.kullanici}
          </div>
        </Card>
      </List.Item>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Sistem Logları</h2>
          <span style={{ color: 'var(--ant-color-text-secondary)', fontSize: 14 }}>Sistemdeki tüm aktiviteleri ve kullanıcı işlemlerini izleyin</span>
        </div>
        <Button onClick={handleExport} icon={<DownloadOutlined />} style={{ borderRadius: 8, height: 40, width: isMobile ? '100%' : 'auto' }}>
          Excel İndir
        </Button>
      </div>

      <Card style={{ borderRadius: 12, border: '1px solid var(--ant-color-border-secondary)', boxShadow: 'none' }} bodyStyle={{ padding: 16 }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 16 }}>
          <Input 
            placeholder="Detay veya kullanıcı ara..." 
            prefix={<SearchOutlined style={{ color: 'var(--ant-color-text-secondary)' }} />}
            style={{ width: isMobile ? '100%' : 320, borderRadius: 8 }}
            allowClear
            onChange={(e) => setAramaMetni(e.target.value)}
          />
          <Select
            placeholder="İşlem Tipi"
            style={{ width: isMobile ? '100%' : 200 }}
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
            style={{ flex: isMobile ? 'none' : 1, minWidth: isMobile ? 0 : 250, borderRadius: 8 }}
            onChange={(dates) => setTarihAraligi(dates)}
          />
        </div>
      </Card>

      {isMobile ? (
        <List
          dataSource={filtrelenmisLoglar}
          renderItem={mobilListeRender}
          loading={yukleniyor}
          rowKey={(record) => record.logID || record.logId}
          pagination={{ position: 'bottom', align: 'center', pageSize: 15 }}
        />
      ) : (
        <Card style={{ borderRadius: 12, border: '1px solid var(--ant-color-border-secondary)', boxShadow: 'none' }} bodyStyle={{ padding: 0 }}>
          <Table 
            dataSource={filtrelenmisLoglar} 
            columns={tabloSutunlari} 
            rowKey={(record) => record.logID || record.logId}
            loading={yukleniyor} 
            scroll={{ x: 'max-content' }}
            pagination={{ pageSize: 15, position: ['bottomCenter'] }}
            rowClassName={() => 'custom-row-hover'}
            style={{ background: 'transparent' }}
          />
        </Card>
      )}
      
      <style>{`
        .ant-table-wrapper .ant-table-thead > tr > th { background: var(--ant-color-bg-container); color: var(--ant-color-text-secondary); font-weight: 600; font-size: 12px; border-bottom: 1px solid var(--ant-color-border-secondary); }
        .custom-row-hover:hover > td { background: var(--ant-color-bg-text-hover) !important; }
        .ant-table-wrapper .ant-table-tbody > tr > td { border-bottom: 1px solid var(--ant-color-border-secondary); }
        .ant-picker { border-radius: 8px; }
      `}</style>
    </div>
  );
};

export default IslemGecmisi;