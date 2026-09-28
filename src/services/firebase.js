import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { api } from './api';

const firebaseConfig = {
  apiKey: 'AIzaSyDBXUjucFx4R-Ydvx2S_buZh3aNiq-EuwQ',
  appId: '1:395068005465:web:b2089e9f93539281a70014',
  messagingSenderId: '395068005465',
  projectId: 'alert-96e3b',
  authDomain: 'alert-96e3b.firebaseapp.com',
  storageBucket: 'alert-96e3b.firebasestorage.app'
};

class WebFirebaseService {
  constructor() {
    this.app = null;
    this.messaging = null;
    this.currentToken = null;
    this.isSupported = typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
    this.foregroundListeners = new Set();
    this._initialized = false;
  }

  getDeviceId() {
    if (typeof window === 'undefined') return 'web_default';
    let id = localStorage.getItem('gold_web_device_id');
    if (!id) {
      id = `web_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem('gold_web_device_id', id);
    }
    return id;
  }

  getDeviceName() {
    if (typeof navigator === 'undefined') return 'Web Browser';
    const ua = navigator.userAgent;
    let browser = 'Browser';
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';

    let os = 'PC';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Macintosh')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    return `${browser} on ${os}`;
  }

  async initialize() {
    if (this._initialized || !this.isSupported) return;

    try {
      const apps = getApps();
      this.app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
      this.messaging = getMessaging(this.app);
      this._initialized = true;

      // Register foreground message handler
      onMessage(this.messaging, (payload) => {
        console.log('[Web Push] Foreground notification received:', payload);
        this.foregroundListeners.forEach(listener => {
          try {
            listener(payload);
          } catch (e) {
            console.error('[Web Push] Listener callback error:', e);
          }
        });
      });

      // Register service worker if supported
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/firebase-messaging-sw.js').catch(err => {
          console.warn('[Web Push] Service worker registration note:', err);
        });
      }
    } catch (err) {
      console.warn('[Web Push] Firebase initialization notice:', err);
    }
  }

  onForegroundMessage(callback) {
    if (typeof callback === 'function') {
      this.foregroundListeners.add(callback);
    }
    return () => {
      this.foregroundListeners.delete(callback);
    };
  }

  async requestPermissionAndRegister(authToken = null) {
    if (!this.isSupported) {
      return { success: false, error: 'Web push notifications are not supported in this browser.' };
    }

    try {
      await this.initialize();

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return { success: false, permission, error: 'Notification permission was denied.' };
      }

      let swReg = undefined;
      if ('serviceWorker' in navigator) {
        swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      }

      const token = await getToken(this.messaging, {
        serviceWorkerRegistration: swReg
      });

      if (!token) {
        return { success: false, error: 'Failed to retrieve Web FCM token.' };
      }

      this.currentToken = token;
      localStorage.setItem('gold_fcm_web_token', token);

      // Register device with backend
      const deviceId = this.getDeviceId();
      const deviceName = this.getDeviceName();

      const regRes = await api.registerDevice({
        deviceId,
        fcmToken: token,
        platform: 'WEB',
        deviceName,
        notificationsEnabled: true
      });

      console.log('[Web Push] Device registered with backend:', regRes.data);

      return {
        success: true,
        token,
        deviceId,
        deviceName,
        permission: 'granted'
      };
    } catch (err) {
      console.error('[Web Push] Error registering push notifications:', err);
      return { success: false, error: err.message };
    }
  }

  async unregisterDevice() {
    try {
      const deviceId = this.getDeviceId();
      await api.removeDeviceById(deviceId);
      localStorage.removeItem('gold_fcm_web_token');
    } catch (_) {}
  }
}

export const webFirebase = new WebFirebaseService();
