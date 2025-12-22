const { SCORING, FILTERS } = require('../config/constants');
const { daysSince } = require('../utils/helpers');
const { filterLongVideos } = require('../filters/channelFilters');
const { calculateViewRatio, hasGamingKeywords } = require('../analyzers/gameDetector');

/**
 * Calculate view reliability score (30 points)
 * Based on how many long videos meet the view threshold
 * @param {Array} longVideos - Array of long video objects
 * @returns {number} - Score (0-30)
 */
function calculateViewReliabilityScore(longVideos) {
  const videosWithViews = longVideos.filter(
    video => video.viewCount >= FILTERS.MIN_VIDEO_VIEWS
  ).length;
  
  const ratio = videosWithViews / longVideos.length;
  
  if (ratio >= 1.0) return 30;
  if (ratio >= 5/6) return 25;
  if (ratio >= 4/6) return 20;
  if (ratio >= 3/6) return 10;
  return 0;
}

/**
 * Calculate average view power score (25 points)
 * Based on avg_views / subscriberCount ratio
 * @param {number} viewRatio - View to subscriber ratio
 * @returns {number} - Score (0-25)
 */
function calculateAvgViewPowerScore(viewRatio) {
  if (viewRatio >= 0.2) return 25;
  if (viewRatio >= 0.1) return 18;
  if (viewRatio >= 0.05) return 12;
  if (viewRatio >= 0.02) return 6;
  return 0;
}

/**
 * Calculate channel activity score (20 points)
 * Based on days since last upload
 * @param {string} lastUploadDate - Last upload date
 * @returns {number} - Score (0-20)
 */
function calculateActivityScore(lastUploadDate) {
  const days = daysSince(lastUploadDate);
  
  if (days <= 7) return 20;
  if (days <= 14) return 15;
  if (days <= 30) return 8;
  return 0;
}

/**
 * Calculate gaming fit score (25 points)
 * Based on gaming category, keywords, and content
 * @param {Object} channelData - Channel data
 * @param {Object} gamingAnalysis - Gaming content analysis
 * @returns {number} - Score (0-25)
 */
function calculateGamingFitScore(channelData, gamingAnalysis) {
  let score = 0;
  
  // Channel category is Gaming (+8)
  // Note: This would require checking channel category from API
  // For now, we'll give points if games are detected
  if (gamingAnalysis.gamesCount > 0) {
    score += 8;
  }
  
  // Gaming keywords in title/description (+10)
  if (gamingAnalysis.hasGamingKeywords) {
    score += 10;
  }
  
  // Gaming-focused text in description (+7)
  if (gamingAnalysis.detectedGames.length >= 2) {
    score += 7;
  }
  
  return Math.min(score, 25); // Cap at 25
}

/**
 * Calculate overall quality score (0-100)
 * @param {Object} channelData - Channel data with videos
 * @param {Object} gamingAnalysis - Gaming content analysis
 * @returns {Object} - Scoring breakdown and total
 */
function calculateQualityScore(channelData, gamingAnalysis) {
  // Filter long videos
  const longVideos = filterLongVideos(channelData.recentVideos);
  
  // Calculate view ratio
  const viewRatio = calculateViewRatio(longVideos, channelData.subscriberCount);
  
  // Calculate individual scores
  const viewReliability = calculateViewReliabilityScore(longVideos);
  const avgViewPower = calculateAvgViewPowerScore(viewRatio);
  const activity = calculateActivityScore(channelData.lastUploadDate);
  const gamingFit = calculateGamingFitScore(channelData, gamingAnalysis);
  
  // Calculate total
  const total = viewReliability + avgViewPower + activity + gamingFit;
  
  return {
    total,
    breakdown: {
      viewReliability,
      avgViewPower,
      activity,
      gamingFit
    },
    metrics: {
      viewRatio: viewRatio.toFixed(4),
      longVideosCount: longVideos.length,
      avgViews: longVideos.length > 0 
        ? Math.round(longVideos.reduce((sum, v) => sum + v.viewCount, 0) / longVideos.length)
        : 0
    }
  };
}

module.exports = {
  calculateViewReliabilityScore,
  calculateAvgViewPowerScore,
  calculateActivityScore,
  calculateGamingFitScore,
  calculateQualityScore
};
