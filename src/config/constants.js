require('dotenv').config();

module.exports = {
  // YouTube API
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
  
  // Database
  DB_PATH: process.env.DB_PATH || './data/channels.json',
  
  // Filter thresholds
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
  
  // Discovery
  DISCOVERY: {
    DEFAULT_REGION_CODE: process.env.DEFAULT_REGION_CODE || 'TR',
    DEFAULT_LANGUAGE: process.env.DEFAULT_LANGUAGE || 'tr',
    MAX_RESULTS_PER_QUERY: parseInt(process.env.MAX_RESULTS_PER_QUERY) || 50
  },
  
  // Gaming keywords
  GAMING_KEYWORDS: [
    'gameplay', 'let\'s play', 'walkthrough', 'playthrough',
    'oynuyorum', 'oynanış', 'türkçe oyun', 'tam oyun',
    'gaming', 'gamer', 'video game', 'live gaming',
    'esports', 'e-spor', 'turnuva', 'rekabetçi oyun',
    'speedrun', 'hızlı oyun', 'challenge', 'meydan okuma'
  ],
  
  // Popular games
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
  
  // Game aliases
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
  
  // Scoring weights
  SCORING: {
    VIEW_RELIABILITY: 30,
    AVG_VIEW_POWER: 25,
    CHANNEL_ACTIVITY: 20,
    GAMING_FIT: 25
  }
};
