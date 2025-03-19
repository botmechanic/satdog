import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents, Player } from '@/server/socket';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);

  // Initialize socket connection
  useEffect(() => {
    // Create the socket connection only on the client side
    if (typeof window === 'undefined') return;

    // Create socket connection
    const socketInstance = io({
      path: '/api/socket',
      autoConnect: true,
    });

    // Set up event listeners
    socketInstance.on('connect', () => {
      console.log('Connected to server with ID', socketInstance.id);
      setIsConnected(true);
      setSocketId(socketInstance.id);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
      setSocketId(null);
    });

    // Update players when someone joins
    socketInstance.on('playerJoined', (player) => {
      console.log('Player joined:', player);
      setPlayers(prev => ({
        ...prev,
        [player.id]: player
      }));
    });

    // Remove player when they leave
    socketInstance.on('playerLeft', (playerId) => {
      console.log('Player left:', playerId);
      setPlayers(prev => {
        const newPlayers = { ...prev };
        delete newPlayers[playerId];
        return newPlayers;
      });
    });

    // Update player positions
    socketInstance.on('playersMoved', (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    // Handle component collection
    socketInstance.on('componentCollected', (playerId, componentType) => {
      console.log(`Player ${playerId} collected component ${componentType}`);
      setPlayers(prev => {
        if (!prev[playerId]) return prev;
        
        return {
          ...prev,
          [playerId]: {
            ...prev[playerId],
            collectedComponents: [...prev[playerId].collectedComponents, componentType]
          }
        };
      });
    });

    // Sync initial state
    socketInstance.on('syncState', (serverPlayers) => {
      console.log('Initial state sync:', serverPlayers);
      setPlayers(serverPlayers);
    });

    // Set the socket in state
    setSocket(socketInstance);

    // Clean up on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Join the game with a username
  const joinGame = useCallback((username: string) => {
    if (socket && isConnected) {
      socket.emit('joinGame', username);
    }
  }, [socket, isConnected]);

  // Update player movement
  const updatePlayerPosition = useCallback((
    position: { x: number; y: number; z: number },
    rotation: number,
    isMoving: boolean,
    isJumping: boolean
  ) => {
    if (socket && isConnected) {
      socket.emit('playerMove', position, rotation, isMoving, isJumping);
    }
  }, [socket, isConnected]);

  // Collect a component
  const collectComponent = useCallback((componentType: string) => {
    if (socket && isConnected) {
      socket.emit('collectComponent', componentType);
    }
  }, [socket, isConnected]);

  return {
    socket,
    players,
    isConnected,
    socketId,
    joinGame,
    updatePlayerPosition,
    collectComponent,
  };
};