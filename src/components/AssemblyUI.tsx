'use client';

import { useState, useEffect } from 'react';
import { useGame, ComponentType } from '@/contexts/GameContext';

const COMPONENT_DETAILS: Record<ComponentType, { color: string; size: string; order: number }> = {
  'Antenna': { color: 'bg-blue-400', size: 'h-16 w-8', order: 1 },
  'Modem': { color: 'bg-orange-400', size: 'h-8 w-16', order: 2 },
  'SolarPanel': { color: 'bg-green-500', size: 'h-14 w-16', order: 3 },
  'Battery': { color: 'bg-purple-500', size: 'h-12 w-10', order: 4 },
  'OrbitStabilizer': { color: 'bg-yellow-500', size: 'h-10 w-10', order: 5 },
};

export default function AssemblyUI() {
  const { collectedComponents, assembledComponents, assembleComponent, gameState, launchSatellite } = useGame();
  const [draggedComponent, setDraggedComponent] = useState<ComponentType | null>(null);
  const [message, setMessage] = useState('');
  const [showOrbit, setShowOrbit] = useState(false);

  // Reset when game state changes
  useEffect(() => {
    setDraggedComponent(null);
    setMessage('');
    setShowOrbit(false);
  }, [gameState]);

  // Handle component assembly completion
  useEffect(() => {
    if (gameState === 'completed') {
      setMessage('Woof! I\'m OK!');
      setShowOrbit(true);
    }
  }, [gameState]);

  if (gameState === 'playing') return null;

  const availableComponents = collectedComponents.filter(
    comp => !assembledComponents.includes(comp)
  );

  const handleDragStart = (component: ComponentType) => {
    setDraggedComponent(component);
  };

  const handleDrop = (targetOrder: number) => {
    if (!draggedComponent) return;
    
    // Check if this is the correct position based on order
    const componentOrder = COMPONENT_DETAILS[draggedComponent].order;
    
    if (componentOrder === targetOrder) {
      assembleComponent(draggedComponent);
      setDraggedComponent(null);
    } else {
      // Wrong position
      setMessage('Not quite right! Try a different spot.');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 pointer-events-auto">
      {gameState === 'assembling' && (
        <>
          <h2 className="text-2xl font-bold text-white mb-4">Assemble the Satellite</h2>
          
          {message && (
            <div className="text-yellow-300 mb-4">{message}</div>
          )}
          
          {/* Satellite assembly area */}
          <div className="bg-gray-800 p-8 rounded-lg mb-8">
            <div className="relative w-64 h-64 bg-gray-700 rounded-lg flex flex-col items-center justify-center">
              {/* Satellite blueprint/guides */}
              <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 h-16 w-12 border-2 border-dashed border-blue-200 rounded-t-lg"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(1)}
              >
                {assembledComponents.includes('Antenna') && (
                  <div className={`${COMPONENT_DETAILS['Antenna'].color} ${COMPONENT_DETAILS['Antenna'].size} rounded-t-lg flex items-center justify-center shadow-lg transform translate-x-2`}>
                    <div className="h-4 w-4 rounded-full bg-blue-200"></div>
                  </div>
                )}
              </div>
              
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-20 border-2 border-dashed border-orange-200 rounded"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(2)}
              >
                {assembledComponents.includes('Modem') && (
                  <div className={`${COMPONENT_DETAILS['Modem'].color} ${COMPONENT_DETAILS['Modem'].size} rounded flex items-center justify-center shadow-lg`}>
                    <div className="h-2 w-10 bg-orange-300 rounded-full"></div>
                  </div>
                )}
              </div>
              
              <div 
                className="absolute top-1/4 right-0 h-16 w-20 border-2 border-dashed border-green-200 rounded"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(3)}
              >
                {assembledComponents.includes('SolarPanel') && (
                  <div className={`${COMPONENT_DETAILS['SolarPanel'].color} ${COMPONENT_DETAILS['SolarPanel'].size} rounded flex items-center justify-center shadow-lg`}>
                    <div className="grid grid-cols-3 gap-1">
                      {[...Array(9)].map((_, i) => (
                        <div key={i} className="h-2 w-2 bg-green-600"></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div 
                className="absolute bottom-4 left-4 h-14 w-12 border-2 border-dashed border-purple-200 rounded"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(4)}
              >
                {assembledComponents.includes('Battery') && (
                  <div className={`${COMPONENT_DETAILS['Battery'].color} ${COMPONENT_DETAILS['Battery'].size} rounded flex items-center justify-center shadow-lg`}>
                    <div className="h-2 w-4 bg-purple-300 rounded-t-sm"></div>
                  </div>
                )}
              </div>
              
              <div 
                className="absolute bottom-4 right-4 h-12 w-12 border-2 border-dashed border-yellow-200 rounded-full"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(5)}
              >
                {assembledComponents.includes('OrbitStabilizer') && (
                  <div className={`${COMPONENT_DETAILS['OrbitStabilizer'].color} ${COMPONENT_DETAILS['OrbitStabilizer'].size} rounded-full flex items-center justify-center shadow-lg`}>
                    <div className="h-6 w-6 border-4 border-yellow-300 rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Components inventory */}
          <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="text-white mb-2">Components</h3>
            <div className="flex gap-4 justify-center">
              {availableComponents.map(component => (
                <div 
                  key={component}
                  className={`${COMPONENT_DETAILS[component].color} ${COMPONENT_DETAILS[component].size} rounded cursor-grab flex items-center justify-center shadow-lg`}
                  draggable
                  onDragStart={() => handleDragStart(component)}
                >
                  <span className="text-xs font-bold text-white">{component}</span>
                </div>
              ))}
              
              {availableComponents.length === 0 && assembledComponents.length < 5 && (
                <div className="text-gray-400">Collect more components!</div>
              )}
              
              {availableComponents.length === 0 && assembledComponents.length === 5 && (
                <button 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  onClick={launchSatellite}
                >
                  Launch Satellite!
                </button>
              )}
            </div>
          </div>
        </>
      )}
      
      {gameState === 'completed' && (
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Satellite Launched!</h2>
          
          {/* Orbit visualization */}
          <div className="relative w-64 h-64 mx-auto mb-8">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-dashed border-blue-300 animate-spin" style={{ animationDuration: '20s' }}></div>
            
            {/* Planet */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-blue-700 rounded-full"></div>
            
            {/* Satellite */}
            {showOrbit && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 animate-orbit">
                <div className="w-8 h-6 bg-gray-300 rounded flex flex-col items-center">
                  <div className="w-1 h-3 bg-blue-400"></div>
                  <div className="w-6 h-1 bg-green-500"></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Message bubble */}
          <div className="bg-white rounded-lg p-4 max-w-xs mx-auto shadow-lg">
            <div className="text-center font-bold text-xl">{message}</div>
            <div className="mt-2 text-sm">Signal sent successfully! 🛰️</div>
          </div>
          
          <button 
            className="mt-8 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            onClick={() => window.location.reload()}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}