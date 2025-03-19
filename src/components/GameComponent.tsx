'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stats, KeyboardControls } from '@react-three/drei';
import Planet from './Planet';
import SatDog from './SatDog';
import Components from './Components';
import AssemblyUI from './AssemblyUI';
import ControlsInfo from './ControlsInfo';
import TitleScreen from './TitleScreen';
import UsernameInput from './UsernameInput';
import OtherPlayers from './OtherPlayers';
import NavigationSystem from './NavigationSystem';
import { GameProvider } from '@/contexts/GameContext';
import { MultiplayerProvider } from '@/contexts/MultiplayerContext';
import * as THREE from 'three';

// Camera that follows the player on flat terrain
function FollowCamera({ playerRef }: { playerRef: React.RefObject<THREE.Group | null> }) {
  const { camera } = useThree();
  const cameraPositionRef = useRef(new THREE.Vector3(0, 6, 10));
  
  useFrame(() => {
    if (playerRef.current) {
      // Get the player's position
      const playerPosition = playerRef.current.position.clone();
      
      // Enhanced camera setup for infinite terrain
      // Higher camera position with greater distance for better view
      const cameraHeight = 8;
      const cameraDistance = 12;
      
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
            <Canvas 
              shadows={false} // Disable shadows for improved performance
              camera={{ position: [0, 6, 10], fov: 50 }}
              dpr={[1, 1.5]} // Limit pixel ratio for performance
              performance={{ min: 0.5 }} // Allow automatic performance scaling
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
                <OtherPlayers />
                <Components />
                <FollowCamera playerRef={playerRef} />
              </Suspense>
            </Canvas>
            <AssemblyUI />
            <ControlsInfo />
            <TitleScreen />
            <UsernameInput />
            <NavigationSystem />
          </div>
        </GameProvider>
      </MultiplayerProvider>
    </KeyboardControls>
  );
}