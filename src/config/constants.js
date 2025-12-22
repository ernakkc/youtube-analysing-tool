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
    'oynuyorum', 'oynanış', 'türkçe oyun'
  ],
  
  // Popular games
  GAMES: [
    'gta', 'gta5', 'gta 5', 'grand theft auto',
    'valorant', 'cs2', 'cs:2', 'counter strike',
    'minecraft', 'fortnite', 'apex legends',
    'league of legends', 'lol', 'pubg',
    'call of duty', 'cod', 'warzone',
    'fifa', 'fc 24', 'pes', 'efootball',
    'roblox', 'among us', 'fall guys'
  ],
  
  // Game aliases
  GAME_ALIASES: {
    'csgo': 'cs2',
    'cs:go': 'cs2',
    'gta v': 'gta5',
    'gta 5': 'gta5'
  },
  
  // Scoring weights
  SCORING: {
    VIEW_RELIABILITY: 30,
    AVG_VIEW_POWER: 25,
    CHANNEL_ACTIVITY: 20,
    GAMING_FIT: 25
  }
};
