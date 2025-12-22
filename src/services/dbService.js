const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const { DB_PATH } = require('../config/constants');
const path = require('path');
const fs = require('fs');

let db = null;

/**
 * Initialize database
 */
async function initDB() {
  if (db) return db;
  
  // Ensure data directory exists
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  const adapter = new JSONFile(DB_PATH);
  db = new Low(adapter, { channels: [] });
  
  await db.read();
  
  // Initialize with empty array if not exists
  db.data ||= { channels: [] };
  
  return db;
}

/**
 * Save channel to database
 * @param {Object} channelData - Channel data to save
 */
async function saveChannel(channelData) {
  await initDB();
  
  // Check if channel already exists
  const existingIndex = db.data.channels.findIndex(
    ch => ch.channelId === channelData.channelId
  );
  
  if (existingIndex >= 0) {
    // Update existing
    db.data.channels[existingIndex] = {
      ...db.data.channels[existingIndex],
      ...channelData,
      lastCheckedAt: new Date().toISOString()
    };
  } else {
    // Add new
    db.data.channels.push({
      ...channelData,
      lastCheckedAt: new Date().toISOString()
    });
  }
  
  await db.write();
}

/**
 * Get all channels from database
 * @returns {Array} - Array of channels
 */
async function getAllChannels() {
  await initDB();
  return db.data.channels;
}

/**
 * Get channel by ID
 * @param {string} channelId - Channel ID
 * @returns {Object|null} - Channel data or null
 */
async function getChannelById(channelId) {
  await initDB();
  return db.data.channels.find(ch => ch.channelId === channelId) || null;
}

/**
 * Delete channel from database
 * @param {string} channelId - Channel ID
 */
async function deleteChannel(channelId) {
  await initDB();
  db.data.channels = db.data.channels.filter(ch => ch.channelId !== channelId);
  await db.write();
}

/**
 * Get channels sorted by quality score
 * @param {number} limit - Limit results
 * @returns {Array} - Sorted array of channels
 */
async function getTopChannels(limit = 10) {
  await initDB();
  return db.data.channels
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .slice(0, limit);
}

/**
 * Clear all channels from database
 * @returns {Promise<void>}
 */
async function clearAllChannels() {
  await initDB();
  db.data.channels = [];
  await db.write();
}

module.exports = {
  initDB,
  saveChannel,
  getAllChannels,
  getChannelById,
  deleteChannel,
  getTopChannels,
  clearAllChannels
};
