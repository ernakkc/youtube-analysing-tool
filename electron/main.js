const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Backend modüllerini import et
const { 
  searchChannels, 
  searchVideosForChannels,
  getChannelDetails,
  getRecentVideos,
  getVideoDetails
} = require('../src/services/youtubeService');
const { applyHardFilters } = require('../src/filters/channelFilters');
const { analyzeGamingContent } = require('../src/analyzers/gameDetector');
const { calculateQualityScore } = require('../src/scoring/qualityScore');
const { saveChannel, getAllChannels, clearAllChannels } = require('../src/services/dbService');

// ApiKeyManager'ı dinamik yüklemek için path
const apiKeyManagerPath = path.resolve(__dirname, '../src/services/apiKeyManager.js');

/**
 * Fresh ApiKeyManager al - API key'leri direkt process.env'den geçerek
 */
function getFreshApiKeyManager() {
  // process.env'den API key'leri topla
  const apiKeys = [];
  
  if (process.env.YOUTUBE_API_KEY) {
    apiKeys.push(process.env.YOUTUBE_API_KEY);
  }
  
  // Çoklu anahtar desteği
  let i = 1;
  while (process.env[`YOUTUBE_API_KEY_${i}`]) {
    // Aynı key'i tekrar ekleme (deduplicate)
    if (!apiKeys.includes(process.env[`YOUTUBE_API_KEY_${i}`])) {
      apiKeys.push(process.env[`YOUTUBE_API_KEY_${i}`]);
    }
    i++;
  }
  
  if (apiKeys.length === 0) {
    throw new Error('process.env\'de YouTube API anahtarı bulunamadı!');
  }
  
  // Singleton'ı sıfırla ve yeni instance oluştur
  const apiKeyManagerModule = require('../src/services/apiKeyManager');
  apiKeyManagerModule.resetApiKeyManager();
  
  const manager = apiKeyManagerModule.getApiKeyManager(apiKeys);
  console.log('✅ ApiKeyManager initialized with', apiKeys.length, 'key(s)');
  
  return manager;
}

let mainWindow;
let analysisInProgress = false;
let shouldStopAnalysis = false;

/**
 * Varsayılan config yapısı
 */
function getDefaultConfig() {
  return {
    apiKeys: [],
    filters: {
      minSubscribers: 10000,
      maxSubscribers: 500000,
      maxDaysSinceUpload: 30,
      minVideoDuration: 3,
      minVideoViews: 1000,
      shortsThreshold: 60
    },
    discovery: {
      regionCode: 'TR',
      language: 'tr',
      maxResults: 50
    },
    delays: {
      betweenQueries: 5000,
      betweenChannels: 1000,
      afterApiError: 3000
    },
    games: [
      'gta', 'gta5', 'valorant', 'cs2', 'minecraft', 'fortnite',
      'apex legends', 'league of legends', 'lol', 'pubg',
      'call of duty', 'fifa', 'roblox'
    ],
    searchQueries: 'gta 5 türkçe\nvalorant türkçe\ncs2 gameplay türkçe\nminecraft survival türkçe'
  };
}

/**
 * Config dosyasını validate et
 */
function validateConfig(config) {
  try {
    // Temel yapı kontrolü
    if (!config || typeof config !== 'object') return false;
    if (!Array.isArray(config.apiKeys)) return false;
    if (!config.filters || typeof config.filters !== 'object') return false;
    if (!config.discovery || typeof config.discovery !== 'object') return false;
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Config path'i al
 */
function getConfigPath() {
  const userDataPath = app.getPath('userData');
  // userData klasörünü oluştur (yoksa)
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }
  return path.join(userDataPath, 'config.json');
}

/**
 * Başlangıçta config'i yükle ve environment variables'ı set et
 */
async function loadInitialConfig() {
  const configPath = getConfigPath();
  
  try {
    let settings = null;
    
    // Config dosyası var mı?
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      settings = JSON.parse(data);
      
      // Validate et
      if (!validateConfig(settings)) {
        fs.unlinkSync(configPath); // Hatalı config'i sil
        settings = null;
      }
    }
    
    // Config yoksa veya hatalıysa, varsayılan oluştur
    if (!settings) {
      settings = getDefaultConfig();
      fs.writeFileSync(configPath, JSON.stringify(settings, null, 2));
    }
    
    // Environment variables'ı set et
    updateEnvironmentVariables(settings);
    
    if (settings.apiKeys && settings.apiKeys.length > 0 && settings.apiKeys[0]) {
      console.log('✅ Config loaded with', settings.apiKeys.length, 'API key(s)');
    } else {
      console.log('⚠️  No API keys found. Please add in Settings tab.');
    }
    
  } catch (error) {
    console.error('❌ ERROR loading config:', error);
    console.error('Stack:', error.stack);
    // Hata durumunda varsayılan config oluştur
    try {
      const defaultConfig = getDefaultConfig();
      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
      updateEnvironmentVariables(defaultConfig);
      console.log('✅ Default config created after error');
    } catch (createError) {
      console.error('❌ FATAL: Cannot create default config:', createError);
    }
  }
}

/**
 * Ana pencereyi oluştur
 */
function createWindow() {
  // Platform-specific icon
  const iconPath = process.platform === 'darwin' 
    ? path.join(__dirname, 'assets', 'icon.icns')
    : process.platform === 'win32'
    ? path.join(__dirname, 'assets', 'icon.ico')
    : path.join(__dirname, 'assets', 'icon.png');
    
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: iconPath,
    title: 'YouTube Gaming Channel Analyzer'
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Geliştirme modunda DevTools aç
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await loadInitialConfig();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// ==================== IPC Handlers ====================

/**
 * Ayarları yükle
 */
ipcMain.handle('load-settings', async () => {
  try {
    const configPath = getConfigPath();
    
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      const settings = JSON.parse(data);
      
      // Validate et
      if (validateConfig(settings)) {
        return settings;
      } else {
        console.log('⚠️  Config yapısı hatalı, varsayılan dönüyor');
        return getDefaultConfig();
      }
    }
    
    // Config yoksa varsayılanı döndür
    return getDefaultConfig();
  } catch (error) {
    console.error('Ayarlar yüklenirken hata:', error);
    return getDefaultConfig();
  }
});

/**
 * Ayarları kaydet
 */
ipcMain.handle('save-settings', async (event, settings) => {
  try {
    const configPath = getConfigPath();
    
    // Validate et
    if (!validateConfig(settings)) {
      return { success: false, error: 'Geçersiz ayar yapısı' };
    }
    
    fs.writeFileSync(configPath, JSON.stringify(settings, null, 2));
    
    // Environment variables'ı güncelle
    updateEnvironmentVariables(settings);
    
    // Güncel değerleri logla (Debug için)
    console.log('✅ Settings saved successfully');
    console.log('📌 Updated filters:', {
      minSub: process.env.MIN_SUBSCRIBERS,
      maxSub: process.env.MAX_SUBSCRIBERS,
      maxDays: process.env.MAX_DAYS_SINCE_UPLOAD,
      minViews: process.env.MIN_VIDEO_VIEWS
    });
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error saving settings:', error);
    console.error('Stack:', error.stack);
    return { success: false, error: error.message };
  }
});

/**
 * Environment variables'ı güncelle
 */
function updateEnvironmentVariables(settings) {
  // API Keys - hem YOUTUBE_API_KEY_1, _2 hem de YOUTUBE_API_KEY set et
  if (settings.apiKeys && settings.apiKeys.length > 0) {
    
    // İlk key'i YOUTUBE_API_KEY olarak da set et (backward compatibility)
    const firstValidKey = settings.apiKeys.find(k => k && k.trim());
    if (firstValidKey) {
      process.env.YOUTUBE_API_KEY = firstValidKey;
      console.log('✅ YOUTUBE_API_KEY set (length:', firstValidKey.length, ')');
    } else {
      console.log('⚠️  No valid API key found in array');
    }
    
    // Her key'i numaralı olarak set et
    settings.apiKeys.forEach((key, index) => {
      if (key && key.trim()) {
        process.env[`YOUTUBE_API_KEY_${index + 1}`] = key;
        console.log(`✅ YOUTUBE_API_KEY_${index + 1} set (length: ${key.length})`);
      }
    });
  } else {
    console.log('⚠️  No API keys in settings');
  }
  
  // Filters - null check ekle
  if (settings.filters) {
    process.env.MIN_SUBSCRIBERS = (settings.filters.minSubscribers || 10000).toString();
    process.env.MAX_SUBSCRIBERS = (settings.filters.maxSubscribers || 500000).toString();
    process.env.MAX_DAYS_SINCE_UPLOAD = (settings.filters.maxDaysSinceUpload || 30).toString();
    process.env.MIN_VIDEO_DURATION_MINUTES = (settings.filters.minVideoDuration || 3).toString();
    process.env.MIN_VIDEO_VIEWS = (settings.filters.minVideoViews || 1000).toString();
    process.env.SHORTS_THRESHOLD_PERCENTAGE = (settings.filters.shortsThreshold || 60).toString();
  }
  
  // Discovery - null check ekle
  if (settings.discovery) {
    process.env.DEFAULT_REGION_CODE = settings.discovery.regionCode || 'TR';
    process.env.DEFAULT_LANGUAGE = settings.discovery.language || 'tr';
    process.env.MAX_RESULTS_PER_QUERY = (settings.discovery.maxResults || 50).toString();
  }
  
  // Delays - null check ekle
  if (settings.delays) {
    process.env.DELAY_BETWEEN_QUERIES = (settings.delays.betweenQueries || 5000).toString();
    process.env.DELAY_BETWEEN_CHANNELS = (settings.delays.betweenChannels || 1000).toString();
    process.env.DELAY_AFTER_API_ERROR = (settings.delays.afterApiError || 3000).toString();
  }
}

/**
 * Analizi başlat
 */
ipcMain.handle('start-analysis', async (event, queries) => {
  if (analysisInProgress) {
    return { success: false, error: 'Analiz zaten çalışıyor' };
  }
  
  // Config'i tekrar yükle ve environment variables'ı güncelle
  try {
    const configPath = getConfigPath();
    
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      const settings = JSON.parse(data);
      updateEnvironmentVariables(settings);
    }
  } catch (error) {
    console.error('❌ Error reloading config:', error);
  }
  
  // API key kontrolü
  if (!process.env.YOUTUBE_API_KEY && !process.env.YOUTUBE_API_KEY_1) {
    sendLog('error', '❌ YouTube API anahtarı bulunamadı!');
    sendLog('warning', '⚠️  Lütfen Settings sekmesinden en az 1 API key ekleyin ve Kaydet butonuna tıklayın.');
    return { 
      success: false, 
      error: 'API anahtarı bulunamadı. Settings sekmesinden API key ekleyin.' 
    };
  }

  analysisInProgress = true;
  shouldStopAnalysis = false; // Reset stop flag
  
  try {
    sendLog('info', '🚀 Analiz başlatıldı...');
    
    // Güncel filtre değerlerini logla
    const { FILTERS, DISCOVERY, DELAYS } = require('../src/config/constants');
    sendLog('info', `📌 Filtreler: ${FILTERS.MIN_SUBSCRIBERS}-${FILTERS.MAX_SUBSCRIBERS} abone, max ${FILTERS.MAX_DAYS_SINCE_UPLOAD} gün, min ${FILTERS.MIN_VIDEO_VIEWS} görüntüleme`);
    sendLog('info', `📌 Keşif: ${DISCOVERY.DEFAULT_REGION_CODE}/${DISCOVERY.DEFAULT_LANGUAGE}, max ${DISCOVERY.MAX_RESULTS_PER_QUERY} sonuç`);
    
    // API Key Manager bilgisini gönder - Fresh instance al
    const apiKeyManager = getFreshApiKeyManager();
    const stats = apiKeyManager.getStats();
    sendLog('info', `📌 API Anahtar Yöneticisi ${stats.totalKeys} anahtar ile başlatıldı`);
    
    // Kanal keşfi
    sendLog('info', `🔍 Kanal keşfi başladı (${queries.length} sorgu)...`);
    const channelIds = new Set();
    
    for (const query of queries) {
      if (shouldStopAnalysis) {
        sendLog('warning', '⚠️  Analiz durduruldu (keşif aşaması)');
        break;
      }
      
      sendLog('info', `   Aranan: "${query}"`);
      
      // Doğrudan kanal arama
      const channels = await searchChannels(query);
      channels.forEach(ch => channelIds.add(ch.channelId));
      
      // Video bazlı keşif
      const videoChannels = await searchVideosForChannels(query);
      videoChannels.forEach(chId => channelIds.add(chId));
    }
    
    if (shouldStopAnalysis) {
      analysisInProgress = false;
      return { success: false, stopped: true, message: 'Analiz durduruldu' };
    }
    
    sendLog('success', `✅ ${channelIds.size} benzersiz kanal bulundu`);
    
    // Her kanalı işle
    let processedCount = 0;
    let passedCount = 0;
    
    for (const channelId of channelIds) {
      if (shouldStopAnalysis) {
        sendLog('warning', `⚠️  Analiz durduruldu (${processedCount}/${channelIds.size} kanal işlendi)`);
        break;
      }
      
      const result = await processChannel(channelId);
      processedCount++;
      
      if (result) {
        passedCount++;
        sendChannelResult(result);
      }
      
      // İlerleme güncelle
      mainWindow.webContents.send('analysis-progress', {
        current: processedCount,
        total: channelIds.size,
        percentage: Math.round((processedCount / channelIds.size) * 100)
      });
    }
    
    // API Key istatistikleri
    const finalStats = apiKeyManager.getStats();
    sendLog('info', `📊 API Kullanım İstatistikleri:`);
    sendLog('info', `   Toplam anahtar: ${finalStats.totalKeys}`);
    sendLog('info', `   Başarısız anahtar: ${finalStats.failedKeys}`);
    sendLog('info', `   Aktif anahtar: #${finalStats.currentIndex + 1}`);
    
    sendLog('success', `✅ Analiz tamamlandı! ${passedCount}/${processedCount} kanal filtreleri geçti`);
    
    analysisInProgress = false;
    return { success: true, processed: processedCount, passed: passedCount };
    
  } catch (error) {
    // Quota hatası özel durumu
    if (error.message.includes('TÜM API ANAHTARLARI TÜKENDİ') || error.message.includes('All API keys exhausted')) {
      sendLog('error', '❌ TÜM API ANAHTARLARI TÜKENDİ');
      sendLog('error', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      sendLog('warning', '📊 YouTube API Günlük Kota: 10,000 birim/anahtar');
      sendLog('info', '');
      sendLog('info', '💡 ÇÖZÜMLER:');
      sendLog('info', '   1️⃣ Yarın tekrar deneyin (00:00 PST\'de sıfırlanır)');
      sendLog('info', '   2️⃣ Settings\'den daha fazla API key ekleyin');
      sendLog('info', '   3️⃣ Arama sorgularını azaltın veya spesifik yapın');
      sendLog('info', '   4️⃣ Delay sürelerini artırarak kota tasarrufu yapın');
      sendLog('info', '');
      sendLog('info', '🔗 Yeni API key almak için:');
      sendLog('info', '   https://console.cloud.google.com/apis/credentials');
      sendLog('error', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } else {
      sendLog('error', `❌ Hata: ${error.message}`);
    }
    
    analysisInProgress = false;
    return { success: false, error: error.message };
  }
});

/**
 * Tek bir kanalı işle
 */
async function processChannel(channelId) {
  if (shouldStopAnalysis) {
    return null;
  }
  
  try {
    sendLog('info', `\n📺 İşleniyor: ${channelId}`);
    
    // 1. Kanal detayları
    const channelDetails = await getChannelDetails(channelId);
    sendLog('info', `   ${channelDetails.title} (${channelDetails.subscriberCount} abone)`);
    
    // Email varsa göster
    if (channelDetails.emails && channelDetails.emails.length > 0) {
      sendLog('info', `   📧 Email: ${channelDetails.emails.join(', ')}`);
    }
    
    // 2. Son videolar
    const videoIds = await getRecentVideos(channelDetails.uploadsPlaylistId, 10);
    const recentVideos = await getVideoDetails(videoIds);
    
    const lastUploadDate = recentVideos.length > 0 ? recentVideos[0].publishedAt : null;
    
    // Collect emails from videos and merge with channel emails
    const allEmails = new Set(channelDetails.emails || []);
    recentVideos.forEach(video => {
      if (video.emails && video.emails.length > 0) {
        video.emails.forEach(email => allEmails.add(email));
      }
    });
    
    const channelData = {
      ...channelDetails,
      emails: Array.from(allEmails),
      recentVideos,
      lastUploadDate
    };
    
    // 3. Hard filtreler
    const filterResult = await applyHardFilters(channelData);
    
    if (!filterResult.pass) {
      sendLog('warning', `   ❌ Filtrelendi: ${filterResult.reasons.join(', ')}`);
      return null;
    }
    
    sendLog('success', `   ✅ Filtreleri geçti`);
    
    // 4. Oyun analizi
    const gamingAnalysis = analyzeGamingContent(channelData);
    sendLog('info', `   🎮 Oyunlar: ${gamingAnalysis.detectedGames.join(', ') || 'yok'}`);
    
    // 5. Kalite skoru
    const scoreResult = calculateQualityScore(channelData, gamingAnalysis);
    sendLog('info', `   ⭐ Skor: ${scoreResult.total}/100`);
    
    // 6. Veritabanına kaydet
    const finalData = {
      channelId: channelDetails.channelId,
      channelUrl: `https://youtube.com/channel/${channelDetails.channelId}`,
      title: channelDetails.title,
      subscriberCount: channelDetails.subscriberCount,
      emails: channelDetails.emails || [],
      last6Views: recentVideos.slice(0, 6).map(v => v.viewCount),
      detectedGames: gamingAnalysis.detectedGames,
      qualityScore: scoreResult.total,
      scoreBreakdown: scoreResult.breakdown,
      metrics: scoreResult.metrics,
      lastCheckedAt: new Date().toISOString()
    };
    
    await saveChannel(finalData);
    sendLog('success', `   💾 Kaydedildi`);
    
    return finalData;
    
  } catch (error) {
    sendLog('error', `   ⚠️  Hata: ${error.message}`);
    return null;
  }
}

/**
 * Kaydedilmiş kanalları getir
 */
ipcMain.handle('get-saved-channels', async () => {
  try {
    const channels = await getAllChannels();
    console.log(`📊 Veritabanından ${channels.length} kanal yüklendi`);
    return channels;
  } catch (error) {
    console.error('❌ Kanallar alınırken hata:', error);
    console.error('Hata detayı:', error.stack);
    return [];
  }
});

/**
 * Log mesajı gönder
 */
function sendLog(type, message) {
  if (mainWindow) {
    mainWindow.webContents.send('analysis-log', { type, message });
  }
}

/**
 * Kanal sonucu gönder
 */
function sendChannelResult(channel) {
  if (mainWindow) {
    mainWindow.webContents.send('channel-found', channel);
  }
}

/**
 * Analizi durdur
 */
ipcMain.handle('stop-analysis', async () => {
  shouldStopAnalysis = true;
  sendLog('warning', '⏹️  Durdurma isteği alındı, işlem tamamlanıyor...');
  return { success: true };
});

/**
 * Tüm sonuçları sil
 */
ipcMain.handle('clear-all-channels', async () => {
  try {
    console.log('Clearing all channels...');
    await clearAllChannels();
    console.log('Channels cleared successfully');
    sendLog('success', '🗑️  Tüm sonuçlar silindi');
    
    // Sonuçları da gönder (boş array)
    mainWindow.webContents.send('channels-cleared');
    
    return { success: true };
  } catch (error) {
    console.error('Error clearing channels:', error);
    sendLog('error', `❌ Sonuçlar silinirken hata: ${error.message}`);
    return { success: false, error: error.message };
  }
});

/**
 * CSV dosyası kaydet
 */
ipcMain.handle('save-csv', async (event, csvContent) => {
  try {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'CSV Dosyasını Kaydet',
      defaultPath: path.join(app.getPath('downloads'), `youtube-channels-${new Date().toISOString().split('T')[0]}.csv`),
      filters: [
        { name: 'CSV Dosyası', extensions: ['csv'] },
        { name: 'Tüm Dosyalar', extensions: ['*'] }
      ]
    });
    
    if (filePath) {
      fs.writeFileSync(filePath, csvContent, 'utf8');
      return { success: true, path: filePath };
    }
    
    return { success: false, cancelled: true };
  } catch (error) {
    console.error('CSV kayıt hatası:', error);
    return { success: false, error: error.message };
  }
});

/**
 * JSON dosyası kaydet
 */
ipcMain.handle('save-json', async (event, jsonContent) => {
  try {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'JSON Dosyasını Kaydet',
      defaultPath: path.join(app.getPath('downloads'), `youtube-channels-${new Date().toISOString().split('T')[0]}.json`),
      filters: [
        { name: 'JSON Dosyası', extensions: ['json'] },
        { name: 'Tüm Dosyalar', extensions: ['*'] }
      ]
    });
    
    if (filePath) {
      fs.writeFileSync(filePath, jsonContent, 'utf8');
      return { success: true, path: filePath };
    }
    
    return { success: false, cancelled: true };
  } catch (error) {
    console.error('JSON kayıt hatası:', error);
    return { success: false, error: error.message };
  }
});
