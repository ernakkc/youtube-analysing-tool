const dayjs = require('dayjs');
const duration = require('dayjs/plugin/duration');
dayjs.extend(duration);

/**
 * Parse ISO 8601 duration to seconds
 * @param {string} isoDuration - ISO 8601 duration string (e.g., PT15M33S)
 * @returns {number} - Duration in seconds
 */
function parseDuration(isoDuration) {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Convert seconds to minutes
 * @param {number} seconds - Duration in seconds
 * @returns {number} - Duration in minutes
 */
function secondsToMinutes(seconds) {
  return Math.floor(seconds / 60);
}

/**
 * Calculate days since a given date
 * @param {string} dateString - Date string
 * @returns {number} - Days since the date
 */
function daysSince(dateString) {
  const date = dayjs(dateString);
  const now = dayjs();
  return now.diff(date, 'day');
}

/**
 * Check if a video is a short based on duration
 * @param {number} durationInSeconds - Video duration in seconds
 * @returns {boolean} - True if it's a short
 */
function isShort(durationInSeconds) {
  return durationInSeconds < 60;
}

/**
 * Calculate average of an array of numbers
 * @param {Array<number>} numbers - Array of numbers
 * @returns {number} - Average
 */
function calculateAverage(numbers) {
  if (!numbers || numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, val) => acc + val, 0);
  return sum / numbers.length;
}

/**
 * Format number with thousands separator
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
function formatNumber(num) {
  return new Intl.NumberFormat('tr-TR').format(num);
}

module.exports = {
  parseDuration,
  secondsToMinutes,
  daysSince,
  isShort,
  calculateAverage,
  formatNumber
};
