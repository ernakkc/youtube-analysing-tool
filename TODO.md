# TODO Listesi - YouTube Analiz Aracı

Bu dosya, YouTube analiz aracı projesinin geliştirme aşamalarını ve yapılacak görevleri içerir.

## Genel Görevler

- [ ] Proje yapısını kur (klasörler, temel dosyalar)
- [ ] YouTube Data API v3 entegrasyonu
- [ ] Veritabanı kurulumu (LowDB başlangıç, PostgreSQL geçiş)
- [ ] Temel pipeline implementasyonu (Discovery → Filter → Analyze → Score → Save)

## Kanal Keşfi (Discovery)

- [ ] Search API ile kanal bulma fonksiyonu
  - [ ] Oyun isimleri ve keyword'ler ile arama
  - [ ] TR modu desteği (regionCode=TR, relevanceLanguage=tr)
- [ ] Video → Kanal reverse keşfi
  - [ ] Oyun keyword'leriyle video arama
  - [ ] Channel ID'leri toplama ve duplicate kontrolü
- [ ] API rate limit yönetimi

## Hard Filtreler (Filter)

- [ ] Kanal seviyesi filtreler
  - [ ] Subscriber count kontrolü (10k-500k)
  - [ ] Son yükleme tarihi kontrolü (≤30 gün)
  - [ ] Dil/region uyumu kontrolü
- [ ] Video seviyesi filtreler
  - [ ] Uzun video tanımı (duration ≥3 dk)
  - [ ] İzlenme sayısı kontrolü (son 6 videoda ≥1k)
- [ ] Shorts filtreleme
  - [ ] Shorts yok sayma (<60sn)
  - [ ] Shorts oranı kontrolü (%60+ ise eleme)

## Analiz Katmanı (Analyze)

- [ ] Detected Games çıkarımı
  - [ ] Video başlığı analizi
  - [ ] Video açıklaması analizi
  - [ ] Kanal açıklaması analizi
  - [ ] Basit keyword listesi
  - [ ] Regex ve fuzzy match implementasyonu
  - [ ] Alias listesi (csgo→cs2, vb.)
- [ ] Ortalama izlenme/abone oranı hesaplama

## Kalite Skoru (Score)

- [ ] View sağlamlığı puanı (30 puan)
- [ ] Ortalama izlenme gücü puanı (25 puan)
- [ ] Kanal aktifliği puanı (20 puan)
- [ ] Gaming uygunluğu puanı (25 puan)
  - [ ] Rule-based başlangıç
  - [ ] ML entegrasyonu planı
- [ ] Final skor hesaplama

## Çıktı ve Saklama (Save)

- [ ] JSON formatı tanımlama
- [ ] LowDB ile yerel saklama
- [ ] PostgreSQL geçişi
- [ ] Güncelleme mekanizması

## Teknoloji ve Araçlar

- [ ] Node.js projesi kurulumu
- [ ] googleapis paketi entegrasyonu
- [ ] dayjs tarih işlemleri
- [ ] Test yazma
- [ ] Hata yönetimi ve logging

## Opsiyonel Özellikler

- [ ] Tekrar kontrol/güncelleme sistemi
- [ ] Web arayüzü
- [ ] Raporlama ve analitik