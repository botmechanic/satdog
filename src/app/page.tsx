'use client';

import dynamic from 'next/dynamic';

// Import the game component dynamically with client-side rendering
const GameComponent = dynamic(() => import('@/components/GameComponent'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen">Loading SatDog's Signal Snap...</div>
});

export default function Home() {
  return (
    <div className="w-full h-screen overflow-hidden">
      <GameComponent />
    </div>
  );
}