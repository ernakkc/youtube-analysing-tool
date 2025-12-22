# YouTube Gaming Channel Analyzer

YouTube üzerindeki oyun kanallarını otomatik olarak keşfeden, performanslarını analiz eden, kalite skorları hesaplayan ve sonuçları kaydeden bir yazılım sistemi. Sistem; kanal aktifliği, izlenme performansı, içerik uygunluğu ve oyun odaklılık gibi metrikleri değerlendirerek kanalları tespit eder.

## 🚀 Hızlı Başlangıç

```bash
# Projeyi klonlayın
git clone https://github.com/ernakkc/youtube-analysing-tool.git
cd youtube-analysing-tool

# Paketleri yükleyin
npm install

# Environment dosyasını oluşturun
cp .env.example .env
# .env dosyasına YouTube API key'inizi ekleyin

# Uygulamayı çalıştırın
npm start
```

## 📋 Gereksinimler

- Node.js (v14 veya üzeri)
- YouTube Data API v3 anahtarı ([Nasıl alınır?](https://console.cloud.google.com/))

## 💡 Özellikler

✅ **Otomatik Kanal Keşfi** - İki farklı yöntemle kanal bulma  
✅ **Akıllı Filtreleme** - Shorts, abone sayısı, aktivite kontrolü  
✅ **Oyun Tespiti** - 20+ oyun otomatik tespit edilir  
✅ **Kalite Skorlama** - 0-100 arası objektif puanlama  
✅ **JSON Veritabanı** - LowDB ile yerel kayıt  
✅ **TR/Global Destek** - Bölge ve dil bazlı arama

## 🔄 Pipeline Akışı

```
Discovery → Filter → Analyze → Score → Save
```

1. **🔍 Discovery** - YouTube API ile kanal keşfi
2. **🚫 Filter** - Hard filtreler (abone, aktivite, shorts oranı)
3. **📊 Analyze** - Oyun tespiti ve içerik analizi
4. **⭐ Score** - Kalite skoru hesaplama (0-100)
5. **💾 Save** - Veritabanına kaydetme

## 🔍 Kanal Keşfi (Discovery)

Sistem iki farklı yöntemle kanal bulur:

### Yöntem A: Direkt Kanal Arama
`search.list` API endpoint'i ile direkt kanal araması:
- `type=channel` - Sadece kanalları getirir
- `q` - Oyun isimleri ve keyword'ler (gta, valorant, "oynuyorum" vb.)
- `regionCode=TR` - Türkiye bölgesi
- `relevanceLanguage=tr` - Türkçe içerik önceliği

### Yöntem B: Video Reverse Discovery (Önerilen)
Daha kaliteli sonuçlar verir:
1. Oyun keyword'leriyle video ara
2. Videonun `channelId`'sini çıkar
3. Set kullanarak duplicate kanalları filtrele
4. **Avantaj:** Shorts ağırlıklı kanalları daha iyi tespit eder

### API Limitleri ve Quota Yönetimi

**YouTube Data API v3 Günlük Limitler:**
- **Günlük Quota:** 10,000 birim (ücretsiz tier)
- **search.list** (kanal/video arama): 100 birim
- **channels.list** (kanal detayları): 1 birim  
- **videos.list** (video detayları): 1 birim
- **playlistItems.list** (son videolar): 1 birim

**Örnek Hesaplama:**
```
1 kanal keşfi = 100 (search) + 100 (video search) = 200 birim
1 kanal analizi = 1 (channel) + 1 (playlist) + 1 (videos) = ~3 birim
Toplam: ~203 birim/kanal

Günlük işlenebilecek kanal: 10,000 / 203 ≈ 49 kanal
```

**Quota Optimizasyonu:**
- Vhorts Tespiti:** `duration < 60 saniye` olan videolar shorts olarak kabul edilir.

## arsayılan: 1 oyun + 1 keyword (2 search = ~400 birim)
- Bu limitlerle günde ~20-25 kanal güvenle işlenebilir
- Daha fazla için: Birden fazla API key veya Google'dan quota artışı talep edin

## 🚫 Hard Filtreler

Skorlama öncesi direkt eleme kriterleri:

### ✅ Kanal Gereksinimleri
| Kriter | Değer |
|--------|-------|
| Abone sayısı | 10.000 - 500.000 |
| Son yükleme | ≤ 30 gün |
| Region | TR veya Global |

### ✅ Video Gereksinimleri
| Kriter | Değer |
|--------|-------|
| Uzun video süresi | ≥ 3 dakika |
| Minimum izlenme | ≥ 1.000 (son 6 videodan en az 4'ü) |
| Shorts oranı | <%60 (son 10 videoda) |
javascript
ratio = avg_views_last6 / subscriberCount


**Örnek Hesaplama:**
- 50.000 abone
- Ortalama 8.000 izlenme
- **Ratio: 0.16** ⭐ (Mükemmel)

## ⭐ Kalite Skorlama Sistemi (0-100)

Ağırlıklı ve şeffaf skorlama sistemi:

**İzlenme/Abone Oranı:**
⭐ Kalite Skorlama Sistemi (0-100)

Ağırlıklı ve şeffaf skorlama sistemi:

**Örnek Hesaplama:**
- 50.000 abone
- Ortalama 8.000 izlenme
- **Ratio: 0.16** ⭐ (Mükemmel
- Regex + fuzzy match
- Alias listesi (örneğin: csgo → cs2, gta v → gta5)

### Ortalama İzlenme / Abone Oranı
- `avg_views_last6 / subscriberCount`

**Örnek:**
- 50.000 abone
- Ortalama 8.000 izlenme
- → 0.16 (çok iyi)

## Kalite Skoru (0–100)

Ağırlıklı ve açıklanabilir olsun.

### 1. View Sağlamlığı (30 Puan)
Son 6 uzun videonun kaç tanesi ≥ 1.000 izlenme?

| Oran | Puan |
|------|------|
| 6/6  | 30   |
| 5/6  | 25   |
| 4/6  | 20   |
| 3/6  | 10   |
| <3   | 0 (zaten elenir) |

### 2. Ortalama İzlenme Gücü (25 Puan)
`ratio = avg_views / subscriberCount`

| Ratio    sistem (gelecekte ML).

| Kriter                          | Puan |
|---------------------------------|------|
| Tespit edilen oyun var          | +8   |
| Gaming keyword'ler (oynuyorum vb.)| +10  |
| 2+ farklı oyun tespit edildi    | +7   |
| Max                             | 25   |
 | Puan |
|-----------|------|
| ≥ 0.2     | 25   |
| 0.1 – 0.2 | 18   |
| 0.05 – 0.1| 12   |
| 0.02 – 0.05| 6    |
| < 0.02    | 0    |

### 3. Kanal Aktifliği (20 Puan)
Son video zamanı

| Süre     | Puan |
|----------|------|
| ≤ 7 gün  | 20   |
| ≤ 14 gün | 15   |
| ≤ 30 gün | 8    |
| > 30     | 0    |

### 4. Gaming Uygunluğu (25 Puan)
Rule-based 
### 🎯 Final Skor Hesaplama
- 0-59: Orta
- 0-39: Zayıf

```javascript
quality_score = 
  view_reliability (max 30) + 
  avg_view_power (max 25) + 
  activity (max 20) + 
  gaming_fit (max 25)
```

**Skor Dağılımı:**
- 80-100: Mükemmel
- 60-79: İyi
- 4💾 Çıktı ve Veritabanı

Sonuçlar `data/channels.json` dosyasında LowDB ile saklanır.

### Örnek Kanal Kaydı
```json
{
  "channelId": "UCxxxx",
  "channelUrl": "https://youtube.com/channel/UCxxxx",
  "title": "Kanal İsmi",
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
  "metrics": {
    "viewRatio": "0.1595",
    "longVideosCount": 6,
    "avgViews": 10833
  },
  "lastCheckedAt": "2025-12-22T10:30:00Z"
}
```

## 🛠️ Teknoloji Stack

| Teknoloji | Amaç | Durum |
|-----------|------|-------|
| Node.js | Runtime | ✅ |
| googleapis | YouTube Data API v3 | ✅ |
| dayjs | Tarih işlemleri | ✅ |
| lowdb | JSON veritabanı | ✅ |
| dotenv | Environment yönetimi | ✅ |
| PostgreSQL | İleri veritabanı | 🔜 Planlı |

## 📁 Proje Yapısı

```
youtube-analysing-tool/
├── src/
│   ├── config/
│   │   └── constants.js          # Tüm ayarlar ve sabitler
│   ├── services/
│   │   ├── youtubeService.js     # YouTube API entegrasyonu
│   │   └── dbService.js          # LowDB veritabanı işlemleri
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
├── config/                       # (Boş - ileride kullanılacak)
├── .env                          # Environment değişkenleri
├── .env.example                  # Örnek env dosyası
├── .gitignore
├── package.json
├── TODO.md                       # Yapılacaklar listesi
├── SETUP.md                      # Detaylı kurulum rehberi
└── README.md
```

## ⚙️ Konfigürasyon

`src/config/constants.js` dosyasından tüm ayarları özelleştirebilirsiniz:

```javascript
// Filtre eşikleri
MIN_SUBSCRIBERS: 10000
MAX_SUBSCRIBERS: 500000
MIN_VIDEO_VIEWS: 1000

// Discovery ayarları
DEFAULT_REGION_CODE: 'TR'
DEFAULT_LANGUAGE: 'tr'

// Skorlama ağırlıkları
VIEW_RELIABILITY: 30
AVG_VIEW_POWER: 25
CHANNEL_ACTIVITY: 20
GAMING_FIT: 25
```

## 🚀 Kullanım

### Basit Kullanım
```bash
npm start
```

### Programatik Kullanım
```javascript
const { processChannel, discoverChannels, runPipeline } = require('./src/index');

// Tek bir kanalı işle
await processChannel('UCxxxxxx');

// Kanalları keşfet
const channelIds = await discoverChannels(['valorant', 'gta']);

// Tüm pipeline'ı çalıştır
await runPipeline();
```

## 📊 Örnek Çıktı

```
🚀 YouTube Gaming Channel Analyzer
==================================

🔍 Starting channel discovery...

Searching for: "gta"
   Found 15 channels
   Found 8 channels from videos

✨ Total unique channels discovered: 23

🔄 Processing channels...

📺 Processing channel: UCxxxxxx
   Title: Oyun Kanalı
   Subscribers: 85000
   Applying filters...
   ✅ Passed filters
   Analyzing gaming content...
   Detected games: GTA5, Valorant
   Calculating quality score...
   Quality Score: 78/100
      - View Reliability: 25/30
      - Avg View Power: 18/25
      - Activity: 15/20
      - Gaming Fit: 20/25
   💾 Saved to database

==================================================
📊 SUMMARY
==================================================
Total channels discovered: 23
Channels passed filters: 8
Success rate: 34.8%

🏆 Top 5 Channels:
1. Kanal A - Score: 85/100
2. Kanal B - Score: 78/100
3. Kanal C - Score: 72/100
4. Kanal D - Score: 68/100
5. Kanal E - Score: 65/100

✅ Pipeline completed!
```

## 🔒 Environment Değişkenleri

`.env` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:

```bash
# YouTube Data API v3 (Zorunlu)
YOUTUBE_API_KEY=your_api_key_here

# Database (Opsiyonel)
DB_PATH=./data/channels.json

# Filter Thresholds (Opsiyonel)
MIN_SUBSCRIBERS=10000
MAX_SUBSCRIBERS=500000
MAX_DAYS_SINCE_UPLOAD=30
MIN_VIDEO_DURATION_MINUTES=3
MIN_VIDEO_VIEWS=1000
SHORTS_THRESHOLD_PERCENTAGE=60

# Discovery (Opsiyonel)
DEFAULT_REGION_CODE=TR
DEFAULT_LANGUAGE=tr
MAX_RESULTS_PER_QUERY=50
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisans

MIT Lisansı. Detaylar için `LICENSE` dosyasına bakın.

## 🔗 Bağlantılar

- [YouTube Data API v3 Dokümantasyonu](https://developers.google.com/youtube/v3)
- [Google Cloud Console](https://console.cloud.google.com/)
- [LowDB Dokümantasyonu](https://github.com/typicode/lowdb)

## ❓ Sık Sorulan Sorular

**API key nasıl alınır?**
1. [Google Cloud Console](https://console.cloud.google.com/)'a g

---

**Made with ❤️ for Turkish Gaming Community**

## Çıktı Formatı (DB / JSON)

```json
{
  "channelId": "UCxxxx",
  "channelUrl": "https://youtube.com/channel/UCxxxx",
  "subscriberCount": 84200,
  "last6_views": [12000, 9000, 15000, 11000, 8000, 10000],
  "detected_games": ["Valorant", "CS2"],
  "quality_score": 82,
  "last_checked_at": "2025-12-21T23:10:00Z"
}
```
