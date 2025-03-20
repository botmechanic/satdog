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

// Camera that follows the player on flat terrain
function FollowCamera({ playerRef }: { playerRef: React.RefObject<THREE.Group | null> }) {
  const { camera } = useThree();
  const cameraPositionRef = useRef(new THREE.Vector3(0, 15, 20));
  
  useFrame(() => {
    if (playerRef.current) {
      // Get the player's position
      const playerPosition = playerRef.current.position.clone();
      
      // Enhanced camera setup for infinite terrain
      // Higher camera position with greater distance for better view
      const cameraHeight = 15;  // Increased from 8 for better overview
      const cameraDistance = 20;  // Increased from 12 for wider view
      
      // Get the player's forward direction (based on their rotation)
      const playerRotation = playerRef.current.rotation.y;
      const offsetX = -Math.sin(playerRotation) * cameraDistance;
      const offsetZ = -Math.cos(playerRotation) * cameraDistance;
      
      // Calculate ideal camera position
      const idealPosition = new THREE.Vector3(
        playerPosition.x + offsetX,
        playerPosition.y + cameraHeight,
        playerPosition.z + offsetZ
      );
      
      // Smoothly move the camera
      cameraPositionRef.current.lerp(idealPosition, 0.05);
      
      // Update camera position and make it look at player
      camera.position.copy(cameraPositionRef.current);
      
      // Look slightly above the player for better view
      const lookTarget = playerPosition.clone().add(new THREE.Vector3(0, 0.5, 0));
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
                camera={{ position: [0, 15, 20], fov: 65 }} // Wider field of view and initial position
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
                  <FollowCamera playerRef={playerRef} />
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