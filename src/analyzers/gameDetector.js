const { GAMES, GAME_ALIASES } = require('../config/constants');

/**
 * Detect games mentioned in text
 * @param {string} text - Text to analyze
 * @returns {Array<string>} - Array of detected games
 */
function detectGames(text) {
  if (!text) return [];
  
  const lowerText = text.toLowerCase();
  const detectedGames = new Set();
  
  GAMES.forEach(game => {
    if (lowerText.includes(game.toLowerCase())) {
      // Check if there's an alias
      const normalizedGame = GAME_ALIASES[game] || game;
      detectedGames.add(normalizedGame);
    }
  });
  
  return Array.from(detectedGames);
}

/**
 * Analyze channel and videos for gaming content
 * @param {Object} channelData - Channel data with videos
 * @returns {Object} - Analysis results
 */
function analyzeGamingContent(channelData) {
  const gamesFromChannel = detectGames(channelData.description);
  const gamesFromVideos = new Set();
  
  if (channelData.recentVideos) {
    channelData.recentVideos.forEach(video => {
      const titleGames = detectGames(video.title);
      const descGames = detectGames(video.description);
      
      [...titleGames, ...descGames].forEach(game => gamesFromVideos.add(game));
    });
  }
  
  // Combine all detected games
  const allGames = new Set([...gamesFromChannel, ...Array.from(gamesFromVideos)]);
  
  return {
    detectedGames: Array.from(allGames),
    gamesCount: allGames.size,
    hasGamingKeywords: hasGamingKeywords(channelData)
  };
}

/**
 * Check if channel/videos contain gaming keywords
 * @param {Object} channelData - Channel data
 * @returns {boolean} - True if gaming keywords found
 */
function hasGamingKeywords(channelData) {
  const { GAMING_KEYWORDS } = require('../config/constants');
  
  const channelText = (channelData.title + ' ' + channelData.description).toLowerCase();
  
  // Check channel description
  const hasInChannel = GAMING_KEYWORDS.some(keyword => 
    channelText.includes(keyword.toLowerCase())
  );
  
  if (hasInChannel) return true;
  
  // Check video titles and descriptions
  if (channelData.recentVideos) {
    return channelData.recentVideos.some(video => {
      const videoText = (video.title + ' ' + video.description).toLowerCase();
      return GAMING_KEYWORDS.some(keyword => 
        videoText.includes(keyword.toLowerCase())
      );
    });
  }
  
  return false;
}

/**
 * Calculate average views to subscriber ratio
 * @param {Array} videos - Array of video objects
 * @param {number} subscriberCount - Channel subscriber count
 * @returns {number} - Ratio (0-1+)
 */
function calculateViewRatio(videos, subscriberCount) {
  if (!videos || videos.length === 0 || subscriberCount === 0) return 0;
  
  const totalViews = videos.reduce((sum, video) => sum + video.viewCount, 0);
  const avgViews = totalViews / videos.length;
  
  return avgViews / subscriberCount;
}

module.exports = {
  detectGames,
  analyzeGamingContent,
  hasGamingKeywords,
  calculateViewRatio
};
