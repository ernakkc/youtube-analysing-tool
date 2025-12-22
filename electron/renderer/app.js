// Global state
let currentSettings = null;
let foundChannels = [];

// ==================== Initialization ====================

document.addEventListener('DOMContentLoaded', async () => {
  setupTabs();
  setupEventListeners();
  await loadSettings();
});

// ==================== Tab Management ====================

function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      switchTab(targetTab);
    });
  });
}

function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  
  // Update tab content
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById(`${tabName}-tab`).classList.add('active');
  
  // Load data for specific tabs
  if (tabName === 'results') {
    loadResults();
  }
}

// ==================== Settings Management ====================

async function loadSettings() {
  try {
    const settings = await window.electronAPI.loadSettings();
    currentSettings = settings;
    
    // API Keys
    const container = document.getElementById('api-keys-container');
    container.innerHTML = '';
    settings.apiKeys.forEach((key, index) => {
      addApiKeyInput(index, key);
    });
    
    // Filters
    document.getElementById('min-subscribers').value = settings.filters.minSubscribers;
    document.getElementById('max-subscribers').value = settings.filters.maxSubscribers;
    document.getElementById('max-days-upload').value = settings.filters.maxDaysSinceUpload;
    document.getElementById('min-video-duration').value = settings.filters.minVideoDuration;
    document.getElementById('min-video-views').value = settings.filters.minVideoViews;
    document.getElementById('shorts-threshold').value = settings.filters.shortsThreshold;
    
    // Discovery
    document.getElementById('region-code').value = settings.discovery.regionCode;
    document.getElementById('language-code').value = settings.discovery.language;
    document.getElementById('max-results').value = settings.discovery.maxResults;
    
    // Delays (convert from ms to seconds)
    if (settings.delays) {
      document.getElementById('delay-queries').value = settings.delays.betweenQueries / 1000;
      document.getElementById('delay-channels').value = settings.delays.betweenChannels / 1000;
      document.getElementById('delay-error').value = settings.delays.afterApiError / 1000;
    }
    
    // Games
    document.getElementById('games-list').value = settings.games.join(', ');
    
    // Search Queries
    if (settings.searchQueries) {
      document.getElementById('search-queries').value = settings.searchQueries;
    }
    
  } catch (error) {
    console.error('Ayarlar yüklenemedi:', error);
    showNotification('Ayarlar yüklenemedi', 'error');
  }
}

function addApiKeyInput(index, value = '') {
  const container = document.getElementById('api-keys-container');
  const div = document.createElement('div');
  div.className = 'input-group';
  div.innerHTML = `
    <input type="text" class="api-key-input" placeholder="YouTube API Key ${index + 1}" 
           data-index="${index}" value="${value}">
    <button class="btn-remove" onclick="removeApiKey(${index})">❌</button>
  `;
  container.appendChild(div);
}

function addApiKey() {
  const container = document.getElementById('api-keys-container');
  const currentCount = container.querySelectorAll('.api-key-input').length;
  addApiKeyInput(currentCount);
}

function removeApiKey(index) {
  const container = document.getElementById('api-keys-container');
  const inputs = container.querySelectorAll('.input-group');
  if (inputs.length > 1) {
    inputs[index].remove();
  } else {
    showNotification('En az bir API key olmalı', 'warning');
  }
}

async function saveSettings() {
  try {
    // Collect API keys
    const apiKeyInputs = document.querySelectorAll('.api-key-input');
    const apiKeys = Array.from(apiKeyInputs).map(input => input.value.trim()).filter(key => key);
    
    if (apiKeys.length === 0) {
      showNotification('En az bir API key giriniz', 'error');
      return;
    }
    
    // Collect games
    const gamesText = document.getElementById('games-list').value;
    const games = gamesText.split(',').map(g => g.trim()).filter(g => g);
    
    // Collect search queries
    const searchQueries = document.getElementById('search-queries').value;
    
    const settings = {
      apiKeys,
      filters: {
        minSubscribers: parseInt(document.getElementById('min-subscribers').value),
        maxSubscribers: parseInt(document.getElementById('max-subscribers').value),
        maxDaysSinceUpload: parseInt(document.getElementById('max-days-upload').value),
        minVideoDuration: parseInt(document.getElementById('min-video-duration').value),
        minVideoViews: parseInt(document.getElementById('min-video-views').value),
        shortsThreshold: parseInt(document.getElementById('shorts-threshold').value)
      },
      discovery: {
        regionCode: document.getElementById('region-code').value.toUpperCase(),
        language: document.getElementById('language-code').value.toLowerCase(),
        maxResults: parseInt(document.getElementById('max-results').value)
      },
      delays: {
        betweenQueries: parseFloat(document.getElementById('delay-queries').value) * 1000,
        betweenChannels: parseFloat(document.getElementById('delay-channels').value) * 1000,
        afterApiError: parseFloat(document.getElementById('delay-error').value) * 1000
      },
      games,
      searchQueries
    };
    
    // Loading durumu göster
    const saveBtn = document.querySelector('.btn-primary[onclick="saveSettings()"]');
    const originalText = saveBtn.textContent;
    saveBtn.disabled = true;
    saveBtn.textContent = '🔄 Kaydediliyor...';
    
    const result = await window.electronAPI.saveSettings(settings);
    
    // Restore button
    saveBtn.disabled = false;
    saveBtn.textContent = originalText;
    
    if (result.success) {
      showNotification('✅ Ayarlar kaydedildi', 'success');
      currentSettings = settings;
    } else {
      showNotification('❌ Kayıt hatası: ' + result.error, 'error');
    }
    
  } catch (error) {
    console.error('Ayarlar kaydedilemedi:', error);
    showNotification('Ayarlar kaydedilemedi: ' + error.message, 'error');
  }
}

// ==================== Analysis ====================

function setupEventListeners() {
  // Log listener
  window.electronAPI.onAnalysisLog((data) => {
    addLog(data.type, data.message);
  });
  
  // Progress listener
  window.electronAPI.onAnalysisProgress((data) => {
    updateProgress(data.current, data.total, data.percentage);
  });
  
  // Channel found listener
  window.electronAPI.onChannelFound((channel) => {
    foundChannels.push(channel);
  });
}

async function startAnalysis() {
  const queriesText = document.getElementById('search-queries').value.trim();
  
  if (!queriesText) {
    showNotification('Lütfen arama sorguları girin', 'warning');
    return;
  }
  
  const queries = queriesText.split('\n').map(q => q.trim()).filter(q => q);
  
  if (queries.length === 0) {
    showNotification('Geçerli sorgu bulunamadı', 'warning');
    return;
  }
  
  // Arama sorgularını otomatik kaydet
  if (currentSettings) {
    currentSettings.searchQueries = queriesText;
    await window.electronAPI.saveSettings(currentSettings);
  }
  
  // UI güncellemeleri
  document.getElementById('start-btn').style.display = 'none';
  document.getElementById('stop-btn').style.display = 'inline-block';
  clearLog();
  resetProgress();
  foundChannels = [];
  
  // Start analysis
  try {
    const result = await window.electronAPI.startAnalysis(queries);
    
    if (result.success) {
      showNotification(`✅ Analiz tamamlandı! ${result.passed}/${result.processed} kanal bulundu`, 'success');
    } else {
      showNotification('❌ Analiz hatası: ' + result.error, 'error');
    }
  } catch (error) {
    console.error('Analiz hatası:', error);
    showNotification('Analiz sırasında hata oluştu', 'error');
  } finally {
    document.getElementById('start-btn').style.display = 'inline-block';
    document.getElementById('stop-btn').style.display = 'none';
  }
}

async function stopAnalysis() {
  const result = await window.electronAPI.stopAnalysis();
  if (result.success) {
    showNotification('⏹️ Durdurma isteği gönderildi, mevcut işlem tamamlanıyor...', 'warning');
  }
}

// ==================== Log Management ====================

function addLog(type, message) {
  const container = document.getElementById('log-container');
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  
  const timestamp = new Date().toLocaleTimeString('tr-TR');
  entry.textContent = `[${timestamp}] ${message}`;
  
  container.appendChild(entry);
  container.scrollTop = container.scrollHeight;
}

function clearLog() {
  document.getElementById('log-container').innerHTML = '';
}

// ==================== Progress ====================

function updateProgress(current, total, percentage) {
  const fill = document.getElementById('progress-fill');
  const text = document.getElementById('progress-text');
  
  fill.style.width = `${percentage}%`;
  fill.textContent = `${percentage}%`;
  text.textContent = `İşleniyor: ${current}/${total} kanal (${percentage}%)`;
}

function resetProgress() {
  const fill = document.getElementById('progress-fill');
  const text = document.getElementById('progress-text');
  
  fill.style.width = '0%';
  fill.textContent = '';
  text.textContent = 'Başlatılıyor...';
}

// ==================== Results ====================

async function loadResults() {
  try {
    console.log('🔄 Sonuçlar yükleniyor...');
    const channels = await window.electronAPI.getSavedChannels();
    console.log('✅ Alınan kanal sayısı:', channels ? channels.length : 0);
    displayResults(channels);
  } catch (error) {
    console.error('❌ Sonuçlar yüklenemedi:', error);
    console.error('Hata detayı:', error.stack);
    showNotification('Sonuçlar yüklenemedi: ' + error.message, 'error');
  }
}

function displayResults(channels) {
  const container = document.getElementById('results-container');
  
  if (!channels || channels.length === 0) {
    container.innerHTML = '<p class="no-data">Henüz sonuç yok. Analiz çalıştırın.</p>';
    return;
  }
  
  container.innerHTML = channels.map(channel => {
    const breakdown = channel.scoreBreakdown || { viewReliability: 0, avgViewPower: 0, activity: 0, gamingFit: 0 };
    const games = channel.detectedGames || [];
    const views = channel.last6Views || [];
    const emails = channel.emails || [];
    
    return `
      <div class="channel-card">
        <div class="channel-header">
          <div class="channel-title">${channel.title || 'İsimsiz Kanal'}</div>
          <div class="channel-score">${channel.qualityScore || 0}/100</div>
        </div>
        
        <div class="channel-info">
          <div class="info-item">
            <span class="info-label">Abone Sayısı</span>
            <span class="info-value">${formatNumber(channel.subscriberCount || 0)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Ortalama İzlenme</span>
            <span class="info-value">${formatNumber(average(views))}</span>
          </div>
          <div class="info-item">
            <span class="info-label">View Reliability</span>
            <span class="info-value">${breakdown.viewReliability}/30</span>
          </div>
          <div class="info-item">
            <span class="info-label">View Power</span>
            <span class="info-value">${breakdown.avgViewPower}/25</span>
          </div>
          <div class="info-item">
            <span class="info-label">Activity</span>
            <span class="info-value">${breakdown.activity}/20</span>
          </div>
          <div class="info-item">
            <span class="info-label">Gaming Fit</span>
            <span class="info-value">${breakdown.gamingFit}/25</span>
          </div>
        </div>
        
        ${emails.length > 0 ? `
          <div class="channel-emails">
            <strong>📧 Email:</strong> ${emails.map(email => `<a href="mailto:${email}" class="email-link">${email}</a>`).join(', ')}
          </div>
        ` : ''}
        
        ${games.length > 0 ? `
          <div class="channel-games">
            ${games.map(game => `<span class="game-tag">${game}</span>`).join('')}
          </div>
        ` : ''}
        
        <a href="${channel.channelUrl || '#'}" class="channel-link" target="_blank">Kanalı Aç →</a>
      </div>
    `;
  }).join('');
}

function sortResults(by) {
  const container = document.getElementById('results-container');
  const cards = Array.from(container.querySelectorAll('.channel-card'));
  
  // Get channel data and sort
  window.electronAPI.getSavedChannels().then(channels => {
    if (by === 'score') {
      channels.sort((a, b) => b.qualityScore - a.qualityScore);
    }
    displayResults(channels);
  });
}

async function clearAllResults() {
  if (!confirm('⚠️ Tüm analiz sonuçlarını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
    return;
  }
  
  const result = await window.electronAPI.clearAllChannels();
  if (result.success) {
    showNotification('🗑️ Tüm sonuçlar başarıyla silindi', 'success');
    displayResults([]);
  } else {
    showNotification('❌ Sonuçlar silinirken hata oluştu', 'error');
  }
}

async function exportCSV() {
  try {
    const channels = await window.electronAPI.getSavedChannels();
    
    if (!channels || channels.length === 0) {
      showNotification('Dışa aktarılacak sonuç yok', 'warning');
      return;
    }
    
    // CSV oluştur
    const headers = ['Kanal Adı', 'Abone', 'Skor', 'Email', 'Oyunlar', 'URL'];
    const rows = channels.map(ch => [
      ch.title || '',
      ch.subscriberCount || 0,
      ch.qualityScore || 0,
      (ch.emails || []).join('; '),
      (ch.detectedGames || []).join('; '),
      ch.channelUrl || ''
    ]);
    
    let csv = headers.join(',') + '\n';
    csv += rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    // Electron dialog ile kaydet
    const result = await window.electronAPI.saveCSV(csv);
    
    if (result.success) {
      showNotification(`✅ CSV kaydedildi: ${result.path}`, 'success');
    } else if (!result.cancelled) {
      showNotification('❌ CSV kaydetme hatası: ' + result.error, 'error');
    }
    
  } catch (error) {
    console.error('Export hatası:', error);
    showNotification('Export hatası: ' + error.message, 'error');
  }
}

async function exportJSON() {
  try {
    const channels = await window.electronAPI.getSavedChannels();
    
    if (!channels || channels.length === 0) {
      showNotification('Dışa aktarılacak sonuç yok', 'warning');
      return;
    }
    
    // JSON oluştur (pretty print)
    const json = JSON.stringify(channels, null, 2);
    
    // Electron dialog ile kaydet
    const result = await window.electronAPI.saveJSON(json);
    
    if (result.success) {
      showNotification(`✅ JSON kaydedildi: ${result.path}`, 'success');
    } else if (!result.cancelled) {
      showNotification('❌ JSON kaydetme hatası: ' + result.error, 'error');
    }
    
  } catch (error) {
    console.error('Export hatası:', error);
    showNotification('Export hatası: ' + error.message, 'error');
  }
}

// ==================== Utilities ====================

function showNotification(message, type = 'info') {
  // Toast notification oluştur
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  // Mevcut toast container'a ekle veya oluştur
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  
  container.appendChild(toast);
  
  // Animasyon
  setTimeout(() => toast.classList.add('show'), 10);
  
  // 3 saniye sonra kaldır
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function average(arr) {
  if (!arr || arr.length === 0) return 0;
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}
