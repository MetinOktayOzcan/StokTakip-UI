import React, { useState, useEffect } from 'react';
import { Table, Input, Select, DatePicker, Grid, Card, Button, Pagination } from 'antd';
import { SearchOutlined, ClockCircleOutlined, UserOutlined, DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import * as XLSX from 'xlsx';

const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;

const formatLogTarihi = (tarih) => {
  if (!tarih) return '-';
  return new Date(tarih).toLocaleString('tr-TR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const getId = (log) => log?.logID || log?.logId;

const IslemGecmisi = () => {
  const [loglar, setLoglar] = useState([]);
  const [filtrelenmisLoglar, setFiltrelenmisLoglar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  const [aramaMetni, setAramaMetni] = useState('');
  const [tarihAraligi, setTarihAraligi] = useState(null);
  const [tipFiltresi, setTipFiltresi] = useState(null);
  const [mobilSayfa, setMobilSayfa] = useState(1);

  const screens = useBreakpoint();
  const isMobile = screens.xs;

  const fetchLogs = async () => {
    try {
      setYukleniyor(true);
      const response = await axios.get('/api/islemgecmisi');
      setLoglar(response.data);
      setFiltrelenmisLoglar(response.data);
    } catch {
    } finally {
      setYukleniyor(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    let sonuc = loglar;

    if (aramaMetni) {
      const aramaKucuk = aramaMetni.toLowerCase();
      sonuc = sonuc.filter(l => 
        l.detay?.toLowerCase().includes(aramaKucuk) || 
        l.kullanici?.toLowerCase().includes(aramaKucuk) ||
        l.islemTipi?.toLowerCase().includes(aramaKucuk)
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
    setMobilSayfa(1);
  }, [aramaMetni, tarihAraligi, tipFiltresi, loglar]);

  const getTagStyle = (tip) => {
    const kucukTip = tip?.toLowerCase() || '';
    if (kucukTip.includes('ekle') || kucukTip.includes('giriş')) return { color: '#059669', bg: '#D1FAE5' };
    if (kucukTip.includes('sil') || kucukTip.includes('çıkış')) return { color: '#E11D48', bg: '#FEE2E2' };
    if (kucukTip.includes('güncelle')) return { color: '#D97706', bg: '#FEF3C7' };
    return { color: '#2563EB', bg: '#DBEAFE' };
  };

  const handleExport = () => {
    const sanitizeExcel = (text) => {
      if (typeof text === 'string' && /^[=+\-@]/.test(text)) return "'" + text;
      return text;
    };

    const formatliVeri = filtrelenmisLoglar.map(l => ({
      'Tarih': formatLogTarihi(l.islemTarihi),
      'İşlem Tipi': sanitizeExcel(l.islemTipi),
      'Kullanıcı': sanitizeExcel(l.kullanici),
      'Detay': sanitizeExcel(l.detay)
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
        return <span style={{ backgroundColor: style.bg, color: style.color, padding: '4px 10px', borderRadius: 6, fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap', display: 'inline-block' }}>{text?.toUpperCase()}</span>
      }
    },
    {
      title: 'Detay',
      dataIndex: 'detay',
      key: 'detay',
      width: '50%',
      render: (text) => <span style={{ color: 'var(--ant-color-text)', fontWeight: 500, whiteSpace: 'normal', wordBreak: 'break-word', display: 'block' }}>{text}</span>
    },
    {
      title: 'Kullanıcı',
      dataIndex: 'kullanici',
      key: 'kullanici',
      width: '15%',
      render: (text) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, color: 'var(--ant-color-text)' }}>
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
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ant-color-text-secondary)', fontSize: '13px', whiteSpace: 'nowrap' }}>
          <ClockCircleOutlined />
          {formatLogTarihi(text)}
        </span>
      )
    }
  ];

  const mobilListeRender = (record) => {
    const style = getTagStyle(record.islemTipi);
    
    return (
      <Card 
        key={getId(record)}
        style={{ width: '100%', borderRadius: 12, border: '1px solid var(--ant-color-border-secondary)', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.02)' }}
        styles={{ body: { padding: 16 } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <span style={{ backgroundColor: style.bg, color: style.color, padding: '4px 10px', borderRadius: 6, fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>
            {record.islemTipi?.toUpperCase()}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ant-color-text-secondary)', fontSize: '12px' }}>
            <ClockCircleOutlined />
            {formatLogTarihi(record.islemTarihi)}
          </span>
        </div>
        
        <div style={{ color: 'var(--ant-color-text)', fontSize: '14px', lineHeight: '1.5', marginBottom: 16, fontWeight: 500 }}>
          {record.detay}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--ant-color-border-secondary)', paddingTop: '12px', color: 'var(--ant-color-text)', fontSize: '13px', fontWeight: 500 }}>
          <div style={{ background: 'var(--ant-color-bg-layout)', padding: '4px', borderRadius: '50%', display: 'flex' }}>
            <UserOutlined style={{ color: 'var(--ant-color-text-secondary)', fontSize: 12 }} />
          </div>
          {record.kullanici}
        </div>
      </Card>
    );
  };

  const sayfaVerisi = filtrelenmisLoglar.slice((mobilSayfa - 1) * 15, mobilSayfa * 15);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: 'var(--ant-color-text)' }}>Sistem Logları</h2>
          <span style={{ color: 'var(--ant-color-text-secondary)', fontSize: 14 }}>Sistemdeki tüm aktiviteleri ve kullanıcı işlemlerini izleyin</span>
        </div>
        <Button onClick={handleExport} icon={<DownloadOutlined />} style={{ borderRadius: 8, borderColor: 'var(--ant-color-border-secondary)', color: 'var(--ant-color-text)', fontWeight: 500, height: 40, width: isMobile ? '100%' : 'auto' }}>
          Excel İndir
        </Button>
      </div>

      <Card style={{ borderRadius: 12, border: '1px solid var(--ant-color-border-secondary)', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.02)' }} styles={{ body: { padding: 16 } }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!yukleniyor && sayfaVerisi.map(mobilListeRender)}
          {!yukleniyor && filtrelenmisLoglar.length > 0 && (
            <Pagination 
              current={mobilSayfa} 
              total={filtrelenmisLoglar.length} 
              pageSize={15} 
              onChange={setMobilSayfa} 
              align="center" 
              size="small"
            />
          )}
        </div>
      ) : (
        <Card style={{ borderRadius: 12, border: '1px solid var(--ant-color-border-secondary)', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.02)' }} styles={{ body: { padding: 0 } }}>
          <Table 
            dataSource={filtrelenmisLoglar} 
            columns={tabloSutunlari} 
            rowKey={getId}
            loading={yukleniyor} 
            scroll={{ x: 800 }}
            pagination={{ placement: ['bottomCenter'], pageSize: 15 }}
            rowClassName={() => 'custom-row-hover'}
            style={{ background: 'transparent' }}
          />
        </Card>
      )}
      
      <style>{`
        .ant-table-wrapper .ant-table-thead > tr > th { background: var(--ant-color-bg-layout); color: var(--ant-color-text-secondary); font-weight: 600; font-size: 12px; letter-spacing: 0.5px; border-bottom: 1px solid var(--ant-color-border-secondary); }
        .custom-row-hover:hover > td { background: var(--ant-color-bg-text-hover) !important; }
        .ant-table-wrapper .ant-table-tbody > tr > td { border-bottom: 1px solid var(--ant-color-border-secondary); }
        .ant-picker { border-radius: 8px; border-color: var(--ant-color-border-secondary); }
      `}</style>
    </div>
  );
};

export default IslemGecmisi;