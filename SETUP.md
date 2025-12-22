# YouTube Gaming Channel Analyzer

YouTube üzerindeki oyun kanallarını otomatik olarak keşfeden, performanslarını analiz eden, kalite skorları hesaplayan ve sonuçları kaydeden bir yazılım sistemi.

## 🚀 Kurulum

1. Repoyu klonlayın:
```bash
git clone https://github.com/ernakkc/youtube-analysing-tool.git
cd youtube-analysing-tool
```

2. Gerekli paketleri yükleyin:
```bash
npm install
```

3. Environment değişkenlerini ayarlayın:
```bash
cp .env.example .env
```

`.env` dosyasını düzenleyerek YouTube API anahtarınızı ekleyin:
```
YOUTUBE_API_KEY=your_actual_api_key_here
```

## 📦 Kullanım

Projeyi çalıştırmak için:
```bash
npm start
```

Bu komut, tüm pipeline'ı çalıştırır:
- Kanal keşfi (Discovery)
- Filtreleme (Hard Filters)
- Analiz (Gaming Content Analysis)
- Skorlama (Quality Scoring)
- Veritabanına kaydetme

## 📁 Proje Yapısı

```
youtube-analysing-tool/
├── src/
│   ├── config/
│   │   └── constants.js          # Konfigürasyon ve sabitler
│   ├── services/
│   │   ├── youtubeService.js     # YouTube API entegrasyonu
│   │   └── dbService.js          # Veritabanı işlemleri
│   ├── filters/
│   │   └── channelFilters.js     # Hard filtreler
│   ├── analyzers/
│   │   └── gameDetector.js       # Oyun tespiti ve analiz
│   ├── scoring/
│   │   └── qualityScore.js       # Kalite skoru hesaplama
│   ├── utils/
│   │   └── helpers.js            # Yardımcı fonksiyonlar
│   └── index.js                  # Ana pipeline
├── data/
│   └── channels.json             # Veritabanı (otomatik oluşur)
├── .env                          # Environment değişkenleri
├── .env.example                  # Örnek env dosyası
└── package.json
```

## 🎯 Özellikler

### Kanal Keşfi (Discovery)
- YouTube Data API v3 ile kanal arama
- Video bazlı reverse keşif
- TR/Global bölge desteği

### Hard Filtreler
- Abone sayısı: 10.000 - 500.000
- Son yükleme: ≤30 gün
- Uzun video kontrolü (≥3 dk)
- Shorts oranı kontrolü

### Analiz Katmanı
- Otomatik oyun tespiti
- Gaming keyword analizi
- İzlenme/abone oranı hesaplama

### Kalite Skorlama (0-100)
- View Sağlamlığı: 30 puan
- Ortalama İzlenme Gücü: 25 puan
- Kanal Aktifliği: 20 puan
- Gaming Uygunluğu: 25 puan

## 🔧 Konfigürasyon

`src/config/constants.js` dosyasından ayarları değiştirebilirsiniz:
- Filtre eşikleri
- Oyun listesi
- Skorlama ağırlıkları
- API parametreleri

## 📊 Çıktı Formatı

```json
{
  "channelId": "UCxxxx",
  "channelUrl": "https://youtube.com/channel/UCxxxx",
  "title": "Channel Name",
  "subscriberCount": 84200,
  "last6Views": [12000, 9000, 15000, 11000, 8000, 10000],
  "detectedGames": ["Valorant", "CS2"],
  "qualityScore": 82,
  "scoreBreakdown": {
    "viewReliability": 25,
    "avgViewPower": 18,
    "activity": 20,
    "gamingFit": 19
  },
  "lastCheckedAt": "2025-12-22T10:30:00Z"
}
```

## 🛠 Teknolojiler

- **Node.js** - Runtime environment
- **googleapis** - YouTube Data API v3
- **dayjs** - Tarih işlemleri
- **lowdb** - JSON veritabanı
- **dotenv** - Environment değişkenleri

## 📝 Lisans

MIT Lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakınız.

## 🤝 Katkıda Bulunma

Pull request'ler kabul edilir. Büyük değişiklikler için önce bir issue açarak neyi değiştirmek istediğinizi belirtin.
