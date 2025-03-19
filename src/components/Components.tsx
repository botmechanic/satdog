'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGame, ComponentType } from '@/contexts/GameContext';

// Get a consistent color for each component type
const getComponentColor = (type: ComponentType): string => {
  switch (type) {
    case 'Antenna':
      return '#42A5F5'; // Blue
    case 'Modem':
      return '#FF7043'; // Orange
    case 'SolarPanel':
      return '#4CAF50'; // Green
    case 'Battery':
      return '#9C27B0'; // Purple
    case 'OrbitStabilizer':
      return '#FFC107'; // Amber
    default:
      return '#FFFFFF'; // White
  }
};

// Pulsing ring effect to make components more visible
function PulsingRing({ color }: { color: string }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(1);
  
  useFrame((_, delta) => {
    // Create pulsing effect for scale and opacity
    const newScale = 1 + Math.sin(Date.now() * 0.002) * 0.3;
    setScale(newScale);
    
    // Opacity is inverse of scale for better visual effect
    setOpacity(1 - (newScale - 1) * 2);
  });
  
  return (
    <mesh
      ref={ringRef}
      position={[0, 0.1, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[scale, scale, 1]}
    >
      <ringGeometry args={[0.6, 0.8, 32]} />
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={opacity * 0.7} 
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Create a simple component geometry based on its type
const getComponentGeometry = (type: ComponentType) => {
  switch (type) {
    case 'Antenna':
      return (
        <group>
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
            <meshStandardMaterial color="#90CAF9" metalness={0.6} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.5, 0]} castShadow>
            <coneGeometry args={[0.3, 0.6, 8]} />
            <meshStandardMaterial color="#42A5F5" metalness={0.6} roughness={0.2} />
          </mesh>
        </group>
      );
      
    case 'Modem':
      return (
        <mesh castShadow>
          <boxGeometry args={[0.6, 0.2, 0.4]} />
          <meshStandardMaterial color="#FF7043" metalness={0.3} roughness={0.7} />
        </mesh>
      );
      
    case 'SolarPanel':
      return (
        <group>
          <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <boxGeometry args={[0.8, 0.8, 0.05]} />
            <meshStandardMaterial color="#4CAF50" metalness={0.2} roughness={0.3} />
          </mesh>
          {/* Solar panel grid lines */}
          {[...Array(3)].map((_, i) => (
            <mesh key={`grid-h-${i}`} position={[((i - 1) * 0.25), 0, 0.03]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <boxGeometry args={[0.01, 0.8, 0.01]} />
              <meshStandardMaterial color="#388E3C" />
            </mesh>
          ))}
          {[...Array(3)].map((_, i) => (
            <mesh key={`grid-v-${i}`} position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, Math.PI / 2]} castShadow>
              <boxGeometry args={[0.01, 0.8, 0.01]} />
              <meshStandardMaterial color="#388E3C" />
            </mesh>
          ))}
        </group>
      );
      
    case 'Battery':
      return (
        <group>
          <mesh castShadow>
            <cylinderGeometry args={[0.25, 0.25, 0.6, 16]} />
            <meshStandardMaterial color="#9C27B0" metalness={0.4} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.1, 16]} />
            <meshStandardMaterial color="#7B1FA2" metalness={0.4} roughness={0.6} />
          </mesh>
        </group>
      );
      
    case 'OrbitStabilizer':
      return (
        <group>
          <mesh castShadow>
            <torusGeometry args={[0.3, 0.1, 16, 32]} />
            <meshStandardMaterial color="#FFC107" metalness={0.5} roughness={0.5} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <torusGeometry args={[0.3, 0.1, 16, 32]} />
            <meshStandardMaterial color="#FFC107" metalness={0.5} roughness={0.5} />
          </mesh>
        </group>
      );
      
    default:
      return (
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      );
  }
};

function Component({ type, position, description, fact }: { 
  type: ComponentType; 
  position: [number, number, number]; 
  description: string;
  fact: string;
}) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  // Rotate and hover the component
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.5;
      ref.current.position.y = position[1] + Math.sin(Date.now() * 0.002) * 0.2;
    }
  });

  return (
    <group
      ref={ref}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Enhanced glowing effect */}
      <pointLight intensity={2} distance={4} color="#ffffff" />
      
      {/* Beacon light effect visible from far away */}
      <mesh position={[0, 10, 0]}>
        <cylinderGeometry args={[0.1, 0.5, 20, 8, 1, true]} />
        <meshBasicMaterial color={getComponentColor(type)} side={THREE.BackSide} transparent opacity={0.3} />
      </mesh>
      
      {/* Pulsing ring effect */}
      <PulsingRing color={getComponentColor(type)} />
      
      {/* The actual component */}
      {getComponentGeometry(type)}
      
      {/* Tooltip with background */}
      {hovered && (
        <Billboard position={[0, 1.5, 0]}>
          {/* Background panel for better readability */}
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[2.2, 1.0]} />
            <meshBasicMaterial color="#000000" opacity={0.8} transparent />
          </mesh>
          
          <Text
            fontSize={0.2}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
            maxWidth={2}
          >
            {`${type}: ${description}`}
          </Text>
          <Text
            position={[0, -0.4, 0]}
            fontSize={0.15}
            color="#00ffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
            maxWidth={2}
          >
            {fact}
          </Text>
        </Billboard>
      )}
    </group>
  );
}

export default function Components() {
  const { components, gameState } = useGame();
  
  // Only render components that haven't been collected yet
  return (
    <group visible={gameState === 'playing'}>
      {components.map((component, index) => (
        !component.collected && (
          <Component
            key={`component-${index}`}
            type={component.type}
            position={component.position}
            description={component.description}
            fact={component.fact}
          />
        )
      ))}
    </group>
  );
}