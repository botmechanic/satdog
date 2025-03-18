'use client';

import React from 'react';
import { useGame } from '@/contexts/GameContext';

export default function TitleScreen() {
  const { showTitle, setShowTitle } = useGame();
  
  if (!showTitle) return null;
  
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white z-50">
      <h1 className="text-5xl font-bold mb-4 text-yellow-400">SatDog&apos;s Signal Snap</h1>
      
      <div className="w-32 h-32 relative my-8">
        <div className="absolute w-full h-full rounded-full border-4 border-dashed border-blue-300 animate-spin" style={{ animationDuration: '20s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-blue-700 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 translate-y-6 translate-x-6">
          <div className="w-10 h-6 bg-yellow-400 rounded-sm flex items-center justify-center">
            <div className="w-8 h-4 bg-yellow-600 rounded-sm text-xs text-center">SatDog</div>
          </div>
        </div>
      </div>
      
      <p className="text-lg mb-8 max-w-md text-center">
        Help SatDog collect 5 satellite components and send a signal home!
      </p>
      
      <div className="bg-gray-800 p-6 rounded-lg mb-8 max-w-md">
        <h2 className="text-xl font-bold mb-3 text-blue-300">Mission Objectives:</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Explore the planet and collect all 5 satellite components</li>
          <li>Assemble the satellite by dragging components to the right spots</li>
          <li>Launch your satellite and send a message home!</li>
        </ol>
      </div>
      
      <button 
        className="px-8 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition text-xl font-bold"
        onClick={() => setShowTitle(false)}
      >
        Start Mission!
      </button>
    </div>
  );
}