# Release v1.0.0 - Desktop Application 🎉

## 📥 İndirme Bağlantıları

### macOS (Intel & Apple Silicon)
- **[YouTube Gaming Analyzer-1.0.0.dmg](https://github.com/ernakkc/youtube-analysing-tool/releases/download/v1.0.0/YouTube.Gaming.Analyzer-1.0.0.dmg)** (114 MB) - Disk imajı (önerilen)
- **[YouTube Gaming Analyzer-1.0.0-mac.zip](https://github.com/ernakkc/youtube-analysing-tool/releases/download/v1.0.0/YouTube.Gaming.Analyzer-1.0.0-mac.zip)** (110 MB) - Zip arşivi

### Windows (64-bit)
- **[YouTube Gaming Analyzer Setup 1.0.0.exe](https://github.com/ernakkc/youtube-analysing-tool/releases/download/v1.0.0/YouTube.Gaming.Analyzer.Setup.1.0.0.exe)** (100 MB) - Installer (önerilen)
- **[YouTube Gaming Analyzer 1.0.0.exe](https://github.com/ernakkc/youtube-analysing-tool/releases/download/v1.0.0/YouTube.Gaming.Analyzer.1.0.0.exe)** (99 MB) - Portable (kurulum gerektirmez)

---

## ✨ Yeni Özellikler

### 🖥️ Desktop Uygulaması
- **Modern GUI** - 3 sekmeli arayüz (Settings, Analysis, Results)
- **Multi API Key Yönetimi** - Birden fazla YouTube API anahtarı ekleyin, otomatik rotation
- **Real-time Takip** - Canlı log ekranı ve progress bar
- **Start/Stop Kontrolleri** - Analizi istediğiniz zaman durdurun
- **Otomatik Kayıt** - Tüm ayarlarınız otomatik kaydedilir

### 📧 Email Toplama
- Kanal açıklamalarından otomatik email çıkarma
- Son 10 video açıklamalarından email çıkarma
- Duplicate temizleme ve false-positive filtreleme
- Sonuç kartlarında mailto: linkleri

### 📊 Export ve Raporlama
- **CSV Export** - Excel uyumlu, email sütunu dahil
- **JSON Export** - Ham veri formatı
- Native save dialog (sistem dosya kaydetme penceresi)
- Sonuçları skora göre sıralama
- Tüm sonuçları silme özelliği

### ⏱️ Delay Ayarları
- Sorgular arası bekleme (varsayılan: 5 saniye)
- Kanallar arası bekleme (varsayılan: 1 saniye)
- API hata sonrası bekleme (varsayılan: 3 saniye)
- Tüm değerler GUI üzerinden özelleştirilebilir

### 🔔 Toast Notifications
- Modern, şık bildirimler
- `alert()` yerine non-blocking toast sistemi
- Başarı, hata, uyarı mesajları için farklı renkler
- Otomatik kaybolma (3 saniye)

### 🎨 Platform-Specific Icons
- macOS: .icns formatı
- Windows: .ico formatı
- Linux: .png formatı (gelecek versiyonda)

---

## 📝 Detaylı Dokümantasyon

- **[README.md](https://github.com/ernakkc/youtube-analysing-tool/blob/main/README.md)** - Genel bakış ve teknik detaylar
- **[ELECTRON_GUIDE.md](https://github.com/ernakkc/youtube-analysing-tool/blob/main/ELECTRON_GUIDE.md)** - Müşteri kullanım kılavuzu
- **[SETUP.md](https://github.com/ernakkc/youtube-analysing-tool/blob/main/SETUP.md)** - Geliştirici kurulum rehberi

---

## 🚀 Nasıl Kullanılır?

### macOS
1. DMG dosyasını indirin
2. Açın ve uygulamayı Applications klasörüne sürükleyin
3. İlk açılışta "Güvenilmeyen geliştirici" uyarısı alırsanız:
   - Sistem Tercihleri → Güvenlik → "Yine de Aç"

### Windows
1. Setup.exe dosyasını indirin
2. Çift tıklayın ve kurulum sihirbazını takip edin
3. Masaüstü kısayolu otomatik oluşturulur

### İlk Yapılandırma
1. Settings sekmesinden YouTube API key'inizi girin
2. Filtre ve keşif ayarlarını düzenleyin
3. Analysis sekmesine geçin ve sorguları girin
4. "Analizi Başlat" butonuna tıklayın
5. Results sekmesinden sonuçları görüntüleyin ve export edin

---

## 🔧 Sistem Gereksinimleri

### macOS
- macOS 10.13 (High Sierra) veya üzeri
- 200 MB boş disk alanı
- İnternet bağlantısı

### Windows
- Windows 7/8/10/11 (64-bit)
- 200 MB boş disk alanı
- İnternet bağlantısı

---

## 🐛 Bilinen Sorunlar

- macOS'ta development modunda icon gösterilmiyor (production build'de çalışıyor)
- YouTube API'nin limitasyonu nedeniyle "View email address" butonu arkasındaki emailler toplanamıyor
- İlk build'de Windows için code signing yoktur (gelecek versiyonda eklenecek)

---

## 🙏 Teşekkürler

Bu proje [Electron](https://www.electronjs.org/), [YouTube Data API v3](https://developers.google.com/youtube/v3), ve [LowDB](https://github.com/typicode/lowdb) kullanılarak geliştirilmiştir.

**Made with ❤️ for Turkish Gaming Community**

---

## 📞 Destek

Sorun yaşarsanız veya öneriniz varsa:
- GitHub Issues: https://github.com/ernakkc/youtube-analysing-tool/issues
- Email: ern.akkc@gmail.com
