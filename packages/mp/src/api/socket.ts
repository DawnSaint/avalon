import { socketURL, userProfilePath } from './const';
import type { Dictionary } from '@/types';

type SocketCallback = (data: any) => void;
type AckCallback = (data: any) => void;

class SocketService {
  private socket: UniApp.SocketTask | null = null;
  private connected: boolean = false;
  private messageQueue: any[] = [];
  private listeners: Map<string, SocketCallback[]> = new Map();
  private ackCallbacks: Map<number, AckCallback> = new Map();
  private ackId: number = 0;
  private reconnectTimer: number | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private auth: Dictionary<string | undefined> = {};

  constructor() {
    this.connect();
  }

  private getAuthToken(): string | undefined {
    try {
      const userProfileInStorage = uni.getStorageSync(userProfilePath);
      if (userProfileInStorage) {
        const profile = JSON.parse(userProfileInStorage);
        return profile?.token;
      }
    } catch (e) {
      console.error('Failed to get auth token:', e);
    }
    return undefined;
  }

  connect() {
    this.auth.token = this.getAuthToken();

    const url = `${socketURL}?token=${this.auth.token || ''}`;

    this.socket = uni.connectSocket({
      url,
      success: () => {
        console.log('WebSocket connecting...');
      },
      fail: (err) => {
        console.error('WebSocket connection failed:', err);
        this.handleReconnect();
      }
    });

    if (this.socket) {
      this.socket.onOpen(() => {
        console.log('WebSocket connected');
        this.connected = true;
        this.reconnectAttempts = 0;
        this.emit('connect');
        this.flushMessageQueue();
      });

      this.socket.onMessage((res) => {
        try {
          const message = JSON.parse(res.data as string);
          this.handleMessage(message);
        } catch (e) {
          console.error('Failed to parse message:', e);
        }
      });

      this.socket.onClose(() => {
        console.log('WebSocket closed');
        this.connected = false;
        this.emit('disconnect');
        this.handleReconnect();
      });

      this.socket.onError((err) => {
        console.error('WebSocket error:', err);
        this.connected = false;
        this.emit('disconnect');
      });
    }

    return this;
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    if (this.reconnectTimer) {
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    this.reconnectTimer = setTimeout(() => {
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
      this.reconnectTimer = null;
      this.connect();
    }, delay) as unknown as number;
  }

  private handleMessage(message: any) {
    const { event, data, ackId } = message;

    if (ackId !== undefined && this.ackCallbacks.has(ackId)) {
      const callback = this.ackCallbacks.get(ackId);
      if (callback) {
        callback(data);
        this.ackCallbacks.delete(ackId);
      }
      return;
    }

    if (event) {
      this.emit(event, data);
    }
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0 && this.connected) {
      const message = this.messageQueue.shift();
      this.sendMessage(message);
    }
  }

  private sendMessage(message: any) {
    if (!this.connected || !this.socket) {
      this.messageQueue.push(message);
      return;
    }

    this.socket.send({
      data: JSON.stringify(message),
      fail: (err) => {
        console.error('Failed to send message:', err);
      }
    });
  }

  emit(event: string, ...args: any[]) {
    if (event === 'connect' || event === 'disconnect') {
      const listeners = this.listeners.get(event) || [];
      listeners.forEach(callback => callback(args[0]));
      return;
    }

    const message = {
      event,
      data: args
    };
    this.sendMessage(message);
  }

  emitWithAck<T = any>(event: string, ...args: any[]): Promise<T> {
    return new Promise((resolve) => {
      const ackId = this.ackId++;
      this.ackCallbacks.set(ackId, resolve);

      const message = {
        event,
        data: args,
        ackId
      };
      this.sendMessage(message);

      setTimeout(() => {
        if (this.ackCallbacks.has(ackId)) {
          this.ackCallbacks.delete(ackId);
          resolve(null as any);
        }
      }, 30000);
    });
  }

  on(event: string, callback: SocketCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback?: SocketCallback) {
    if (!callback) {
      this.listeners.delete(event);
      return;
    }

    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.close({
        success: () => {
          console.log('WebSocket disconnected');
        }
      });
      this.socket = null;
    }
    this.connected = false;
    return this;
  }

  updateAuthToken() {
    this.auth.token = this.getAuthToken();
    this.ackCallbacks.clear();
    this.disconnect();
    setTimeout(() => {
      this.connect();
    }, 100);
  }
}

export const socket = new SocketService();
