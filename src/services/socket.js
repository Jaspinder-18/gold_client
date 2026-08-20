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
  
  const handleInitial = (state) => callbacks.onInitialState && callbacks.onInitialState(state);
  socket.on('initial:state', handleInitial);
  socket.on('initial_state', handleInitial);

  const handleConfig = (cfg) => callbacks.onConfigUpdate && callbacks.onConfigUpdate(cfg);
  socket.on('config:update', handleConfig);
  socket.on('config_updated', handleConfig);

  const handleTick = (data) => callbacks.onMarketTick && callbacks.onMarketTick(data);
  socket.on('market:tick', handleTick);
  socket.on('market_tick', handleTick);

  const handleAlert = (payload) => callbacks.onAlertTriggered && callbacks.onAlertTriggered(payload);
  socket.on('alert:triggered', handleAlert);
  socket.on('alert_triggered', handleAlert);

  const handleSymbolActive = (data) => callbacks.onSymbolActive && callbacks.onSymbolActive(data);
  socket.on('symbol:active', handleSymbolActive);

  const handlePivotState = (data) => callbacks.onPivotState && callbacks.onPivotState(data);
  socket.on('pivot:state', handlePivotState);

  const handlePivotUpdated = (data) => {
    if (callbacks.onPivotUpdated) callbacks.onPivotUpdated(data);
    if (callbacks.onPivotState) callbacks.onPivotState(data);
  };
  socket.on('pivotUpdated', handlePivotUpdated);

  // If already connected when listeners are registered
  if (socket.connected && callbacks.onConnect) {
    callbacks.onConnect();
  }

  return () => {
    if (callbacks.onConnect) socket.off('connect', callbacks.onConnect);
    if (callbacks.onDisconnect) socket.off('disconnect', callbacks.onDisconnect);
    socket.off('initial:state', handleInitial);
    socket.off('initial_state', handleInitial);
    socket.off('config:update', handleConfig);
    socket.off('config_updated', handleConfig);
    socket.off('market:tick', handleTick);
    socket.off('market_tick', handleTick);
    socket.off('alert:triggered', handleAlert);
    socket.off('alert_triggered', handleAlert);
    socket.off('symbol:active', handleSymbolActive);
    socket.off('pivot:state', handlePivotState);
    socket.off('pivotUpdated', handlePivotUpdated);
  };
};
