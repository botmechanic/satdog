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
              <SatDog />
              <Components />
            </Suspense>
            <OrbitControls 
              enablePan={false} 
              maxPolarAngle={Math.PI / 2 - 0.1} 
              minDistance={8} 
              maxDistance={15}
              enableDamping={true}
              dampingFactor={0.05}
              minPolarAngle={Math.PI / 6}
              target={[0, 0, 0]}
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