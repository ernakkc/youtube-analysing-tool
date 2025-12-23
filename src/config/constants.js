// .env dosyası varsa yükle (CLI modu için), yoksa devam et (Electron modu)
try {
  require('dotenv').config();
} catch (error) {
  // Electron modunda .env olmayabilir, bu normal
}

// Çoklu API anahtarlarını environment'tan ayrıştır
function parseApiKeys() {
  console.log('🔍 [constants.js] parseApiKeys() çağrıldı');
  console.log('🔍 [constants.js] process.env.YOUTUBE_API_KEY:', process.env.YOUTUBE_API_KEY ? `✅ MEVCUT (${process.env.YOUTUBE_API_KEY.length} karakter)` : '❌ YOK');
  
  const keys = [];
  
  // Tek anahtar desteği (geriye dönük uyumluluk)
  if (process.env.YOUTUBE_API_KEY) {
    keys.push(process.env.YOUTUBE_API_KEY);
    console.log('🔍 [constants.js] YOUTUBE_API_KEY eklendi:', process.env.YOUTUBE_API_KEY.substring(0, 10) + '...');
  }
  
  // Çoklu anahtar desteği (YOUTUBE_API_KEY_1, YOUTUBE_API_KEY_2, vb.)
  let i = 1;
  while (process.env[`YOUTUBE_API_KEY_${i}`]) {
    keys.push(process.env[`YOUTUBE_API_KEY_${i}`]);
    console.log(`🔍 [constants.js] YOUTUBE_API_KEY_${i} eklendi:`, process.env[`YOUTUBE_API_KEY_${i}`].substring(0, 10) + '...');
    i++;
  }
  
  console.log(`🔍 [constants.js] Toplam ${keys.length} anahtar bulundu`);
  return keys.length > 0 ? keys : null;
}

module.exports = {
  // YouTube API - Çoklu anahtar desteği
  YOUTUBE_API_KEYS: parseApiKeys(),
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY, // Geriye dönük uyumluluk
  
  // Veritabanı
  DB_PATH: process.env.DB_PATH || './data/channels.json',
  
  // Filtre eşikleri
  FILTERS: {
    MIN_SUBSCRIBERS: parseInt(process.env.MIN_SUBSCRIBERS) || 10000,
    MAX_SUBSCRIBERS: parseInt(process.env.MAX_SUBSCRIBERS) || 500000,
    MAX_DAYS_SINCE_UPLOAD: parseInt(process.env.MAX_DAYS_SINCE_UPLOAD) || 30,
    MIN_VIDEO_DURATION_MINUTES: parseInt(process.env.MIN_VIDEO_DURATION_MINUTES) || 3,
    MIN_VIDEO_VIEWS: parseInt(process.env.MIN_VIDEO_VIEWS) || 1000,
    SHORTS_DURATION_SECONDS: 60,
    SHORTS_THRESHOLD_PERCENTAGE: parseInt(process.env.SHORTS_THRESHOLD_PERCENTAGE) || 60,
    MIN_LONG_VIDEOS_WITH_VIEWS: 4,
    TOTAL_VIDEOS_TO_CHECK: 6
  },
  
  // Keşif ayarları
  DISCOVERY: {
    DEFAULT_REGION_CODE: process.env.DEFAULT_REGION_CODE || 'TR',
    DEFAULT_LANGUAGE: process.env.DEFAULT_LANGUAGE || 'tr',
    MAX_RESULTS_PER_QUERY: parseInt(process.env.MAX_RESULTS_PER_QUERY) || 50
  },
  
  // Bekleme süreleri (milisaniye)
  DELAYS: {
    BETWEEN_QUERIES: parseInt(process.env.DELAY_BETWEEN_QUERIES) || 5000,     // Sorgular arası (varsayılan: 5 saniye)
    BETWEEN_CHANNELS: parseInt(process.env.DELAY_BETWEEN_CHANNELS) || 1000,   // Kanallar arası (varsayılan: 1 saniye)
    AFTER_API_ERROR: parseInt(process.env.DELAY_AFTER_API_ERROR) || 3000      // API hatası sonrası (varsayılan: 3 saniye)
  },
  
  // Oyun anahtar kelimeleri
  GAMING_KEYWORDS: [
    'gameplay', 'let\'s play', 'walkthrough', 'playthrough',
    'oynuyorum', 'oynanış', 'türkçe oyun', 'tam oyun',
    'gaming', 'gamer', 'video game', 'live gaming',
    'esports', 'e-spor', 'turnuva', 'rekabetçi oyun',
    'speedrun', 'hızlı oyun', 'challenge', 'meydan okuma'
  ],
  
  // Oyun isimleri
  GAMES: [
    'gta', 'gta5', 'gta 5', 'grand theft auto',
    'valorant', 'cs2', 'cs:2', 'counter strike',
    'minecraft', 'fortnite', 'apex legends',
    'league of legends', 'lol', 'pubg',
    'call of duty', 'cod', 'warzone',
    'fifa', 'fc 24', 'pes', 'efootball',
    'roblox', 'among us', 'fall guys',
    'dota 2', 'overwatch', 'rocket league',
    'the sims', 'assassin\'s creed', 'cyberpunk 2077',
    'witcher 3', 'red dead redemption', 'rdr2',
    'halo', 'destiny 2', 'battlefield', 'battlefield 2042',
    'forza horizon', 'need for speed', 'the last of us',
    'ghost of tsushima', 'dark souls', 'elden ring'
  ],
  
  // Oyun takma adları
  GAME_ALIASES: {
    'csgo': 'cs2',
    'cs:go': 'cs2',
    'gta v': 'gta5',
    'gta 5': 'gta5',
    'fifa 23': 'fifa',
    'fifa 24': 'fifa',
    'efootball 2024': 'fifa',
    'apex': 'apex legends',
    'rdr': 'red dead redemption',
    'rdr 2': 'red dead redemption',
    'cod warzone': 'call of duty',
    'valorant mobile': 'valorant'
  },
  
  // Puanlama ağırlıkları
  SCORING: {
    VIEW_RELIABILITY: 30, // görüntüleme güvenilirliği
    AVG_VIEW_POWER: 25, // ortalama izlenme gücü
    CHANNEL_ACTIVITY: 20, // kanal etkinliği
    GAMING_FIT: 25 // oyun uyumu
  }
};
