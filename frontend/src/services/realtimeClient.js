import { realtimeBus } from './api';

const TOPICS = ['updates', 'projects', 'tasks', 'workers', 'attendance', 'equipment', 'reports', 'notifications'];

function resolveSocketUrl() {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;

  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  if (apiUrl && /^https?:\/\//.test(apiUrl)) {
    const url = new URL(apiUrl);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    url.pathname = '/ws-native';
    url.search = '';
    return url.toString();
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws-native`;
}

function stompFrame(command, headers = {}, body = '') {
  const headerLines = Object.entries(headers).map(([key, value]) => `${key}:${value}`);
  return `${command}\n${headerLines.join('\n')}\n\n${body}\0`;
}

function parseStompFrame(raw) {
  const frame = String(raw || '').replace(/^\n+/, '');
  const separator = frame.indexOf('\n\n');
  if (separator === -1) return null;
  const lines = frame.slice(0, separator).split('\n');
  const command = lines.shift();
  const headers = Object.fromEntries(lines.filter(Boolean).map((line) => {
    const index = line.indexOf(':');
    return [line.slice(0, index), line.slice(index + 1)];
  }));
  const body = frame.slice(separator + 2).replace(/\0$/, '');
  return { command, headers, body };
}

class RealtimeClient {
  constructor() {
    this.socket = null;
    this.reconnectTimer = null;
    this.reconnectAttempts = 0;
    this.manualDisconnect = false;
    this.connected = false;
    this.channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('buildtrack-realtime') : null;
    this.channel?.addEventListener('message', (event) => {
      realtimeBus.emit('SERVER_UPDATE', { ...event.data, source: 'tab' });
    });
  }

  connect() {
    if (this.socket || this.manualDisconnect) return;
    try {
      this.socket = new WebSocket(resolveSocketUrl());
      this.socket.onopen = () => {
        this.socket?.send(stompFrame('CONNECT', {
          'accept-version': '1.2,1.1,1.0',
          'heart-beat': '10000,10000',
          ...(localStorage.getItem('accessToken') ? { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } : {}),
        }));
      };
      this.socket.onmessage = (event) => this.handleMessage(event.data);
      this.socket.onerror = () => this.socket?.close();
      this.socket.onclose = () => {
        this.socket = null;
        this.connected = false;
        realtimeBus.emit('REALTIME_STATUS', { connected: false });
        this.scheduleReconnect();
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  handleMessage(rawMessage) {
    const frame = parseStompFrame(rawMessage);
    if (!frame) return;
    if (frame.command === 'CONNECTED') {
      this.connected = true;
      this.reconnectAttempts = 0;
      TOPICS.forEach((topic, index) => {
        this.socket?.send(stompFrame('SUBSCRIBE', { id: `buildtrack-${index}`, destination: `/topic/${topic}`, ack: 'auto' }));
      });
      realtimeBus.emit('REALTIME_STATUS', { connected: true });
      return;
    }
    if (frame.command !== 'MESSAGE') return;
    try {
      realtimeBus.emit('SERVER_UPDATE', JSON.parse(frame.body));
    } catch {
      realtimeBus.emit('SERVER_UPDATE', { domain: 'updates', action: 'changed' });
    }
  }

  scheduleReconnect() {
    if (this.manualDisconnect || this.reconnectTimer) return;
    const delay = Math.min(30000, 1000 * (2 ** this.reconnectAttempts));
    this.reconnectAttempts += 1;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  disconnect() {
    this.manualDisconnect = true;
    window.clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.socket?.close();
    this.socket = null;
    this.connected = false;
  }

  resume() {
    this.manualDisconnect = false;
    this.connect();
  }

  emitUpdate(payload = {}) {
    const event = { domain: 'local', action: 'changed', occurredAt: new Date().toISOString(), ...payload };
    realtimeBus.emit('SERVER_UPDATE', { ...event, source: 'local' });
    this.channel?.postMessage(event);
  }
}

export const realtimeClient = new RealtimeClient();
export default realtimeClient;
