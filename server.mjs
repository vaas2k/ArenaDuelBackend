import express from 'express';
import router from './ROUTER/router.mjs';
import { Redis } from 'ioredis';
import Creds from './config/config.js';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import EventEmitter from 'events';
import { matchEvents } from './SERVICES/matchmaking/findMatchEvents.js';
import { socket_connection } from './ROUTER/sockets.js';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();
const event = new EventEmitter();

const app = express();
const PORT = 8080;

const redis = new Redis({
    host: Creds.REDIS_HOST,
    password: Creds.REDIS_PASSWORD,
    port: Creds.REDIS_PORT
});

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ["*"],
        credentials: true
    }
});

socket_connection();

redis.on('connect', () => {
    console.log("REDIS CONNECTED");
});

app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(router);

// Ensure server.listen is called only once
server.listen(PORT, () => {
    console.log(`Server Running on PORT: ${PORT}`);
});

matchEvents();

export {
    redis,
    event,
    io,
    prisma
}
