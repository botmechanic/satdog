'use client';

import { useState, useRef, useEffect } from 'react';
import { useMultiplayer } from '@/contexts/MultiplayerContext';

export default function UsernameInput() {
  const { setUsername, joinGame, isConnected, hasJoinedGame } = useMultiplayer();
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  // Force enable the button after 3 seconds for deployed environments
  const [forceEnable, setForceEnable] = useState(false);

  // Focus the input when component mounts
  useEffect(() => {
    if (inputRef.current && !hasJoinedGame) {
      inputRef.current.focus();
    }
    
    // Handle connection timeout - force enable after 3 seconds
    const timer = setTimeout(() => {
      setForceEnable(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [hasJoinedGame]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setUsername(inputValue.trim());
      joinGame();
      
      // If socket is not connected, force join anyway after setting username
      if (!isConnected && forceEnable) {
        console.log("Socket not connected, proceeding in single-player mode");
        // Close the modal anyway
        localStorage.setItem('username', inputValue.trim());
      }
    }
  };

  // Hide the form if already joined
  if (hasJoinedGame) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-slate-800 p-6 rounded-lg shadow-lg max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4 text-white">Enter Your Name</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-2 rounded border bg-slate-700 text-white border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={15}
          />
          
          <button
            type="submit"
            disabled={(!isConnected && !forceEnable) || !inputValue.trim()}
            className={`w-full py-2 px-4 rounded font-medium text-white transition-colors ${
              (isConnected || forceEnable) && inputValue.trim()
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-slate-600 cursor-not-allowed'
            }`}
          >
            {isConnected ? 'Join Game' : forceEnable ? 'Join Anyway' : 'Connecting...'}
          </button>
        </form>
      </div>
    </div>
  );
}