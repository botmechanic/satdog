import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';

export interface Player {
  id: string;
  username: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: number;
  isMoving: boolean;
  isJumping: boolean;
  collectedComponents: string[];
}

export type ServerToClientEvents = {
  playerJoined: (player: Player) => void;
  playerLeft: (playerId: string) => void;
  playersMoved: (players: Record<string, Player>) => void;
  componentCollected: (playerId: string, componentType: string) => void;
  syncState: (players: Record<string, Player>) => void;
};

export type ClientToServerEvents = {
  playerMove: (position: { x: number; y: number; z: number }, rotation: number, isMoving: boolean, isJumping: boolean) => void;
  collectComponent: (componentType: string) => void;
  joinGame: (username: string) => void;
};

let io: SocketIOServer<ClientToServerEvents, ServerToClientEvents> | null = null;
const players: Record<string, Player> = {};

export const getSocketServer = () => {
  return io;
};

export const initSocketServer = (req: NextApiRequest, res: NextApiResponse, server: NetServer) => {
  if (io) return io;

  io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(server, {
    path: '/api/socket',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    socket.on('joinGame', (username) => {
      // Create new player
      const newPlayer: Player = {
        id: socket.id,
        username: username || `Player-${socket.id.substring(0, 5)}`,
        position: { x: 0, y: 0.25, z: 0 },
        rotation: 0,
        isMoving: false,
        isJumping: false,
        collectedComponents: [],
      };

      // Add player to our players object
      players[socket.id] = newPlayer;

      // Send the new player their ID and the current state
      socket.emit('syncState', players);

      // Tell everyone a new player has joined
      socket.broadcast.emit('playerJoined', newPlayer);
    });

    socket.on('playerMove', (position, rotation, isMoving, isJumping) => {
      if (players[socket.id]) {
        players[socket.id].position = position;
        players[socket.id].rotation = rotation;
        players[socket.id].isMoving = isMoving;
        players[socket.id].isJumping = isJumping;
        
        // Broadcast player positions to all clients (can be optimized to only send when needed)
        io?.emit('playersMoved', players);
      }
    });

    socket.on('collectComponent', (componentType) => {
      if (players[socket.id] && !players[socket.id].collectedComponents.includes(componentType)) {
        players[socket.id].collectedComponents.push(componentType);
        
        // Broadcast component collection
        io?.emit('componentCollected', socket.id, componentType);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Player disconnected: ${socket.id}`);
      
      // Remove the player from our players object
      if (players[socket.id]) {
        delete players[socket.id];
        
        // Tell everyone the player has left
        socket.broadcast.emit('playerLeft', socket.id);
      }
    });
  });

  return io;
};