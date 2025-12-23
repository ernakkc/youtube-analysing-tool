const { google } = require('googleapis');
const { DISCOVERY } = require('../config/constants');
const { getApiKeyManager } = require('./apiKeyManager');
const { extractEmails } = require('../utils/helpers');

let youtube = null;

/**
 * Get or create YouTube API client with current API key
 * @returns {Object} - YouTube API client
 */
function getYouTubeClient() {
  const apiKeyManager = getApiKeyManager();
  const currentKey = apiKeyManager.getCurrentKey();
  
  // Create new client with current key
  youtube = google.youtube({
    version: 'v3',
    auth: currentKey
  });
  
  return youtube;
}

/**
 * Execute YouTube API request with automatic key rotation
 * @param {Function} apiCall - Function that makes the API call
 * @param {string} operationName - Name of the operation (for logging)
 * @returns {Promise} - API response
 */
async function executeWithRetry(apiCall, operationName = 'API call') {
  const apiKeyManager = getApiKeyManager();
  const maxRetries = apiKeyManager.getStats().totalKeys;
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const client = getYouTubeClient();
      return await apiCall(client);
    } catch (error) {
      lastError = error;
      const rotated = apiKeyManager.rotateKey(error);
      
      if (!rotated) {
        // Not a quota error, throw immediately
        throw error;
      }
      
      // If this was the last key, throw error
      if (apiKeyManager.getStats().remainingKeys === 0) {
        throw new Error(`All API keys exhausted for ${operationName}: ${error.message}`);
      }
      
      // Otherwise, retry with next key
      console.log(`🔄 Retrying ${operationName} with new key...`);
    }
  }
  
  throw lastError;
}

/**
 * Search for channels by keywords
 * @param {string} query - Search query
 * @param {string} regionCode - Region code (e.g., 'TR')
 * @param {string} relevanceLanguage - Language code (e.g., 'tr')
 * @param {number} maxResults - Maximum results to return
 * @returns {Promise<Array>} - Array of channel IDs
 */
async function searchChannels(query, regionCode = DISCOVERY.DEFAULT_REGION_CODE, relevanceLanguage = DISCOVERY.DEFAULT_LANGUAGE, maxResults = DISCOVERY.MAX_RESULTS_PER_QUERY) {
  return executeWithRetry(async (client) => {
    const response = await client.search.list({
      part: 'snippet',
      type: 'channel',
      q: query,
      regionCode,
      relevanceLanguage,
      maxResults
    });

    return response.data.items.map(item => ({
      channelId: item.id.channelId,
      title: item.snippet.title,
      description: item.snippet.description
    }));
  }, `searchChannels("${query}")`);
}

/**
 * Search for videos and extract channel IDs (reverse discovery)
 * @param {string} query - Search query
 * @param {string} regionCode - Region code
 * @param {string} relevanceLanguage - Language code
 * @param {number} maxResults - Maximum results
 * @returns {Promise<Array>} - Array of unique channel IDs
 */
async function searchVideosForChannels(query, regionCode = DISCOVERY.DEFAULT_REGION_CODE, relevanceLanguage = DISCOVERY.DEFAULT_LANGUAGE, maxResults = DISCOVERY.MAX_RESULTS_PER_QUERY) {
  return executeWithRetry(async (client) => {
    const response = await client.search.list({
      part: 'snippet',
      type: 'video',
      q: query,
      regionCode,
      relevanceLanguage,
      maxResults
    });

    // Extract unique channel IDs
    const channelIds = new Set();
    response.data.items.forEach(item => {
      channelIds.add(item.snippet.channelId);
    });

    return Array.from(channelIds);
  }, `searchVideosForChannels("${query}")`);
}

/**
 * Get detailed channel information
 * @param {string} channelId - Channel ID
 * @returns {Promise<Object>} - Channel details
 */
async function getChannelDetails(channelId) {
  return executeWithRetry(async (client) => {
    const response = await client.channels.list({
      part: 'snippet,statistics,contentDetails',
      id: channelId
    });

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error('Channel not found');
    }

    const channel = response.data.items[0];
    
    // Extract emails from description
    const emails = extractEmails(channel.snippet.description);
    
    return {
      channelId: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      emails: emails,
      customUrl: channel.snippet.customUrl,
      publishedAt: channel.snippet.publishedAt,
      subscriberCount: parseInt(channel.statistics.subscriberCount) || 0,
      viewCount: parseInt(channel.statistics.viewCount) || 0,
      videoCount: parseInt(channel.statistics.videoCount) || 0,
      uploadsPlaylistId: channel.contentDetails.relatedPlaylists.uploads
    };
  }, `getChannelDetails(${channelId})`);
}

/**
 * Get recent videos from a channel
 * @param {string} uploadsPlaylistId - Uploads playlist ID
 * @param {number} maxResults - Maximum number of videos
 * @returns {Promise<Array>} - Array of video IDs
 */
async function getRecentVideos(uploadsPlaylistId, maxResults = 10) {
  return executeWithRetry(async (client) => {
    const response = await client.playlistItems.list({
      part: 'contentDetails',
      playlistId: uploadsPlaylistId,
      maxResults
    });

    return response.data.items.map(item => item.contentDetails.videoId);
  }, `getRecentVideos(${uploadsPlaylistId})`);
}

/**
 * Get detailed video information
 * @param {Array<string>} videoIds - Array of video IDs
 * @returns {Promise<Array>} - Array of video details
 */
async function getVideoDetails(videoIds) {
  return executeWithRetry(async (client) => {
    const response = await client.videos.list({
      part: 'snippet,statistics,contentDetails',
      id: videoIds.join(',')
    });

    return response.data.items.map(video => {
      // Extract emails from video description
      const emails = extractEmails(video.snippet.description);
      
      return {
        videoId: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        emails: emails,
        publishedAt: video.snippet.publishedAt,
        duration: video.contentDetails.duration,
        viewCount: parseInt(video.statistics.viewCount) || 0,
        likeCount: parseInt(video.statistics.likeCount) || 0,
        commentCount: parseInt(video.statistics.commentCount) || 0
      };
    });
  }, `getVideoDetails([${videoIds.length} videos])`);
}

module.exports = {
  searchChannels,
  searchVideosForChannels,
  getChannelDetails,
  getRecentVideos,
  getVideoDetails
};
