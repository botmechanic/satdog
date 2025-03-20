'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import Planet from './Planet';
import SatDog from './SatDog';
import Components from './Components';
import AssemblyUI from './AssemblyUI';
import ControlsInfo from './ControlsInfo';
import TitleScreen from './TitleScreen';
import UsernameInput from './UsernameInput';
import OtherPlayers from './OtherPlayers';
import NavigationSystem from './NavigationSystem';
import SpaceEducation from './SpaceEducation';
import SatelliteTechnologies from './SatelliteTechnologies';
import SpaceIndustryApplications from './SpaceIndustryApplications';
import SatelliteConstellations from './SatelliteConstellations';
import EnvironmentalStories from './EnvironmentalStories';
import DataVisualization from './DataVisualization';
import IridiumIoTShowcase from './IridiumIoTShowcase';
import { GameProvider } from '@/contexts/GameContext';
import { MultiplayerProvider } from '@/contexts/MultiplayerContext';
import * as THREE from 'three';

// Fortnite-style camera that follows closely behind the player
function FortniteCamera({ playerRef }: { playerRef: React.RefObject<THREE.Group | null> }) {
  const { camera } = useThree();
  const cameraPositionRef = useRef(new THREE.Vector3(0, 2, 4));
  
  useFrame(() => {
    if (playerRef.current) {
      // Get the player's position
      const playerPosition = playerRef.current.position.clone();
      
      // Fortnite-style camera setup - much closer to player
      const cameraHeight = 2;  // Lower camera height for over-the-shoulder view
      const cameraDistance = 4;  // Closer camera for more immersive feel
      
      // Get the player's forward direction (based on rotation)
      const playerRotation = playerRef.current.rotation.y;
      const offsetX = -Math.sin(playerRotation) * cameraDistance;
      const offsetZ = -Math.cos(playerRotation) * cameraDistance;
      
      // Add slight horizontal offset for over-the-shoulder view
      const shoulderOffset = new THREE.Vector3(
        Math.cos(playerRotation) * 0.7, // Right shoulder offset
        0,
        Math.sin(playerRotation) * 0.7
      );
      
      // Calculate ideal camera position with shoulder offset
      const idealPosition = new THREE.Vector3(
        playerPosition.x + offsetX + shoulderOffset.x,
        playerPosition.y + cameraHeight,
        playerPosition.z + offsetZ + shoulderOffset.z
      );
      
      // Smoothly move the camera with faster response for tighter control
      cameraPositionRef.current.lerp(idealPosition, 0.15);
      
      // Update camera position
      camera.position.copy(cameraPositionRef.current);
      
      // Look slightly above and ahead of the player (aiming position)
      const lookTarget = playerPosition.clone().add(
        new THREE.Vector3(
          Math.sin(playerRotation) * 10, // Look far ahead in movement direction
          0.8, // Slightly above player height
          Math.cos(playerRotation) * 10
        )
      );
      camera.lookAt(lookTarget);
    }
  });
  
  return null;
}

export default function GameComponent() {
  const playerRef = useRef<THREE.Group>(null);
  
  return (
    <KeyboardControls
      map={[
        { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
        { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
        { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
        { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
        { name: 'jump', keys: ['Space'] },
        { name: 'sprint', keys: ['ShiftLeft', 'ShiftRight'] }
      ]}
    >
      <MultiplayerProvider>
        <GameProvider>
          <div className="relative w-full h-full">
            {/* Canvas for 3D elements with pointer-events and keyboard focus */}
            <div className="absolute inset-0 pointer-events-auto" style={{ zIndex: 1 }}>
              <Canvas 
                shadows={false} // Disable shadows for improved performance
                camera={{ position: [0, 2, 4], fov: 70 }} // Lower position and wider FOV for Fortnite-like view
                dpr={[1, 1.5]} // Limit pixel ratio for performance
                performance={{ min: 0.5 }} // Allow automatic performance scaling
                style={{ position: 'absolute', touchAction: 'none' }}
                tabIndex={0} // Make canvas focusable for keyboard input
                className="focus:outline-none" // Remove outline when focused
              >
                <color attach="background" args={['#000020']} />
                <ambientLight intensity={0.7} />
                <directionalLight
                  position={[10, 15, 10]}
                  intensity={0.8}
                  castShadow={false} // Disable expensive shadow casting
                />
                <pointLight position={[0, 6, 0]} intensity={0.7} color="#ffffff" />
                <Suspense fallback={null}>
                  <Planet />
                  <SatDog ref={playerRef} />
                  <EnvironmentalStories />
                  <DataVisualization />
                  <OtherPlayers />
                  <Components />
                  <FortniteCamera playerRef={playerRef} />
                </Suspense>
              </Canvas>
            </div>
            
            {/* UI overlay elements with proper z-index and pointer-events */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="relative w-full h-full z-10">
                {/* Critical UI elements that need pointer events */}
                <div className="ui-overlay pointer-events-auto">
                  <TitleScreen />
                  <UsernameInput />
                </div>
                
                {/* Other UI elements */}
                <AssemblyUI />
                <ControlsInfo />
                <NavigationSystem />
                
                {/* Educational components need proper pointer events */}
                <div className="ui-overlay pointer-events-auto">
                  <SpaceEducation />
                  <SatelliteTechnologies />
                  <SpaceIndustryApplications />
                  <SatelliteConstellations />
                  <IridiumIoTShowcase />
                </div>
              </div>
            </div>
          </div>
        </GameProvider>
      </MultiplayerProvider>
    </KeyboardControls>
  );
}