import '@/init';
import express from 'express';
import { createServer } from 'node:http';
import CookieParser from 'cookie-parser';
import cors from 'cors';

import { backendPort, frontendURL } from '@/const';

import { connectDB, DBManager } from '@/db';

import { Manager } from '@/main';
import { ratingScheduler } from '@/scripts/scheduler';
import { WSServer } from '@/websocket/server';

const app = express();
const server = createServer(app);
const corsOpts = {
  cors: {
    origin: frontendURL,
    credentials: true,
  },
};

// Use native WebSocket server instead of Socket.IO
const ws = new WSServer(server);

app.use(CookieParser());
app.use(cors(corsOpts.cors));

connectDB().then(async (mongoose) => {
  const dbManager = new DBManager(mongoose);
  new Manager(ws as any, dbManager);

  // Start the rating scheduler (will initialize ratings if needed)
  await ratingScheduler.start();
  console.log('Rating system initialized and scheduler started');
  console.log('WebSocket server ready (compatible with uni-app)');
});

server.listen(backendPort, () => {
  console.log(`server running at http://localhost:${backendPort}`);
});
