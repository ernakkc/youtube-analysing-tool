const { google } = require('googleapis');
const { YOUTUBE_API_KEY, DISCOVERY } = require('../config/constants');

const youtube = google.youtube({
  version: 'v3',
  auth: YOUTUBE_API_KEY
});

/**
 * Search for channels by keywords
 * @param {string} query - Search query
 * @param {string} regionCode - Region code (e.g., 'TR')
 * @param {string} relevanceLanguage - Language code (e.g., 'tr')
 * @param {number} maxResults - Maximum results to return
 * @returns {Promise<Array>} - Array of channel IDs
 */
async function searchChannels(query, regionCode = DISCOVERY.DEFAULT_REGION_CODE, relevanceLanguage = DISCOVERY.DEFAULT_LANGUAGE, maxResults = DISCOVERY.MAX_RESULTS_PER_QUERY) {
  try {
    const response = await youtube.search.list({
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
  } catch (error) {
    console.error('Error searching channels:', error.message);
    throw error;
  }
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
  try {
    const response = await youtube.search.list({
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
  } catch (error) {
    console.error('Error searching videos:', error.message);
    throw error;
  }
}

/**
 * Get detailed channel information
 * @param {string} channelId - Channel ID
 * @returns {Promise<Object>} - Channel details
 */
async function getChannelDetails(channelId) {
  try {
    const response = await youtube.channels.list({
      part: 'snippet,statistics,contentDetails',
      id: channelId
    });

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error('Channel not found');
    }

    const channel = response.data.items[0];
    return {
      channelId: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      customUrl: channel.snippet.customUrl,
      publishedAt: channel.snippet.publishedAt,
      subscriberCount: parseInt(channel.statistics.subscriberCount) || 0,
      viewCount: parseInt(channel.statistics.viewCount) || 0,
      videoCount: parseInt(channel.statistics.videoCount) || 0,
      uploadsPlaylistId: channel.contentDetails.relatedPlaylists.uploads
    };
  } catch (error) {
    console.error(`Error getting channel details for ${channelId}:`, error.message);
    throw error;
  }
}

/**
 * Get recent videos from a channel
 * @param {string} uploadsPlaylistId - Uploads playlist ID
 * @param {number} maxResults - Maximum number of videos
 * @returns {Promise<Array>} - Array of video IDs
 */
async function getRecentVideos(uploadsPlaylistId, maxResults = 10) {
  try {
    const response = await youtube.playlistItems.list({
      part: 'contentDetails',
      playlistId: uploadsPlaylistId,
      maxResults
    });

    return response.data.items.map(item => item.contentDetails.videoId);
  } catch (error) {
    console.error('Error getting recent videos:', error.message);
    throw error;
  }
}

/**
 * Get detailed video information
 * @param {Array<string>} videoIds - Array of video IDs
 * @returns {Promise<Array>} - Array of video details
 */
async function getVideoDetails(videoIds) {
  try {
    const response = await youtube.videos.list({
      part: 'snippet,statistics,contentDetails',
      id: videoIds.join(',')
    });

    return response.data.items.map(video => ({
      videoId: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      publishedAt: video.snippet.publishedAt,
      duration: video.contentDetails.duration,
      viewCount: parseInt(video.statistics.viewCount) || 0,
      likeCount: parseInt(video.statistics.likeCount) || 0,
      commentCount: parseInt(video.statistics.commentCount) || 0
    }));
  } catch (error) {
    console.error('Error getting video details:', error.message);
    throw error;
  }
}

module.exports = {
  searchChannels,
  searchVideosForChannels,
  getChannelDetails,
  getRecentVideos,
  getVideoDetails
};
