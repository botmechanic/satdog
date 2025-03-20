'use client';

import { useState, useRef, useEffect } from 'react';
import { useMultiplayer } from '@/contexts/MultiplayerContext';

export default function UsernameInput() {
  const { setUsername, joinGame, hasJoinedGame } = useMultiplayer();
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when component mounts
  useEffect(() => {
    if (inputRef.current && !hasJoinedGame) {
      inputRef.current.focus();
    }
  }, [hasJoinedGame]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      try {
        // Store the username and join game immediately
        const trimmedUsername = inputValue.trim();
        localStorage.setItem('username', trimmedUsername);
        
        // Set username first
        setUsername(trimmedUsername);
        
        // Small delay before joining to ensure state updates properly
        setTimeout(() => {
          joinGame();
          console.log("Username set, starting game");
        }, 10);
      } catch (error) {
        console.error("Error during login:", error);
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
            disabled={!inputValue.trim()}
            className={`w-full py-2 px-4 rounded font-medium text-white transition-colors ${
              inputValue.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-600 cursor-not-allowed'
            }`}
          >
            Start Game
          </button>
        </form>
      </div>
    </div>
  );
}