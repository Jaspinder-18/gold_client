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
  getAlertStates: () => axios.get(`${API_BASE}/alerts/states`),
  resetAlertLevel: (level) => axios.post(`${API_BASE}/alerts/reset/${level}`),
  getScreenshotStatus: () => axios.get(`${API_BASE}/alerts/screenshots/status`),
  cleanupScreenshots: () => axios.post(`${API_BASE}/alerts/screenshots/cleanup`),

  // Configuration & Historical Levels
  getConfig: () => axios.get(`${API_BASE}/config`),
  updateConfig: (data) => axios.put(`${API_BASE}/config`, data),
  calculatePivots: (data) => axios.post(`${API_BASE}/config/calculate`, data),
  getPivotHistory: () => axios.get(`${API_BASE}/config/history`),

  // Test & On-demand capture with dynamic timeframe & range
  triggerTestAlert: (level, price) => axios.post(`${API_BASE}/test/trigger-alert`, { level, price }),
  captureScreenshot: (params = {}) => {
    const payload = typeof params === 'string' ? { level: params } : params;
    return axios.post(`${API_BASE}/test/capture-screenshot`, payload);
  },
  testTelegram: (customMessage) => axios.post(`${API_BASE}/test/telegram`, { customMessage })
};
