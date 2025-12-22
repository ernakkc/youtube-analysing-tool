# Electron Desktop Application

Bu klasör Electron masaüstü uygulamasının kaynak kodlarını içerir.

## 🚀 Geliştirme Modu

```bash
npm run electron:dev
```

DevTools otomatik açılır ve değişiklikleri görebilirsiniz.

## 📦 Derleme (Build)

### Tüm platformlar
```bash
npm run electron:build
```

### Platform-spesifik
```bash
npm run build:win    # Windows .exe ve installer
npm run build:mac    # macOS .app ve .dmg
npm run build:linux  # Linux AppImage ve .deb
```

Derlenmiş dosyalar `dist/` klasöründe oluşturulur.

## 📂 Yapı

```
electron/
├── main.js           # Ana Electron process (backend)
├── preload.js        # Güvenli IPC köprüsü
├── renderer/         # GUI (frontend)
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── assets/           # İkonlar ve görseller
    ├── icon.png
    ├── icon.icns     # macOS
    └── icon.ico      # Windows
```

## 🔧 Ayarlar

Uygulama ayarları aşağıdaki konumda saklanır:
- **macOS**: `~/Library/Application Support/Electron/config.json` (dev) veya `~/Library/Application Support/YouTube Gaming Analyzer/config.json` (production)
- **Windows**: `%APPDATA%/Electron/config.json` (dev) veya `%APPDATA%/YouTube Gaming Analyzer/config.json` (production)
- **Linux**: `~/.config/Electron/config.json` (dev) veya `~/.config/YouTube Gaming Analyzer/config.json` (production)

## 💾 Sonuç Veritabanı

Analiz sonuçları şurada saklanır:
- **Geliştirme**: `[proje_klasörü]/data/channels.json`
- **Production**: Uygulama ile birlikte paketlenir ve kullanıcı verisi olarak yönetilir

## ✨ Özellikler

### 🎛️ Settings Sekmesi
- **Multi API Key**: Birden fazla YouTube API anahtarı ekleyebilir ve yönetebilirsiniz
- **Filtreler**: Abone, son yükleme, Shorts oranı gibi filtreleri özelleştirin
- **Keşif**: Bölge kodu, dil, sonuç limiti ayarları
- **Delay Ayarları**: API rate limit için özelleştirilebilir bekleme süreleri
  - Sorgular arası (varsayılan: 5 saniye)
  - Kanallar arası (varsayılan: 1 saniye)
  - API hata sonrası (varsayılan: 3 saniye)
- **Otomatik Kayıt**: Tüm ayarlar otomatik olarak kaydedilir

### 📊 Analysis Sekmesi
- **Sorgu Girişi**: Oyun isimleri ve keyword'ler (her satıra bir sorgu)
- **Real-time Log**: Tüm işlemlerin canlı takibi (renkli log mesajları)
- **Progress Bar**: İşlem durumunu yüzdelik olarak gösterir
- **Start/Stop Butonları**: Analizi başlatın veya durdurun (mevcut işlem tamamlanır)

### 📈 Results Sekmesi
- **Kanal Kartları**: Her kanal için detaylı bilgi kartı
  - Kanal adı, abone sayısı, kalite skoru
  - Tespit edilen oyunlar
  - Email adresleri (varsa, mailto: link ile)
  - Skor detayları (View Reliability, Avg View Power, Activity, Gaming Fit)
- **Export Seçenekleri**:
  - CSV İndir (native save dialog)
  - JSON İndir (native save dialog)
- **Sıralama**: Skora göre sıralama
- **Yenileme**: Sonuçları yeniden yükle
- **Tümünü Sil**: Tüm sonuçları sil (onay gerektirir)

### 🔔 Toast Notifications
- Başarı, hata, uyarı mesajları için şık bildirimler
- `alert()` yerine modern toast sistemi
- Otomatik kaybolma (3 saniye)

### 📧 Email Extraction
- **Kanal açıklamalarından** email toplama
- **Son 10 video açıklamalarından** email toplama
- Otomatik tekrar temizleme (Set kullanımı)
- False-positive filtreleme (.png, .jpg dosya uzantıları hariç)

## 📝 Notlar

- Uygulama ilk açılışta varsayılan ayarlarla gelir
- API key'ler güvenli şekilde yerel config dosyasında saklanır
- Her analiz veritabanına kaydedilir (`data/channels.json`)
- Real-time log ve progress bar ile kullanıcı dostu arayüz

## 🎨 İkon Oluşturma

İkon dosyaları `electron/assets/` klasöründe olmalı:

```bash
# PNG'den ICNS (macOS) oluştur
png2icns icon.icns icon.png

# PNG'den ICO (Windows) oluştur  
convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico
```

Eğer ikonlar yoksa, electron-builder varsayılan ikon kullanacaktır.
