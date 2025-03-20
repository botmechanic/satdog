import { useState, useCallback } from 'react';
import type { Player } from '@/server/socket';

// Mock socket hook that doesn't actually connect to any server
export const useSocket = () => {
  // Empty players object - no multiplayer functionality
  const [players] = useState<Record<string, Player>>({});
  
  // Always return not connected
  const isConnected = false;
  const socketId = 'local-player';

  // No-op functions that don't do anything
  const joinGame = useCallback((_username: string) => {
    console.log('Multiplayer disabled, playing in single-player mode');
  }, []);

  const updatePlayerPosition = useCallback((_position: any, _rotation: number, _isMoving: boolean, _isJumping: boolean) => {
    // No-op - multiplayer disabled
  }, []);

  const collectComponent = useCallback((_componentType: string) => {
    // No-op - multiplayer disabled
  }, []);

  return {
    socket: null,
    players,
    isConnected,
    socketId,
    joinGame,
    updatePlayerPosition,
    collectComponent,
  };
};