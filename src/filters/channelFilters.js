const { FILTERS } = require('../config/constants');
const { daysSince, parseDuration, secondsToMinutes, isShort } = require('../utils/helpers');
const { getVideoDetails } = require('../services/youtubeService');

/**
 * Check if channel meets subscriber count requirements
 * @param {number} subscriberCount - Channel subscriber count
 * @returns {boolean} - Pass or fail
 */
function checkSubscriberCount(subscriberCount) {
  return subscriberCount >= FILTERS.MIN_SUBSCRIBERS && 
         subscriberCount <= FILTERS.MAX_SUBSCRIBERS;
}

/**
 * Check if channel has uploaded recently
 * @param {string} lastUploadDate - Last upload date
 * @returns {boolean} - Pass or fail
 */
function checkLastUploadDate(lastUploadDate) {
  const days = daysSince(lastUploadDate);
  return days <= FILTERS.MAX_DAYS_SINCE_UPLOAD;
}

/**
 * Filter long videos (exclude shorts)
 * @param {Array} videos - Array of video objects with duration
 * @returns {Array} - Array of long videos
 */
function filterLongVideos(videos) {
  return videos.filter(video => {
    const durationInSeconds = parseDuration(video.duration);
    const durationInMinutes = secondsToMinutes(durationInSeconds);
    return durationInMinutes >= FILTERS.MIN_VIDEO_DURATION_MINUTES;
  });
}

/**
 * Check if shorts ratio is too high
 * @param {Array} videos - Array of video objects
 * @returns {boolean} - True if channel should be filtered out
 */
function hasTooManyShorts(videos) {
  if (videos.length === 0) return false;
  
  const shortsCount = videos.filter(video => {
    const durationInSeconds = parseDuration(video.duration);
    return isShort(durationInSeconds);
  }).length;
  
  const shortsPercentage = (shortsCount / videos.length) * 100;
  return shortsPercentage >= FILTERS.SHORTS_THRESHOLD_PERCENTAGE;
}

/**
 * Check if enough long videos meet view threshold
 * @param {Array} longVideos - Array of long video objects
 * @returns {boolean} - Pass or fail
 */
function checkVideoViews(longVideos) {
  const videosWithEnoughViews = longVideos.filter(
    video => video.viewCount >= FILTERS.MIN_VIDEO_VIEWS
  );
  
  return videosWithEnoughViews.length >= FILTERS.MIN_LONG_VIDEOS_WITH_VIEWS;
}

/**
 * Apply all hard filters to a channel
 * @param {Object} channelData - Channel data with videos
 * @returns {Object} - { pass: boolean, reasons: Array }
 */
async function applyHardFilters(channelData) {
  const reasons = [];
  
  // Check subscriber count
  if (!checkSubscriberCount(channelData.subscriberCount)) {
    reasons.push(`Subscriber count (${channelData.subscriberCount}) not in range ${FILTERS.MIN_SUBSCRIBERS}-${FILTERS.MAX_SUBSCRIBERS}`);
  }
  
  // Check last upload date
  if (channelData.lastUploadDate && !checkLastUploadDate(channelData.lastUploadDate)) {
    const days = daysSince(channelData.lastUploadDate);
    reasons.push(`Last upload was ${days} days ago (max: ${FILTERS.MAX_DAYS_SINCE_UPLOAD})`);
  }
  
  // Check shorts ratio
  if (channelData.recentVideos && hasTooManyShorts(channelData.recentVideos)) {
    reasons.push(`Too many shorts (>=${FILTERS.SHORTS_THRESHOLD_PERCENTAGE}%)`);
  }
  
  // Filter long videos and check views
  if (channelData.recentVideos) {
    const longVideos = filterLongVideos(channelData.recentVideos);
    
    if (longVideos.length < FILTERS.MIN_LONG_VIDEOS_WITH_VIEWS) {
      reasons.push(`Not enough long videos (found: ${longVideos.length}, needed: ${FILTERS.MIN_LONG_VIDEOS_WITH_VIEWS})`);
    } else if (!checkVideoViews(longVideos)) {
      reasons.push(`Not enough long videos with >=${FILTERS.MIN_VIDEO_VIEWS} views`);
    }
  }
  
  return {
    pass: reasons.length === 0,
    reasons
  };
}

module.exports = {
  checkSubscriberCount,
  checkLastUploadDate,
  filterLongVideos,
  hasTooManyShorts,
  checkVideoViews,
  applyHardFilters
};
