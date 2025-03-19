import { createContext, useContext, useState, ReactNode } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { Player } from '@/server/socket';

interface MultiplayerContextType {
  players: Record<string, Player>;
  currentPlayerId: string | null;
  isConnected: boolean;
  username: string;
  setUsername: (name: string) => void;
  joinGame: () => void;
  updatePlayerPosition: (
    position: { x: number; y: number; z: number },
    rotation: number,
    isMoving: boolean,
    isJumping: boolean
  ) => void;
  collectComponent: (componentType: string) => void;
  hasJoinedGame: boolean;
}

const MultiplayerContext = createContext<MultiplayerContextType | undefined>(undefined);

export function useMultiplayer() {
  const context = useContext(MultiplayerContext);
  if (!context) {
    throw new Error('useMultiplayer must be used within a MultiplayerProvider');
  }
  return context;
}

export function MultiplayerProvider({ children }: { children: ReactNode }) {
  const {
    players,
    isConnected,
    socketId,
    joinGame: socketJoinGame,
    updatePlayerPosition: socketUpdatePlayerPosition,
    collectComponent: socketCollectComponent,
  } = useSocket();

  const [username, setUsername] = useState('');
  const [hasJoinedGame, setHasJoinedGame] = useState(false);

  // Function to join the game
  const joinGame = () => {
    if (isConnected && !hasJoinedGame) {
      socketJoinGame(username || `Player-${Math.floor(Math.random() * 1000)}`);
      setHasJoinedGame(true);
    }
  };

  // Functions to handle player actions
  const updatePlayerPosition = (
    position: { x: number; y: number; z: number },
    rotation: number,
    isMoving: boolean,
    isJumping: boolean
  ) => {
    if (isConnected && hasJoinedGame) {
      socketUpdatePlayerPosition(position, rotation, isMoving, isJumping);
    }
  };

  const collectComponent = (componentType: string) => {
    if (isConnected && hasJoinedGame) {
      socketCollectComponent(componentType);
    }
  };

  return (
    <MultiplayerContext.Provider value={{
      players,
      currentPlayerId: socketId,
      isConnected,
      username,
      setUsername,
      joinGame,
      updatePlayerPosition,
      collectComponent,
      hasJoinedGame
    }}>
      {children}
    </MultiplayerContext.Provider>
  );
}