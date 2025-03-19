'use client';

import { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';

export default function ControlsInfo() {
  const [showControls, setShowControls] = useState(true);
  const { gameState } = useGame();
  
  // Hide controls after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);

  if (gameState !== 'playing' || !showControls) return null;

  return (
    <div className="absolute top-4 left-4 bg-black/50 text-white p-4 rounded-lg pointer-events-none">
      <h3 className="text-sm font-bold mb-2">Controls:</h3>
      <ul className="text-xs space-y-1">
        <li>WASD or Arrow Keys - Move</li>
        <li>Shift - Sprint</li>
        <li>Space - Jump</li>
        <li>Mouse - Look Around</li>
        <li>Check your radar in the bottom-right corner</li>
        <li>Click the 🛰️ button for satellite education content</li>
        <li>Explore the infinite world and collect all 5 components!</li>
      </ul>
      <div className="mt-2 text-xs text-yellow-300">
        This message will disappear in a few seconds
      </div>
    </div>
  );
}