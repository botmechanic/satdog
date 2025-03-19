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
  const cameraTargetRef = useRef(new THREE.Vector3(0, 0, 0));
  
  useFrame(() => {
    if (playerRef.current) {
      // Get the player's position
      const playerPosition = playerRef.current.position.clone();
      
      // Calculate the camera target (slightly smoothed)
      cameraTargetRef.current.lerp(playerPosition, 0.1);
      
      // Calculate camera position (offset from player)
      const idealOffset = new THREE.Vector3(0, 3, 6);
      
      // Rotate the offset based on player's position on the planet
      const playerDirection = playerPosition.clone().normalize();
      const quaternion = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        playerDirection
      );
      
      // Apply the rotation to get the proper camera offset
      idealOffset.applyQuaternion(quaternion);
      
      // Add the offset to the player position
      const idealPosition = playerPosition.clone().add(idealOffset);
      
      // Smoothly move the camera
      cameraPositionRef.current.lerp(idealPosition, 0.05);
      
      // Update camera position and target
      camera.position.copy(cameraPositionRef.current);
      camera.lookAt(playerPosition);
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
          <Canvas shadows camera={{ position: [0, 7, 10], fov: 50 }}>
            <color attach="background" args={['#000020']} />
            <ambientLight intensity={0.6} />
            <directionalLight
              position={[10, 10, 10]}
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
            <spotLight position={[0, 8, 8]} angle={0.5} penumbra={0.5} intensity={0.8} castShadow />
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