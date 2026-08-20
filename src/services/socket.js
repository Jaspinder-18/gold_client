import { io } from 'socket.io-client';

// Connect to backend server using VITE_API_URL if defined, or port 5001 in local dev
const API_ORIGIN = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';
const SOCKET_URL = API_ORIGIN || (
  (typeof window !== 'undefined' && (window.location.port === '5173' || window.location.port === '3000'))
    ? `http://${window.location.hostname}:5001`
    : window.location.origin
);

export const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 500
});

export const initSocketListeners = (callbacks = {}) => {
  if (callbacks.onConnect) socket.on('connect', callbacks.onConnect);
  if (callbacks.onDisconnect) socket.on('disconnect', callbacks.onDisconnect);
  if (callbacks.onInitialState) socket.on('initial_state', callbacks.onInitialState);
  if (callbacks.onConfigUpdate) socket.on('config_updated', callbacks.onConfigUpdate);
  if (callbacks.onMarketTick) socket.on('market_tick', callbacks.onMarketTick);
  if (callbacks.onAlertTriggered) socket.on('alert_triggered', callbacks.onAlertTriggered);

  // If already connected when listeners are registered
  if (socket.connected && callbacks.onConnect) {
    callbacks.onConnect();
  }

  return () => {
    if (callbacks.onConnect) socket.off('connect', callbacks.onConnect);
    if (callbacks.onDisconnect) socket.off('disconnect', callbacks.onDisconnect);
    if (callbacks.onInitialState) socket.off('initial_state', callbacks.onInitialState);
    if (callbacks.onConfigUpdate) socket.off('config_updated', callbacks.onConfigUpdate);
    if (callbacks.onMarketTick) socket.off('market_tick', callbacks.onMarketTick);
    if (callbacks.onAlertTriggered) socket.off('alert_triggered', callbacks.onAlertTriggered);
  };
};
