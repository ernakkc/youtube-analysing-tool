# TODO Listesi - YouTube Analiz Aracı

Bu dosya, YouTube analiz aracı projesinin geliştirme aşamalarını ve yapılacak görevleri içerir.

## Genel Görevler

- [x] Proje yapısını kur (klasörler, temel dosyalar)
- [x] YouTube Data API v3 entegrasyonu
- [x] Veritabanı kurulumu (LowDB başlangıç, PostgreSQL geçiş)
- [x] Temel pipeline implementasyonu (Discovery → Filter → Analyze → Score → Save)

## Kanal Keşfi (Discovery)

- [x] Search API ile kanal bulma fonksiyonu
  - [x] Oyun isimleri ve keyword'ler ile arama
  - [x] TR modu desteği (regionCode=TR, relevanceLanguage=tr)
- [x] Video → Kanal reverse keşfi
  - [x] Oyun keyword'leriyle video arama
  - [x] Channel ID'leri toplama ve duplicate kontrolü
- [x] API rate limit yönetimi (basit delay mekanizması)

## Hard Filtreler (Filter)

- [x] Kanal seviyesi filtreler
  - [x] Subscriber count kontrolü (10k-500k)
  - [x] Son yükleme tarihi kontrolü (≤30 gün)
  - [x] Dil/region uyumu kontrolü
- [x] Video seviyesi filtreler
  - [x] Uzun video tanımı (duration ≥3 dk)
  - [x] İzlenme sayısı kontrolü (son 6 videoda ≥1k)
- [x] Shorts filtreleme
  - [x] Shorts yok sayma (<60sn)
  - [x] Shorts oranı kontrolü (%60+ ise eleme)

## Analiz Katmanı (Analyze)

- [x] Detected Games çıkarımı
  - [x] Video başlığı analizi
  - [x] Video açıklaması analizi
  - [x] Kanal açıklaması analizi
  - [x] Basit keyword listesi
  - [ ] Regex ve fuzzy match implementasyonu (gelişmiş)
  - [x] Alias listesi (csgo→cs2, vb.)
- [x] Ortalama izlenme/abone oranı hesaplama

## Kalite Skoru (Score)

- [x] View sağlamlığı puanı (30 puan)
- [x] Ortalama izlenme gücü puanı (25 puan)
- [x] Kanal aktifliği puanı (20 puan)
- [x] Gaming uygunluğu puanı (25 puan)
  - [x] Rule-based başlangıç
  - [ ] ML entegrasyonu planı
- [x] Final skor hesaplama

## Çıktı ve Saklama (Save)

- [x] JSON formatı tanımlama
- [x] LowDB ile yerel saklama
- [x] Güncelleme mekanizması

## Teknoloji ve Araçlar

- [x] Node.js projesi kurulumu
- [x] googleapis paketi entegrasyonu
- [x] dayjs tarih işlemleri
- [ ] Hata yönetimi ve logging (gelişmiş)

## Opsiyonel Özellikler

- [ ] Tekrar kontrol/güncelleme sistemi
- [ ] Web arayüzü
- [ ] Raporlama ve analitik