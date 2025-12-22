const { contextBridge, ipcRenderer } = require('electron');

/**
 * Güvenli API köprüsü - Renderer process'ten backend'e erişim
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // Ayarlar
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  
  // Analiz
  startAnalysis: (queries) => ipcRenderer.invoke('start-analysis', queries),
  stopAnalysis: () => ipcRenderer.invoke('stop-analysis'),
  
  // Kanallar
  getSavedChannels: () => ipcRenderer.invoke('get-saved-channels'),
  clearAllChannels: () => ipcRenderer.invoke('clear-all-channels'),
  
  // Export
  saveCSV: (csvContent) => ipcRenderer.invoke('save-csv', csvContent),
  saveJSON: (jsonContent) => ipcRenderer.invoke('save-json', jsonContent),
  
  // Event listeners
  onAnalysisLog: (callback) => {
    ipcRenderer.on('analysis-log', (event, data) => callback(data));
  },
  
  onAnalysisProgress: (callback) => {
    ipcRenderer.on('analysis-progress', (event, data) => callback(data));
  },
  
  onChannelFound: (callback) => {
    ipcRenderer.on('channel-found', (event, channel) => callback(channel));
  },
  
  // Cleanup
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});
