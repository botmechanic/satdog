'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats, KeyboardControls } from '@react-three/drei';
import Planet from './Planet';
import SatDog from './SatDog';
import Components from './Components';
import AssemblyUI from './AssemblyUI';
import ControlsInfo from './ControlsInfo';
import TitleScreen from './TitleScreen';
import { GameProvider } from '@/contexts/GameContext';

export default function GameComponent() {
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
          <Canvas shadows camera={{ position: [0, 12, 18], fov: 45 }}>
            <color attach="background" args={['#000020']} />
            <ambientLight intensity={0.5} />
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
            <pointLight position={[0, 10, 0]} intensity={0.5} color="#ffffff" />
            <Suspense fallback={null}>
              <Planet />
              <SatDog />
              <Components />
            </Suspense>
            <OrbitControls 
              enablePan={false} 
              maxPolarAngle={Math.PI / 2 - 0.1} 
              minDistance={12} 
              maxDistance={20}
              enableDamping={true}
              dampingFactor={0.05}
            />
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