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
- **macOS**: `~/Library/Application Support/YouTube Gaming Analyzer/config.json`
- **Windows**: `%APPDATA%/YouTube Gaming Analyzer/config.json`
- **Linux**: `~/.config/YouTube Gaming Analyzer/config.json`

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
