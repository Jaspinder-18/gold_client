import axios from 'axios';

const API_ORIGIN = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';
const API_BASE = `${API_ORIGIN}/api`;

export const api = {
  // Market endpoints
  getTicker: () => axios.get(`${API_BASE}/market/ticker`),
  getKlines: (count = 100) => axios.get(`${API_BASE}/market/klines?count=${count}`),
  getSystemHealth: () => axios.get(`${API_BASE}/market/health`),

  // Alert endpoints
  getAlerts: (params = {}) => axios.get(`${API_BASE}/alerts`, { params }),
  getAlertById: (id) => axios.get(`${API_BASE}/alerts/${id}`),
  deleteAlert: (id) => axios.delete(`${API_BASE}/alerts/${id}`),
  getAlertStates: (symbol) => axios.get(`${API_BASE}/alerts/states`, { params: { symbol } }),
  getCustomPriceAlert: (symbol) => axios.get(`${API_BASE}/alerts/custom`, { params: { symbol } }),
  setCustomPriceAlert: (data) => axios.post(`${API_BASE}/alerts/custom`, data),
  deleteCustomPriceAlert: (symbol) => axios.delete(`${API_BASE}/alerts/custom/${symbol || ''}`),
  resetAlertLevel: (level, symbol) => axios.post(`${API_BASE}/alerts/reset`, { level, symbol }),
  getScreenshotStatus: () => axios.get(`${API_BASE}/alerts/screenshots/status`),
  cleanupScreenshots: () => axios.post(`${API_BASE}/alerts/screenshots/cleanup`),

  // Configuration & Historical Levels
  getConfig: () => axios.get(`${API_BASE}/config`),
  updateConfig: (data) => axios.put(`${API_BASE}/config`, data),
  calculatePivots: (data) => axios.post(`${API_BASE}/config/calculate`, data),
  autoCalculatePivots: (data = {}) => axios.post(`${API_BASE}/config/auto-calculate`, data),
  getPivotHistory: (params = {}) => axios.get(`${API_BASE}/config/history`, { params: typeof params === 'string' ? { symbol: params } : params }),

  // Symbol endpoints
  getSymbols: (assetType = 'ALL') => axios.get(`${API_BASE}/symbols?assetType=${assetType}`),
  searchSymbols: (q = '', assetType = 'ALL') => axios.get(`${API_BASE}/symbols/search`, { params: { q, assetType } }),
  getActiveSymbol: () => axios.get(`${API_BASE}/symbols/active`),
  setActiveSymbol: (symbol) => axios.post(`${API_BASE}/symbols/active`, { symbol }),
  validatePivot: (symbol) => axios.get(`${API_BASE}/symbols/validate/${symbol || ''}`),

  // Test & On-demand capture with dynamic timeframe & range
  triggerTestAlert: (level, price) => axios.post(`${API_BASE}/test/trigger-alert`, { level, price }),
  captureScreenshot: (params = {}) => {
    const payload = typeof params === 'string' ? { level: params } : params;
    return axios.post(`${API_BASE}/test/capture-screenshot`, payload);
  },
  testTelegram: (customMessage) => axios.post(`${API_BASE}/test/telegram`, { customMessage })
};
