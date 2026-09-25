import { api } from './api';

const USER_STORAGE_KEY = 'gold_user_profile';
const TOKEN_STORAGE_KEY = 'gold_session_token';
const AUTH_EVENT_NAME = 'gold_auth_state_changed';

class AuthService {
  constructor() {
    this._listeners = new Set();
  }

  /**
   * Get currently authenticated user profile
   */
  getCurrentUser() {
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.error('[AuthService] Error reading user profile:', err);
      return null;
    }
  }

  /**
   * Get active session token
   */
  getToken() {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY) || null;
    } catch (err) {
      return null;
    }
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn() {
    return !!this.getCurrentUser();
  }

  /**
   * Save user session locally
   */
  _saveSession(user, token) {
    try {
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }

      if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
      } else if (!user) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }

      this._notifyListeners(user);
    } catch (err) {
      console.error('[AuthService] Error writing storage:', err);
    }
  }

  /**
   * Subscribe to auth state updates
   */
  subscribe(listener) {
    if (typeof listener === 'function') {
      this._listeners.add(listener);
      // Immediately call with current user
      listener(this.getCurrentUser());
    }
    return () => {
      this._listeners.delete(listener);
    };
  }

  _notifyListeners(user) {
    this._listeners.forEach(fn => {
      try {
        fn(user);
      } catch (err) {
        console.error('[AuthService] Listener error:', err);
      }
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME, { detail: user }));
    }
  }

  /**
   * Login with email and password (multi-device)
   */
  async login({ email, password }) {
    try {
      const cleanEmail = String(email || '').trim().toLowerCase();
      const payload = {
        email: cleanEmail,
        password,
        platform: 'WEB',
        deviceName: typeof navigator !== 'undefined' ? `${navigator.platform || 'Desktop'} · Web Browser` : 'Web Browser'
      };

      const response = await api.login(payload);
      if (response.data?.success && response.data?.data) {
        const userData = response.data.data.user || response.data.data;
        const token = response.data.data.token || '';
        
        // Ensure notificationsEnabled flag exists
        if (userData.notificationsEnabled === undefined) {
          userData.notificationsEnabled = true;
        }

        this._saveSession(userData, token);
        return { success: true, user: userData, token, message: response.data.message || 'Logged in successfully.' };
      }

      return {
        success: false,
        error: response.data?.error || 'Invalid credentials. Please try again.'
      };
    } catch (err) {
      console.error('[AuthService] Login error:', err);
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Network error during login.'
      };
    }
  }

  /**
   * Register new user (multi-device)
   */
  async register({ fullName, email, password, confirmPassword }) {
    try {
      const cleanEmail = String(email || '').trim().toLowerCase();
      const payload = {
        fullName: String(fullName || '').trim(),
        email: cleanEmail,
        password,
        confirmPassword,
        platform: 'WEB',
        deviceName: typeof navigator !== 'undefined' ? `${navigator.platform || 'Desktop'} · Web Browser` : 'Web Browser'
      };

      const response = await api.register(payload);
      if (response.data?.success && response.data?.data) {
        const userData = response.data.data.user || response.data.data;
        const token = response.data.data.token || '';

        if (userData.notificationsEnabled === undefined) {
          userData.notificationsEnabled = true;
        }

        this._saveSession(userData, token);
        return { success: true, user: userData, token, message: response.data.message || 'Registered successfully.' };
      }

      return {
        success: false,
        error: response.data?.error || 'Registration failed. Please try again.'
      };
    } catch (err) {
      console.error('[AuthService] Registration error:', err);
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Network error during registration.'
      };
    }
  }

  /**
   * Reset / Update user password
   */
  async resetPassword({ email, newPassword, confirmPassword }) {
    try {
      const cleanEmail = String(email || '').trim().toLowerCase();
      const response = await api.resetPassword({
        email: cleanEmail,
        newPassword,
        confirmPassword
      });

      if (response.data?.success && response.data?.data) {
        const userData = response.data.data.user || response.data.data;
        const token = response.data.data.token || '';
        this._saveSession(userData, token);
        return { success: true, user: userData, message: response.data.message || 'Password reset successfully!' };
      }

      return {
        success: false,
        error: response.data?.error || 'Failed to reset password.'
      };
    } catch (err) {
      console.error('[AuthService] Reset password error:', err);
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Network error during password reset.'
      };
    }
  }

  /**
   * Update notification preferences (ON / OFF)
   */
  async updateNotifications(enabled) {
    const user = this.getCurrentUser();
    if (!user || !user.email) {
      return { success: false, error: 'User is not logged in.' };
    }

    try {
      const response = await api.updateNotifications({
        email: user.email,
        enabled: Boolean(enabled)
      });

      if (response.data?.success) {
        const updated = {
          ...user,
          notificationsEnabled: Boolean(enabled)
        };
        this._saveSession(updated, this.getToken());
        return { success: true, notificationsEnabled: Boolean(enabled) };
      }

      return { success: false, error: response.data?.error || 'Failed to update preferences.' };
    } catch (err) {
      console.error('[AuthService] Update notifications error:', err);
      return { success: false, error: err.response?.data?.error || err.message };
    }
  }

  /**
   * Sync and refresh latest profile data (device count, etc.)
   */
  async syncProfile() {
    const user = this.getCurrentUser();
    if (!user || !user.email) return null;

    try {
      const res = await api.getProfile(user.email);
      if (res.data?.success && res.data?.data) {
        const updated = {
          ...user,
          ...res.data.data
        };
        this._saveSession(updated, this.getToken());
        return updated;
      }
    } catch (err) {
      // Ignore background sync errors
    }
    return user;
  }

  /**
   * Get all registered devices and FCM tokens for the current user
   */
  async getDevices() {
    const user = this.getCurrentUser();
    if (!user || !user.email) return { success: false, error: 'User not logged in.', devices: [] };

    try {
      const res = await api.getDevices(user.email);
      if (res.data?.success && res.data?.data) {
        return { 
          success: true, 
          devices: Array.isArray(res.data.data) ? res.data.data : [],
          activeDevicesCount: res.data.activeDevicesCount || 0
        };
      }
      return { success: false, error: res.data?.error || 'Failed to fetch devices.', devices: [] };
    } catch (err) {
      console.error('[AuthService] getDevices error:', err);
      return { success: false, error: err.response?.data?.error || err.message, devices: [] };
    }
  }

  /**
   * Remove / unlink a device by FCM token
   */
  async removeDevice(token) {
    const user = this.getCurrentUser();
    if (!user || !user.email) return { success: false, error: 'User not logged in.' };

    try {
      const res = await api.removeDevice(user.email, token);
      if (res.data?.success) {
        // Refresh local user profile if deviceCount changed
        await this.syncProfile();
        return { 
          success: true, 
          message: res.data?.message || 'Device removed successfully.',
          devices: res.data.data || []
        };
      }
      return { success: false, error: res.data?.error || 'Failed to remove device.' };
    } catch (err) {
      console.error('[AuthService] removeDevice error:', err);
      return { success: false, error: err.response?.data?.error || err.message };
    }
  }

  /**
   * Logout user from this web session
   */
  async logout() {
    const user = this.getCurrentUser();
    try {
      if (user?.email) {
        await api.logout({ email: user.email });
      }
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      this._saveSession(null, null);
    }
    return { success: true };
  }
}

export const authService = new AuthService();
