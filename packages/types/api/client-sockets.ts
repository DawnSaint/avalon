/**
 * Client-side socket types
 *
 * This file is separated from sockets.ts to avoid requiring socket.io-client
 * dependency in backend builds.
 *
 * Usage:
 * - H5 frontend (packages/ui): Import Socket type from this file
 * - Backend (packages/backend): Use Server and ServerSocket from sockets.ts
 * - Mini-program (packages/mp): Uses native WebSocket, no need for this type
 */

import type { Socket as SuperSocket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from './sockets';

// Client-side socket type (only for H5/web frontend)
export type Socket = SuperSocket<ServerToClientEvents, ClientToServerEvents>;
