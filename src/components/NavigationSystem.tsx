'use client';

import { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import * as THREE from 'three';

interface PlayerPosition {
  x: number;
  y: number;
  z: number;
  rotation: number;
}

export default function NavigationSystem() {
  const { components, gameState, showTitle } = useGame();
  const [playerPosition, setPlayerPosition] = useState<PlayerPosition>({ 
    x: 0, y: 0, z: 0, rotation: 0 
  });
  const [closestComponent, setClosestComponent] = useState<{
    type: string;
    distance: number;
    direction: number;
  } | null>(null);
  
  // Update player position from localStorage (set by SatDog component)
  useEffect(() => {
    const updatePlayerPosition = () => {
      const positionData = localStorage.getItem('satDogPosition');
      if (positionData) {
        try {
          const position = JSON.parse(positionData);
          setPlayerPosition(position);
        } catch (e) {
          console.error('Failed to parse player position:', e);
        }
      }
    };
    
    // Initial update
    updatePlayerPosition();
    
    // Set interval to update position regularly
    const interval = setInterval(updatePlayerPosition, 100);
    
    return () => clearInterval(interval);
  }, []);
  
  // Calculate closest component and direction
  useEffect(() => {
    if (!playerPosition || gameState !== 'playing') return;

    let closest = null;
    let minDistance = Infinity;
    
    components.forEach(component => {
      if (component.collected) return;
      
      // Calculate distance to this component
      const dx = component.position[0] - playerPosition.x;
      const dz = component.position[2] - playerPosition.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      // Find the angle between player's forward direction and component
      // Convert to degrees for easier display
      const angleToComponent = Math.atan2(dx, dz) * (180 / Math.PI);
      
      // Convert player rotation to degrees
      const playerAngle = playerPosition.rotation * (180 / Math.PI);
      
      // Calculate relative direction (positive is right, negative is left)
      // Normalize to [-180, 180] range
      let relativeDirection = angleToComponent - playerAngle;
      while (relativeDirection > 180) relativeDirection -= 360;
      while (relativeDirection < -180) relativeDirection += 360;
      
      if (distance < minDistance) {
        minDistance = distance;
        closest = {
          type: component.type,
          distance: distance,
          direction: relativeDirection
        };
      }
    });
    
    setClosestComponent(closest);
  }, [playerPosition, components, gameState]);
  
  // Don't render if game is not in playing state or title is shown
  if (gameState !== 'playing' || showTitle || !closestComponent) return null;
  
  // Get appropriate color based on distance
  const getDistanceColor = (distance: number) => {
    if (distance < 20) return 'text-green-400';
    if (distance < 50) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  // Get arrow character based on direction
  const getDirectionArrow = (direction: number) => {
    if (direction > -22.5 && direction < 22.5) return '↑'; // Forward
    if (direction >= 22.5 && direction < 67.5) return '↗'; // Forward-right
    if (direction >= 67.5 && direction < 112.5) return '→'; // Right
    if (direction >= 112.5 && direction < 157.5) return '↘'; // Back-right
    if (direction >= 157.5 || direction <= -157.5) return '↓'; // Back
    if (direction <= -112.5 && direction > -157.5) return '↙'; // Back-left
    if (direction <= -67.5 && direction > -112.5) return '←'; // Left
    if (direction <= -22.5 && direction > -67.5) return '↖'; // Forward-left
    return '↑'; // Default
  };

  return (
    <div className="absolute bottom-4 right-4 p-4 bg-black/60 rounded-lg text-white flex flex-col items-center">
      {/* Mini radar display */}
      <div className="w-32 h-32 rounded-full border-2 border-slate-600 bg-slate-900/80 relative mb-2">
        {/* Player indicator (center) */}
        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        
        {/* Direction indicator (rotating) */}
        <div 
          className="absolute top-1/2 left-1/2 w-1 h-14 bg-blue-400 rounded-full transform -translate-x-1/2 origin-bottom"
          style={{ 
            transform: `translateX(-50%) rotate(${closestComponent.direction}deg)`,
            opacity: 0.7
          }}
        ></div>
        
        {/* Closest component indicator */}
        <div 
          className={`absolute w-4 h-4 ${getDistanceColor(closestComponent.distance)} rounded-full animate-pulse`}
          style={{ 
            // Position the indicator based on direction and clamped distance
            // Scaled to fit within the radar
            top: `calc(50% - ${Math.min(closestComponent.distance / 3, 14) * Math.cos(closestComponent.direction * Math.PI / 180)}px)`,
            left: `calc(50% + ${Math.min(closestComponent.distance / 3, 14) * Math.sin(closestComponent.direction * Math.PI / 180)}px)`,
            transform: 'translate(-50%, -50%)'
          }}
        ></div>
        
        {/* Direction markers (N, E, S, W) */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs font-bold text-slate-400">N</div>
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-bold text-slate-400">E</div>
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-bold text-slate-400">S</div>
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs font-bold text-slate-400">W</div>
        
        {/* Distance circles */}
        <div className="absolute top-1/2 left-1/2 w-[80%] h-[80%] border border-slate-700 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/2 w-[40%] h-[40%] border border-slate-700 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      {/* Component information */}
      <div className="text-sm mb-1">
        <span className="text-slate-300">Target: </span>
        <span className="text-cyan-300 font-bold">{closestComponent.type}</span>
      </div>
      
      {/* Distance and direction indicators */}
      <div className="flex justify-between w-full text-sm">
        <div>
          <span className="text-slate-300 mr-1">Distance:</span>
          <span className={`${getDistanceColor(closestComponent.distance)} font-bold`}>
            {Math.round(closestComponent.distance)}m
          </span>
        </div>
        <div>
          <span className="text-slate-300 mr-1">Direction:</span>
          <span className="text-yellow-300 text-xl" style={{ lineHeight: 0 }}>
            {getDirectionArrow(closestComponent.direction)}
          </span>
        </div>
      </div>
      
      {/* Progress indicator */}
      <div className="w-full mt-2">
        <div className="text-xs text-slate-300 mb-1 flex justify-between">
          <span>Components: {5 - components.filter(c => !c.collected).length}/5</span>
          <span>{Math.round((5 - components.filter(c => !c.collected).length) / 5 * 100)}%</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full">
          <div 
            className="bg-green-500 h-full rounded-full"
            style={{ width: `${(5 - components.filter(c => !c.collected).length) / 5 * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}