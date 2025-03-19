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
import { GameProvider } from '@/contexts/GameContext';
import * as THREE from 'three';

// Camera that follows the player
function FollowCamera({ playerRef }: { playerRef: React.RefObject<THREE.Group | null> }) {
  const { camera } = useThree();
  const cameraPositionRef = useRef(new THREE.Vector3(0, 7, 10));
  const planetCenterRef = useRef(new THREE.Vector3(0, 0, 0));
  
  useFrame(() => {
    if (playerRef.current) {
      // Get the player's position
      const playerPosition = playerRef.current.position.clone();
      
      // Calculate vector from planet center to player
      const planetToPlayer = playerPosition.clone().sub(planetCenterRef.current);
      const distanceToPlayer = planetToPlayer.length();
      const directionToPlayer = planetToPlayer.normalize();
      
      // Calculate an offset that's between planet center and player
      // This keeps both the planet and player in frame
      const offsetPoint = planetCenterRef.current.clone().add(
        directionToPlayer.multiplyScalar(distanceToPlayer * 0.5)
      );
      
      // Position camera to see both planet and player
      // Increase camera height for better view angle
      const cameraOffset = new THREE.Vector3(0, 5, 7);
      
      // Align camera offset with player's position on the planet
      const playerUpDirection = playerPosition.clone().normalize();
      
      // Create rotation to align with player position
      const lookRotation = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        playerUpDirection
      );
      
      // Apply rotation to camera offset
      cameraOffset.applyQuaternion(lookRotation);
      
      // Final camera position - centered on midpoint between planet and player
      const idealPosition = offsetPoint.clone().add(cameraOffset);
      
      // Smoothly move the camera
      cameraPositionRef.current.lerp(idealPosition, 0.05);
      
      // Update camera position and make it look at player
      camera.position.copy(cameraPositionRef.current);
      
      // Look at a point between planet center and player (weighted toward player)
      const lookTarget = planetCenterRef.current.clone().lerp(playerPosition, 0.7);
      camera.lookAt(lookTarget);
    } else {
      // If player not found, default to looking at planet center
      camera.lookAt(planetCenterRef.current);
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
        { name: 'jump', keys: ['Space'] }
      ]}
    >
      <GameProvider>
        <div className="relative w-full h-full">
          <Canvas shadows camera={{ position: [0, 10, 15], fov: 40 }}>
            <color attach="background" args={['#000020']} />
            <ambientLight intensity={0.7} />
            <directionalLight
              position={[10, 15, 10]}
              intensity={0.8}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
              shadow-camera-far={50}
              shadow-camera-left={-20}
              shadow-camera-right={20}
              shadow-camera-top={20}
              shadow-camera-bottom={-20}
            />
            <pointLight position={[0, 6, 0]} intensity={0.7} color="#ffffff" />
            <spotLight position={[0, 10, 0]} angle={0.6} penumbra={0.6} intensity={0.8} castShadow />
            <Suspense fallback={null}>
              <Planet />
              <SatDog ref={playerRef} />
              <Components />
              <FollowCamera playerRef={playerRef} />
            </Suspense>
            <Stats />
          </Canvas>
          <AssemblyUI />
          <ControlsInfo />
          <TitleScreen />
        </div>
      </GameProvider>
    </KeyboardControls>
  );
}