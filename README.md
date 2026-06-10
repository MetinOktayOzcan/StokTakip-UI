# Stok Takip Sistemi - Kullanıcı Arayüzü (UI)

Core API projesi ile haberleşen, stok giriş/çıkışlarını, ürün yönetimini ve sistem loglarını görselleştirdiğim React tabanlı frontend uygulaması. Projeyi geliştirirken Redux gibi ağır State Management kütüphanelerinden kaçınıp, React'in kendi hook'ları ve Ant Design'ın sunduğu esneklikle pratik, hızlı ve mobil uyumlu bir arayüz çıkarmayı hedefledim.

## Mimari Kararlar ve Klasör Yapısı

* **App.jsx (Ana Çatı):** Sayfa yönlendirmelerini, oturum kontrolü mantığını ve JWT Token okuma işlemlerini merkezi olarak burada tutuyorum. Sayfa yenilendiğinde rotanın patlamaması için token'ı asenkron değil, doğrudan başlangıç state'inde çözümlüyorum.
* **Pages:** Uygulamanın ana modüllerini (Dashboard, Urunler, Kategoriler vb.) barındıran katman. Veri çekme (fetch), tablo listeleme, form gönderme ve filtreleme işlemleri şimdilik ilgili sayfanın kendi içinde izole olarak çalışıyor.
* **RBAC (Rol Tabanlı Görünüm):** `jwt-decode` kütüphanesi ile giriş yapan kişinin token'ından rolünü (Admin, Depo Sorumlusu, İzleyici) okuyarak arayüzü dinamik değiştiriyorum. Örneğin kullanıcı "İzleyici" ise sayfadaki "Yeni Ekle", "Düzenle" ve "Sil" butonları tamamen gizleniyor.
* **Responsive (Mobil) Liste Yapısı:** Verileri masaüstünde Ant Design `Table` bileşeni ile gösterirken, mobil cihazlardan girildiğinde tabloların bozulmasını engellemek için ekran boyutunu algılıyorum. Mobilde tabloyu gizleyip, aynı veriyi özel tasarlanmış `Card` yapısında bir `List` olarak render ediyorum.
* **Tema Yönetimi:** Standart Ant Design renkleri yerine `ConfigProvider` üzerinden "GitHub Dark" renk paletini sisteme entegre ettim. Kullanıcının tema tercihi (Ay/Güneş) `localStorage` üzerinde tutularak kalıcılık sağlanıyor.

## Kullanılan Teknolojiler

* **React.js** (Vite altyapısı ile oluşturuldu)
* **Ant Design (v5):** UI Bileşenleri ve Grid Sistemi
* **Axios:** API İstekleri ve HTTP haberleşmesi
* **Recharts:** Dashboard üzerindeki dinamik grafiklerin (Pasta ve Alan grafiği) çizimi
* **jwt-decode:** Token çözümleme ve rol tespiti
* **XLSX:** Tablodaki verilerin anında Excel'e aktarımı