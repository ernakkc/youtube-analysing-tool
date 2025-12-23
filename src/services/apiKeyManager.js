const { YOUTUBE_API_KEYS } = require('../config/constants');

/**
 * API Anahtar Yöneticisi - Çoklu API anahtarlarının rotasyonunu yönetir
 */
class ApiKeyManager {
  constructor(apiKeys = null) {
    console.log('🔍 [ApiKeyManager] Constructor çağrıldı');
    console.log('🔍 [ApiKeyManager] Parametre olarak gelen apiKeys:', apiKeys);
    
    // Önce parametre, sonra constants'tan oku
    const keysToUse = apiKeys || YOUTUBE_API_KEYS || [];
    
    console.log('🔍 [ApiKeyManager] Kullanılacak keys:', keysToUse);
    console.log('🔍 [ApiKeyManager] Keys array mi?:', Array.isArray(keysToUse));
    console.log('🔍 [ApiKeyManager] Keys length:', keysToUse ? keysToUse.length : 'null/undefined');
    
    this.keys = Array.isArray(keysToUse) ? keysToUse : [];
    this.currentIndex = 0;
    this.failedKeys = new Set();
    
    console.log('🔍 [ApiKeyManager] this.keys:', this.keys);
    console.log('🔍 [ApiKeyManager] this.keys.length:', this.keys.length);
    
    if (this.keys.length === 0) {
      console.error('❌ YouTube API anahtarı bulunamadı!');
      console.error('Electron uygulamasında: Settings sekmesinden API key ekleyin');
      console.error('CLI modunda: .env dosyasına YOUTUBE_API_KEY ekleyin');
      throw new Error('YouTube API anahtarı bulunamadı. Lütfen Settings sekmesinden API key ekleyin.');
    }
    
    console.log(`📌 API Anahtar Yöneticisi ${this.keys.length} anahtar ile başlatıldı`);
  }
  
  /**
   * Aktif API anahtarını getir
   * @returns {string} - Mevcut API anahtarı
   */
  getCurrentKey() {
    // Tüm anahtarlar başarısız olduysa, sıfırla ve tekrar dene
    if (this.failedKeys.size === this.keys.length) {
      console.log('⚠️  Tüm API anahtarları tükendi. Sıfırlanıyor...');
      this.failedKeys.clear();
    }
    
    // Sonraki kullanılabilir anahtarı bul
    let attempts = 0;
    while (attempts < this.keys.length) {
      const key = this.keys[this.currentIndex];
      
      if (!this.failedKeys.has(this.currentIndex)) {
        return key;
      }
      
      this.currentIndex = (this.currentIndex + 1) % this.keys.length;
      attempts++;
    }
    
    // Buraya geldiysek, tüm anahtarlar başarısız
    throw new Error('Tüm API anahtarları tüketildi');
  }
  
  /**
   * Mevcut anahtarı başarısız olarak işaretle ve sonrakine geç
   * @param {Error} error - Hataya neden olan hata nesnesi
   */
  rotateKey(error) {
    const errorMessage = error.message || '';
    
    // Hatanın quota ile ilgili olup olmadığını kontrol et
    const isQuotaError = 
      errorMessage.includes('quotaExceeded') ||
      errorMessage.includes('quota') ||
      error.code === 403;
    
    if (isQuotaError) {
      console.log(`❌ API Anahtarı ${this.currentIndex + 1} kotası aşıldı. Değiştiriliyor...`);
      this.failedKeys.add(this.currentIndex);
      this.currentIndex = (this.currentIndex + 1) % this.keys.length;
      
      const remainingKeys = this.keys.length - this.failedKeys.size;
      console.log(`🔄 API Anahtarı ${this.currentIndex + 1}'e geçildi. Kalan anahtar: ${remainingKeys}`);
      
      return true; // Rotasyon başarılı
    }
    
    return false; // Quota hatası değil, değiştirme
  }
  
  /**
   * Anahtar kullanım istatistiklerini getir
   * @returns {Object} - Kullanım istatistikleri
   */
  getStats() {
    return {
      totalKeys: this.keys.length,
      currentKeyIndex: this.currentIndex + 1,
      failedKeys: this.failedKeys.size,
      remainingKeys: this.keys.length - this.failedKeys.size
    };
  }
  
  /**
   * Tüm başarısız anahtarları sıfırla (günlük sıfırlama için kullanışlı)
   */
  reset() {
    this.failedKeys.clear();
    this.currentIndex = 0;
    console.log('🔄 API Anahtar Yöneticisi sıfırlandı. Tüm anahtarlar tekrar kullanılabilir.');
  }
}

// Singleton instance
let instance = null;

module.exports = {
  /**
   * ApiKeyManager örneğini getir (singleton)
   * @param {Array<string>} apiKeys - İsteğe bağlı API anahtarları dizisi
   * @returns {ApiKeyManager}
   */
  getApiKeyManager: (apiKeys = null) => {
    if (!instance) {
      instance = new ApiKeyManager(apiKeys);
    }
    return instance;
  },
  
  /**
   * Singleton örneğini sıfırla (test için kullanışlı)
   */
  resetApiKeyManager: () => {
    instance = null;
  }
};
