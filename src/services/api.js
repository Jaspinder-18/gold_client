import axios from 'axios';

const RENDER_BACKEND_URL = 'https://gold-server-dbbq.onrender.com';

const API_ORIGIN = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '') 
  : (typeof window !== 'undefined' && window.location.hostname === 'localhost' && window.location.port === '5001'
      ? ''
      : RENDER_BACKEND_URL);

const API_BASE = `${API_ORIGIN}/api`;

// Create configured axios instance
export const apiClient = axios.create({
  baseURL: API_BASE
});

// Request Interceptor: Attach JWT Bearer token
apiClient.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('gold_session_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (_) {}
  return config;
}, (error) => Promise.reject(error));

// Response Interceptor: Handle 401 Unauthorized Session Expired
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('[API] 401 Unauthorized - clearing invalid session.');
      try {
        localStorage.removeItem('gold_session_token');
        localStorage.removeItem('gold_user_profile');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('gold_auth_expired'));
        }
      } catch (_) {}
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Market endpoints
  getTicker: (symbol = '') => apiClient.get('/market/ticker', { params: symbol ? { symbol } : {} }),
  getKlines: (count = 120, symbol = '', timeframe = '5') => apiClient.get('/market/klines', { params: { count, symbol, timeframe } }),
  getSystemHealth: () => apiClient.get('/market/health'),

  // Multi-Price Alert Endpoints (Strict User Ownership)
  getActiveAlerts: (symbol, userEmail) => apiClient.get('/alerts/custom/list', { 
    params: { 
      symbol, 
      ...(userEmail ? { userEmail: String(userEmail).trim().toLowerCase() } : {}) 
    } 
  }),
  createAlert: (data) => apiClient.post('/alerts/custom/create', data),
  deleteAlertById: (id, symbol) => apiClient.delete(`/alerts/custom/${id}`, { params: { symbol } }),
  clearAllAlerts: (symbol, userEmail) => apiClient.post('/alerts/custom/clear', { 
    symbol, 
    ...(userEmail ? { userEmail: String(userEmail).trim().toLowerCase() } : {}) 
  }),

  // User Authentication
  login: (data) => apiClient.post('/auth/login', data),
  register: (data) => apiClient.post('/auth/register', data),
  logout: (data) => apiClient.post('/auth/logout', data),
  resetPassword: (data) => apiClient.post('/auth/reset-password', data),
  getProfile: (email) => apiClient.get('/auth/profile', { params: email ? { email: String(email).trim().toLowerCase() } : {} }),
  updateNotifications: (data) => apiClient.post('/auth/notifications', data),

  // Dedicated Multi-Device Management Endpoints
  registerDevice: (data) => apiClient.post('/devices/register', data),
  getConnectedDevices: () => apiClient.get('/devices'),
  updateDeviceNotifications: (deviceId, enabled) => apiClient.put(`/devices/${deviceId}/notifications`, { enabled }),
  removeDeviceById: (deviceId) => apiClient.delete(`/devices/${deviceId}`),
  testDevicePush: (deviceId) => apiClient.post(`/devices/${deviceId}/test`),

  // Legacy Device Endpoints Compatibility
  getDevices: (email) => apiClient.get('/devices', { params: email ? { email: String(email).trim().toLowerCase() } : {} }),
  removeDevice: (email, token, deviceId) => {
    if (deviceId) {
      return apiClient.delete(`/devices/${deviceId}`);
    }
    return apiClient.post('/auth/devices/remove', { email: String(email).trim().toLowerCase(), token });
  },

  // Alert History & System
  getAlerts: (params = {}) => apiClient.get('/alerts', { params }),
  getAlertById: (id) => apiClient.get(`/alerts/${id}`),
  deleteAlert: (id) => apiClient.delete(`/alerts/${id}`),
  getAlertStates: (symbol) => apiClient.get('/alerts/states', { params: { symbol } }),
  resetAlertLevel: (level, symbol) => apiClient.post('/alerts/reset', { level, symbol }),
  getScreenshotStatus: () => apiClient.get('/alerts/screenshots/status'),
  cleanupScreenshots: () => apiClient.post('/alerts/screenshots/cleanup'),

  // Legacy Single Alert Endpoints (Backward Compatibility)
  getCustomPriceAlert: (symbol) => apiClient.get('/alerts/custom', { params: { symbol } }),
  setCustomPriceAlert: (data) => apiClient.post('/alerts/custom', data),
  deleteCustomPriceAlert: (symbol) => apiClient.delete('/alerts/custom', { params: { symbol } }),

  // Firebase Cloud Messaging (FCM) Endpoints
  registerFcmToken: (data) => apiClient.post('/alerts/fcm/register', data),
  unregisterFcmToken: (token) => apiClient.post('/alerts/fcm/unregister', { token }),
  testFcmPush: (token) => apiClient.post('/alerts/fcm/test', { token }),

  // Configuration & Historical Levels
  getConfig: (symbol) => apiClient.get('/config', { params: symbol ? { symbol } : {} }),
  updateConfig: (data) => apiClient.put('/config', data),
  calculatePivots: (data) => apiClient.post('/config/calculate', data),
  autoCalculatePivots: (data = {}) => apiClient.post('/config/auto-calculate', data),
  getPivotHistory: (params = {}) => apiClient.get('/config/history', { params: typeof params === 'string' ? { symbol: params } : params }),

  // Symbol endpoints
  getSymbols: (assetType = 'ALL') => apiClient.get(`/symbols?assetType=${assetType}`),
  searchSymbols: (q = '', assetType = 'ALL') => apiClient.get('/symbols/search', { params: { q, assetType } }),
  getActiveSymbol: () => apiClient.get('/symbols/active'),
  setActiveSymbol: (symbol) => apiClient.post('/symbols/active', { symbol }),
  validatePivot: (symbol) => apiClient.get(`/symbols/validate/${symbol || ''}`),

  // Test & On-demand capture with dynamic timeframe & range
  triggerTestAlert: (level, price) => apiClient.post('/test/trigger-alert', { level, price }),
  captureScreenshot: (params = {}) => {
    const payload = typeof params === 'string' ? { level: params } : params;
    return apiClient.post('/test/capture-screenshot', payload);
  },
  testTelegram: (customMessage) => apiClient.post('/test/telegram', { customMessage }),
  getScreenshotUrl: (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const clean = path.startsWith('/') ? path : `/${path}`;
    return `${API_ORIGIN}${clean}`;
  }
};
