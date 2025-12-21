# YouTube Analiz Aracı

Bu proje, belirlenen kriterlere göre YouTube üzerindeki oyun kanallarını otomatik olarak keşfeden, performanslarını analiz eden, kalite skorları hesaplayan ve sonuçları kaydeden bir yazılım sistemidir. Sistem; kanal aktifliği, izlenme performansı, içerik uygunluğu ve oyun odaklılık gibi metrikleri değerlendirerek kanalları tespit etmeyi amaçlar.

## Genel Akış (Pipeline)

Discovery → Filter → Analyze → Score → Save

- Kanal keşfi
- Hard filtreler (eleme)
- Video & kanal analizi
- Kalite skoru hesaplama
- DB'ye kaydetme
- (Opsiyonel) tekrar kontrol / güncelleme

## Kanal Keşfi (Discovery)

### API
- YouTube Data API v3

### 2 Yol Var (İkisi Birlikte Daha Güçlü)

#### A) Search Üzerinden Kanal Bulma
- `search.list`
- `type=channel`
- `q`: oyun isimleri, "gameplay", "let's play", "walkthrough", "oynuyorum" vs.
- TR modu: `regionCode=TR`, `relevanceLanguage=tr`

#### B) Video → Kanal Reverse Keşfi (Daha Kaliteli)
- Oyun keyword'leriyle video ara
- Videonun `channelId`'sini al
- Aynı kanalı bir kere işle (set ile)
- **Not:** Bu yöntem shorts ağırlıklı kanalları elemede daha iyi

## Hard Filtreler (Direkt Eleme)

Bunlar skora girmeden önce uygulanır.

### Kanal Seviyesi
- `subscriberCount`: 10.000 – 500.000
- `lastUploadDate` ≤ 30 gün
- Kanal dili / region uyumu (TR veya Global)

### Video Seviyesi (Son 6 Uzun Video)
- Uzun video tanımı: `duration` ≥ X dk (default 3 dk)
- Son 5–6 uzun videodan en az 4 tanesi ≥ 1.000 izlenme

### Shorts
- `duration` < 60sn olanları yok say
- Eğer son 10 videonun %60+'ı shorts → kanalı ele

## Analiz Katmanı

### Detected Games
3 kaynaktan çıkarılır:
- Video başlığı
- Video açıklaması
- Kanal açıklaması

#### Basit Başlangıç
- `["gta", "valorant", "cs2", "minecraft", "fortnite", ...]`

#### Gelişmiş
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

| Ratio     | Puan |
|-----------|------|
| ≥ 0.2     | 25   |
| 0.1 – 0.2 | 18   |
| 0.05 – 0.1| 12   |
| 0.02 – 0.05| 6    |
| < 0.02    | 0    |

### 3. Kanal Aktifliği (20 Puan)
Son video

| Süre     | Puan |
|----------|------|
| ≤ 7 gün  | 20   |
| ≤ 14 gün | 15   |
| ≤ 30 gün | 8    |
| > 30     | 0    |

### 4. Gaming Uygunluğu (25 Puan)
Rule-based başlat, sonra ML'ye evrilir.

| Kriter                          | Puan |
|---------------------------------|------|
| Kanal kategorisi = Gaming       | +8   |
| Oyun keyword başlık/açıklama    | +10  |
| Açıklamada oyun odaklı metin    | +7   |
| Max                             | 25   |

### Final Skor
```
quality_score = view_saglamligi + avg_view_score + activity_score + gaming_fit_score
```

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

## Teknoloji Önerisi

- Node.js
- googleapis
- dayjs
- PostgreSQL (sonra)