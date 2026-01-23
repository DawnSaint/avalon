/**
 * Native WebSocket Server with Socket.IO-like API
 * Compatible with uni-app WebSocket client
 */

import { WebSocketServer, WebSocket } from 'ws';
import { Server as HTTPServer } from 'http';
import { parse } from 'url';
import { validateJWT } from '@/user';
import type { UserForUI } from '@avalon/types';
import { EventEmitter } from 'events';

interface WebSocketClient extends WebSocket {
  id: string;
  rooms: Set<string>;
  userID?: string;
  handshake: {
    auth: {
      token?: string;
    };
  };
  data: any;
}

interface Message {
  event: string;
  data: any[];
  ackId?: number;
}

type EventHandler = (...args: any[]) => void | Promise<void>;

/**
 * Socket wrapper that mimics Socket.IO Socket interface
 */
class SocketWrapper extends EventEmitter {
  public id: string;
  public rooms: Set<string>;
  public userID?: string;
  public handshake: { auth: { token?: string } };
  public data: any = {};

  private client: WebSocketClient;
  private server: WSServer;

  constructor(client: WebSocketClient, server: WSServer) {
    super();
    this.client = client;
    this.server = server;
    this.id = client.id;
    this.rooms = client.rooms;
    this.userID = client.userID;
    this.handshake = client.handshake;
  }

  join(room: string) {
    this.server.joinRoom(this.client, room);
  }

  leave(room: string) {
    this.server.leaveRoom(this.client, room);
  }

  // Override emit to send to client instead of triggering local events
  emit(event: string, ...args: any[]): boolean {
    // Check if this is an internal event that should be emitted to listeners
    if (this.listenerCount(event) > 0) {
      // If there are listeners, this is an internal event
      return super.emit(event, ...args);
    } else {
      // Otherwise, send to WebSocket client
      this.server.emitToClient(this.client, event, args[0]);
      return true;
    }
  }

  disconnect() {
    this.client.close();
  }

  // Method to emit internal events (for server use)
  _emitInternal(event: string, ...args: any[]) {
    super.emit(event, ...args);
  }
}

/**
 * Server class that mimics Socket.IO Server interface
 */
export class WSServer extends EventEmitter {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocketClient> = new Map();
  private sockets: Map<string, SocketWrapper> = new Map();
  private rooms: Map<string, Set<string>> = new Map();
  private clientIdCounter = 0;

  constructor(server: HTTPServer) {
    super();
    this.wss = new WebSocketServer({ noServer: true });

    server.on('upgrade', (request, socket, head) => {
      const { pathname, query } = parse(request.url || '', true);

      // Accept connections on /socket.io/ path to maintain compatibility
      if (pathname === '/socket.io/' || pathname === '/ws') {
        this.wss.handleUpgrade(request, socket, head, (ws) => {
          const client = ws as WebSocketClient;
          client.id = `client_${++this.clientIdCounter}`;
          client.rooms = new Set();
          client.data = {};
          client.handshake = {
            auth: {
              token: query.token as string | undefined,
            },
          };

          // Validate JWT
          if (client.handshake.auth.token) {
            try {
              const user = validateJWT(client.handshake.auth.token) as UserForUI;
              client.userID = user.id;
            } catch (e) {
              console.log('Invalid JWT token');
            }
          }

          this.handleConnection(client);
        });
      } else {
        socket.destroy();
      }
    });
  }

  private handleConnection(client: WebSocketClient) {
    this.clients.set(client.id, client);

    // Create socket wrapper
    const socket = new SocketWrapper(client, this);
    this.sockets.set(client.id, socket);

    console.log(`Client ${client.id} connected${client.userID ? ` (user: ${client.userID})` : ''}`);

    client.on('message', (data: Buffer) => {
      try {
        const message: Message = JSON.parse(data.toString());
        this.handleMessage(socket, message);
      } catch (e) {
        console.error('Failed to parse message:', e);
      }
    });

    client.on('close', () => {
      console.log(`Client ${client.id} disconnected`);
      this.handleDisconnect(client);
    });

    client.on('error', (error) => {
      console.error(`Client ${client.id} error:`, error);
    });

    // Emit connection event to server
    this.emit('connection', socket);

    // Send connect event to client
    this.emitToClient(client, 'connect', null);
  }

  private handleMessage(socket: SocketWrapper, message: Message) {
    const { event, data, ackId } = message;

    // Create callback for acknowledgment
    const callback = ackId !== undefined
      ? (response: any) => {
          this.sendAck(socket.client, ackId, response);
        }
      : undefined;

    // Emit event to socket's listeners (registered via socket.on())
    // Use _emitInternal to trigger internal event handlers
    const args = callback ? [...data, callback] : data;
    socket._emitInternal(event, ...args);
  }

  private handleDisconnect(client: WebSocketClient) {
    // Leave all rooms
    Array.from(client.rooms).forEach(room => {
      this.leaveRoom(client, room);
    });

    this.clients.delete(client.id);
    this.sockets.delete(client.id);
  }

  private sendAck(client: WebSocketClient, ackId: number, data: any) {
    const response = {
      event: '',
      data,
      ackId,
    };
    this.sendToClient(client, response);
  }

  private sendToClient(client: WebSocketClient, response: any) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(response));
    }
  }

  public emitToClient(client: WebSocketClient, event: string, data: any) {
    const response = { event, data };
    this.sendToClient(client, response);
  }

  // Public API that mimics Socket.IO

  to(room: string) {
    return {
      emit: (event: string, ...args: any[]) => {
        const clientIds = this.rooms.get(room);
        if (clientIds) {
          clientIds.forEach(clientId => {
            const client = this.clients.get(clientId);
            if (client) {
              this.emitToClient(client, event, args[0]);
            }
          });
        }
      },
    };
  }

  in(room: string) {
    return this.to(room);
  }

  emit(event: string, ...args: any[]) {
    if (event === 'connection') {
      // This is a server event, handle it differently
      super.emit(event, ...args);
      return;
    }

    // Broadcast to all clients
    this.clients.forEach(client => {
      this.emitToClient(client, event, args[0]);
    });
  }

  // Override on() to handle server events properly
  on(event: string, listener: (...args: any[]) => void) {
    super.on(event, listener);
    return this;
  }

  // Override once() for compatibility
  once(event: string, listener: (...args: any[]) => void) {
    super.once(event, listener);
    return this;
  }

  joinRoom(client: WebSocketClient, room: string) {
    client.rooms.add(room);

    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }
    this.rooms.get(room)!.add(client.id);
  }

  leaveRoom(client: WebSocketClient, room: string) {
    client.rooms.delete(room);

    const roomClients = this.rooms.get(room);
    if (roomClients) {
      roomClients.delete(client.id);
      if (roomClients.size === 0) {
        this.rooms.delete(room);
      }
    }
  }

  // Helper method to get socket by ID
  getSocket(id: string): SocketWrapper | undefined {
    return this.sockets.get(id);
  }

  // Get all sockets in a room
  getSocketsInRoom(room: string): SocketWrapper[] {
    const clientIds = this.rooms.get(room);
    if (!clientIds) return [];

    return Array.from(clientIds)
      .map(id => this.sockets.get(id))
      .filter((s): s is SocketWrapper => s !== undefined);
  }
}
