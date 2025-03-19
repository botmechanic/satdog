'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type ComponentType = 'Antenna' | 'Modem' | 'SolarPanel' | 'Battery' | 'OrbitStabilizer';

export interface ComponentData {
  type: ComponentType;
  position: [number, number, number];
  collected: boolean;
  description: string;
  fact: string;
}

interface GameContextType {
  components: ComponentData[];
  collectedComponents: ComponentType[];
  assembledComponents: ComponentType[];
  gameState: 'playing' | 'assembling' | 'completed';
  collectComponent: (type: ComponentType) => void;
  assembleComponent: (type: ComponentType) => void;
  launchSatellite: () => void;
  resetGame: () => void;
  showTitle: boolean;
  setShowTitle: (show: boolean) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

const INITIAL_COMPONENTS: ComponentData[] = [
  {
    type: 'Antenna',
    position: [8, 0.5, 6],
    collected: false,
    description: 'Sends and receives signals from Earth',
    fact: 'Satellite IoT antennas are optimized for low power, long-range communication!'
  },
  {
    type: 'Modem',
    position: [-7, 0.5, 8],
    collected: false,
    description: 'Sends short burst messages',
    fact: 'IoT modems can send small packets of data (20-50 bytes) perfect for status updates!'
  },
  {
    type: 'SolarPanel',
    position: [-8, 0.5, -5],
    collected: false,
    description: 'Harvests energy from the sun',
    fact: 'Satellite IoT devices can run for years on harvested solar energy!'
  },
  {
    type: 'Battery',
    position: [7, 0.5, -7],
    collected: false,
    description: 'Stores energy for night operations',
    fact: 'Modern batteries keep satellites operating during eclipse periods in orbit!'
  },
  {
    type: 'OrbitStabilizer',
    position: [0, 0.5, -9],
    collected: false,
    description: 'Keeps the satellite pointed correctly',
    fact: 'A global network of satellites can connect 75 billion IoT devices by 2025!'
  },
];

export function GameProvider({ children }: { children: ReactNode }) {
  const [components, setComponents] = useState<ComponentData[]>(INITIAL_COMPONENTS);
  const [collectedComponents, setCollectedComponents] = useState<ComponentType[]>([]);
  const [assembledComponents, setAssembledComponents] = useState<ComponentType[]>([]);
  const [gameState, setGameState] = useState<'playing' | 'assembling' | 'completed'>('playing');
  const [showTitle, setShowTitle] = useState(true);

  const collectComponent = (type: ComponentType) => {
    setComponents(prev => 
      prev.map(comp => 
        comp.type === type ? { ...comp, collected: true } : comp
      )
    );
    
    setCollectedComponents(prev => [...prev, type]);
    
    // When all components are collected, switch to assembly mode
    if (collectedComponents.length + 1 === INITIAL_COMPONENTS.length) {
      setGameState('assembling');
    }
  };

  const assembleComponent = (type: ComponentType) => {
    setAssembledComponents(prev => [...prev, type]);
    
    // When all components are assembled, complete the game
    if (assembledComponents.length + 1 === INITIAL_COMPONENTS.length) {
      setGameState('completed');
    }
  };

  const launchSatellite = () => {
    setGameState('completed');
  };

  const resetGame = () => {
    setComponents(INITIAL_COMPONENTS);
    setCollectedComponents([]);
    setAssembledComponents([]);
    setGameState('playing');
  };

  return (
    <GameContext.Provider value={{
      components,
      collectedComponents,
      assembledComponents,
      gameState,
      collectComponent,
      assembleComponent,
      launchSatellite,
      resetGame,
      showTitle,
      setShowTitle
    }}>
      {children}
    </GameContext.Provider>
  );
}