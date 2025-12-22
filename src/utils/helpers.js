const dayjs = require('dayjs');
const duration = require('dayjs/plugin/duration');
dayjs.extend(duration);

/**
 * ISO 8601 süresini saniyeye çevir
 * @param {string} isoDuration - ISO 8601 süre stringi (örn: PT15M33S)
 * @returns {number} - Saniye cinsinden süre
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
 * Saniyeyi dakikaya çevir
 * @param {number} seconds - Saniye cinsinden süre
 * @returns {number} - Dakika cinsinden süre
 */
function secondsToMinutes(seconds) {
  return Math.floor(seconds / 60);
}

/**
 * Belirli bir tarihten bu yana geçen gün sayısını hesapla
 * @param {string} dateString - Tarih stringi
 * @returns {number} - Tarihten bu yana geçen gün sayısı
 */
function daysSince(dateString) {
  const date = dayjs(dateString);
  const now = dayjs();
  return now.diff(date, 'day');
}

/**
 * Videonun süresine göre shorts olup olmadığını kontrol et
 * @param {number} durationInSeconds - Saniye cinsinden video süresi
 * @returns {boolean} - Shorts ise true
 */
function isShort(durationInSeconds) {
  return durationInSeconds < 60;
}

/**
 * Sayı dizisinin ortalamasını hesapla
 * @param {Array<number>} numbers - Sayı dizisi
 * @returns {number} - Ortalama
 */
function calculateAverage(numbers) {
  if (!numbers || numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, val) => acc + val, 0);
  return sum / numbers.length;
}

/**
 * Sayıyı binlik ayırıcı ile formatla
 * @param {number} num - Formatlanacak sayı
 * @returns {string} - Formatlanmış sayı
 */
function formatNumber(num) {
  return new Intl.NumberFormat('tr-TR').format(num);
}

/**
 * Metinden email adreslerini çıkar
 * @param {string} text - Aranacak metin (kanal açıklaması vb.)
 * @returns {Array<string>} - Bulunan email adresleri
 */
function extractEmails(text) {
  if (!text) return [];
  
  // Email regex pattern
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex);
  
  if (!matches) return [];
  
  // Deduplicate and filter out common false positives
  const uniqueEmails = [...new Set(matches)];
  const filtered = uniqueEmails.filter(email => {
    // Exclude common image/video file extensions
    const invalidExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.mp4', '.avi'];
    return !invalidExtensions.some(ext => email.toLowerCase().endsWith(ext));
  });
  
  return filtered;
}

module.exports = {
  parseDuration,
  secondsToMinutes,
  daysSince,
  isShort,
  calculateAverage,
  formatNumber,
  extractEmails
};
