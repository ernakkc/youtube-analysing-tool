# Electron Masaüstü Uygulaması - Kullanım Kılavuzu

## 🎯 Müşteri Kullanımı

### 1️⃣ İlk Kurulum (Tek Seferlik)

#### Windows Kullanıcıları:
1. `dist/` klasöründen **YouTube Gaming Analyzer Setup.exe** dosyasını indirin
2. Çift tıklayın ve kurulum sihirbazını takip edin
3. Masaüstü kısayolu oluşturulacak

#### macOS Kullanıcıları:
1. `dist/` klasöründen **YouTube Gaming Analyzer.dmg** dosyasını indirin
2. DMG'yi açın ve uygulamayı **Applications** klasörüne sürükleyin
3. İlk açılışta "Güvenilmeyen geliştirici" uyarısı alabilirsiniz:
   - Sistem Tercihleri → Güvenlik → "Yine de Aç" butonuna tıklayın

### 2️⃣ Uygulamayı Başlatma

**Windows**: Başlat menüsünden veya masaüstü kısayolundan açın
**macOS**: Applications klasöründen açın veya Spotlight'ta arayın

### 3️⃣ İlk Yapılandırma

#### a) Ayarlar Sekmesi

1. **🔑 API Anahtarları**
   - Google Cloud Console'dan aldığınız YouTube API key'i yapıştırın
   - Çoklu key kullanmak için "+ API Key Ekle" butonuna tıklayın
   - Her key günlük 10,000 quota sağlar

2. **🎯 Filtre Ayarları**
   ```
   Min. Abone: 10,000 (varsayılan)
   Max. Abone: 500,000 (varsayılan)
   Max. Gün: 30 (son 30 günde video yüklemiş)
   Min. Video Süresi: 3 dakika
   Min. İzlenme: 1,000
   Shorts Eşiği: %60 (shorts oranı bu değeri geçmemeli)
   ```

3. **🌍 Keşif Ayarları**
   - Bölge: TR (Türkiye)
   - Dil: tr (Türkçe)
   - Max Sonuç: 50

4. **⏱️ Bekleme Süreleri** (API rate limit için)
   - Sorgular Arası: 5 saniye (varsayılan)
   - Kanallar Arası: 1 saniye (varsayılan)
   - API Hata Sonrası: 3 saniye (varsayılan)
   - İsteğe bağlı ayarlayabilirsiniz

5. **🎮 Oyun Listesi**
   - Aramak istediğiniz oyunları virgülle ayırarak girin
   - Örnek: `gta, valorant, cs2, minecraft, fortnite`

6. **💾 Kaydet** butonuna tıklayın

### 4️⃣ Analiz Çalıştırma

#### b) Analiz Sekmesi

1. **🔍 Arama Sorguları** alanına her satıra bir sorgu girin:
   ```
   gta 5 türkçe
   valorant türkçe
   cs2 gameplay
   minecraft survival türkçe
   ```

2. **🚀 Analizi Başlat** butonuna tıklayın

3. **Real-time Takip**:
   - İlerleme çubuğu güncel durumu gösterir
   - Log ekranında detaylı işlem adımları görünür
   - Bulunan her kanal anlık olarak kaydedilir

4. İsterseniz **⏹️ Durdur** ile analizi durdurabilirsiniz

### 5️⃣ Sonuçları İnceleme

#### c) Sonuçlar Sekmesi

- **Kanal Kartları**: Her kanal için:
  - Kanal adı ve kalite skoru (0-100)
  - Abone sayısı ve ortalama izlenme
  - 📧 **Email adresleri** (kanal ve video açıklamalarından otomatik toplanan)
    - Email'e tıklayarak varsayılan mail uygulaması ile mesaj gönderebilirsiniz
  - Skorların detaylı dağılımı (View Reliability, Avg View Power, Activity, Gaming Fit)
  - Tespit edilen oyunlar (etiket olarak)
  - "Kanalı Aç →" linki ile YouTube'da görüntüleme

- **Araç Çubuğu**:
  - 🔄 **Yenile**: Veritabanındaki tüm kanalları tekrar yükle
  - 📥 **CSV İndir**: Sonuçları Excel'de açılabilir formatta indir (email sütunu dahil)
  - 📥 **JSON İndir**: Ham veri formatında indir
  - ⬇️ **Skorla Sırala**: En yüksek skordan en düşüğe
  - 🗑️ **Tümünü Sil**: Tüm sonuçları veritabanından sil (onay gerektirir)

## 🔧 Gelişmiş Özellikler

### Çoklu API Key Stratejisi

Uygulamaotomatik olarak key'leri rotate eder:
- İlk key quota'sı tükenir → Otomatik 2. key'e geçer
- Tüm key'ler tükenir → Sıfırlama mesajı gösterir
- Her analizin sonunda API kullanım istatistikleri gösterilir

### Email Toplama

Sistem otomatik olarak email toplar:
- **Kanal açıklamalarından** (About sekmesi)
- **Son 10 video açıklamalarından**
- Duplicate'ler otomatik temizlenir
- False-positive filtreleme (`.png`, `.jpg` dosya uzantıları hariç tutulur)

**Not:** YouTube API üzerinden sadece public description alanlarına erişilebilir. "View email address" butonu arkasındaki emailler API'de bulunmaz.

### Veri Saklama

- **Ayarlar**: Uygulama kapansa bile korunur
- **Kanallar**: `data/channels.json` dosyasında saklanır
- **Güncelleme**: Aynı kanal tekrar bulunursa verileri güncellenir

### Performans İpuçları

1. **Hızlı Analiz**:
   - Az sorgu kullanın (3-5 sorgu yeterli)
   - Max Results değerini 25-50 arası tutun

2. **Kapsamlı Analiz**:
   - Daha fazla sorgu ekleyin (10-15)
   - Çoklu API key kullanın
   - Max Results'u 50'ye çıkarın

3. **Quota Yönetimi**:
   - Her kanal ~100 unit harcar
   - 1 key = günlük 10,000 unit
   - 3 key ile ~300 kanal/gün analiz edebilirsiniz

## ❓ Sık Sorulan Sorular

**S: YouTube API key'i nasıl alırım?**
C: 
1. [Google Cloud Console](https://console.cloud.google.com/) açın
2. Yeni proje oluşturun
3. "YouTube Data API v3" etkinleştirin
4. Credentials → API Key oluşturun

**S: Uygulama çalışmıyor/açılmıyor?**
C:
- Windows: Windows Defender'dan izin verin
- macOS: Sistem Tercihleri → Güvenlik'ten izin verin

**S: "API quota exceeded" hatası alıyorum?**
C: 
- Günlük limit tükendi, yeni API key ekleyin
- Ya da ertesi gün tekrar deneyin (quota sıfırlanır)

**S: Sonuçlar kaydedilmiyor?**
C:
- `data/` klasörünün yazma izni olduğundan emin olun
- Uygulamayı yönetici olarak çalıştırmayı deneyin

**S: Çok az kanal buluyor?**
C:
- Filtre ayarlarını gevşetin (min abone azalt, max abone artır)
- Daha spesifik arama sorguları kullanın
- Bölge/dil ayarlarını kontrol edin

## 📞 Destek

Sorun bildirimi: issues kısmından bildirebilirsiniz
