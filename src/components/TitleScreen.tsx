'use client';

import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { useMultiplayer } from '@/contexts/MultiplayerContext';

export default function TitleScreen() {
  const { showTitle, setShowTitle } = useGame();
  const { hasJoinedGame, joinGame } = useMultiplayer();
  
  if (!showTitle) return null;
  
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white z-50 overflow-hidden pointer-events-auto">
      {/* Background polygon mesh effect */}
      <div className="absolute inset-0 opacity-20">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i}
            className="absolute" 
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 150 + 50}px`,
              height: `${Math.random() * 150 + 50}px`,
              background: `rgba(${Math.random() * 100 + 50}, ${Math.random() * 100 + 100}, ${Math.random() * 155 + 100}, 0.1)`,
              transform: `rotate(${Math.random() * 360}deg)`,
              borderRadius: '10% 70% 30% 50%',
              animation: `pulse ${Math.random() * 10 + 5}s ease-in-out infinite alternate`
            }}
          />
        ))}
      </div>
      
      <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 tracking-tighter">SatDog&apos;s Signal Snap</h1>
      
      {/* Stylized planet with SatDog */}
      <div className="w-40 h-40 relative my-8">
        <div className="absolute w-full h-full rounded-full border-4 border-dashed border-blue-300 animate-spin" style={{ animationDuration: '20s' }}></div>
        <div className="absolute w-32 h-32 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-blue-600 to-blue-900 rounded-full shadow-lg shadow-blue-500/50"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32">
          {Array.from({ length: 6 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute bg-blue-200 opacity-20 rounded-full animate-orbit"
              style={{
                width: '8px',
                height: '8px',
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${15 + i}s`
              }}
            />
          ))}
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 translate-y-8 translate-x-8">
          <div className="w-12 h-8 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-md flex items-center justify-center shadow-lg shadow-yellow-400/30">
            <div className="w-10 h-6 bg-yellow-600 rounded-sm text-xs font-bold flex items-center justify-center">SatDog</div>
          </div>
        </div>
      </div>
      
      <p className="text-xl mb-8 max-w-md text-center font-light">
        Help SatDog collect 5 satellite components and send a signal home!
      </p>
      
      <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 p-6 rounded-lg mb-8 max-w-md backdrop-blur-sm border border-gray-700">
        <h2 className="text-xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Mission Objectives:</h2>
        <ol className="list-decimal list-inside space-y-3 text-md">
          <li className="text-blue-100">Explore the planet and collect all 5 satellite components</li>
          <li className="text-blue-100">Assemble the satellite by dragging components to the right spots</li>
          <li className="text-blue-100">Launch your satellite and send a message home!</li>
        </ol>
      </div>
      
      <button 
        className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition text-xl font-bold shadow-lg shadow-green-500/30 transform hover:scale-105 pointer-events-auto cursor-pointer"
        onClick={() => {
          console.log("Start Mission button clicked");
          setShowTitle(false);
          // If already joined the game via username input, don't ask again
          if (!hasJoinedGame) {
            joinGame();
          }
        }}
      >
        Start Mission!
      </button>
      
      <p className="mt-4 text-blue-200">
        <span className="font-bold">⚡ NEW:</span> Multiplayer mode enabled! Explore with other players.
      </p>
    </div>
  );
}