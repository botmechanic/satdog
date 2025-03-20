'use client';

import { useRef, useState } from 'react';
import { Billboard, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGame } from '@/contexts/GameContext';

// Define story scenes that will be placed in different biomes
const STORY_SCENES = [
  {
    id: 'disaster-response',
    biome: 'desert', // Place in desert biome
    position: [-45, 0, 40], // Approximate position
    title: 'Disaster Response',
    description: 'After an earthquake, satellite communications provide critical connectivity when ground infrastructure is damaged.',
    visuals: {
      type: 'scene',
      elements: [
        { type: 'building', position: [-1, 0, 0], state: 'damaged', scale: 1.2 },
        { type: 'building', position: [1, 0, 1], state: 'damaged', scale: 0.8 },
        { type: 'person', position: [0, 0, -1], state: 'working', scale: 1 },
        { type: 'satellite-dish', position: [0.5, 0, -1.5], scale: 1 }
      ]
    },
    dataBeam: {
      active: true,
      color: '#ff9800',
      pulseRate: 1.2
    }
  },
  {
    id: 'rural-healthcare',
    biome: 'forest', // Place in forest biome
    position: [30, 0, -60], // Approximate position 
    title: 'Rural Healthcare',
    description: 'Remote medical facilities use satellite IoT to monitor patient data and coordinate with specialists worldwide.',
    visuals: {
      type: 'scene',
      elements: [
        { type: 'building', position: [0, 0, 0], state: 'clinic', scale: 1 },
        { type: 'person', position: [-1, 0, 0.5], state: 'doctor', scale: 1 },
        { type: 'person', position: [1, 0, 0.5], state: 'patient', scale: 1 },
        { type: 'equipment', position: [0, 0, -1], state: 'medical', scale: 1 }
      ]
    },
    dataBeam: {
      active: true,
      color: '#4caf50',
      pulseRate: 0.8
    }
  },
  {
    id: 'maritime-tracking',
    biome: 'water', // Place near water (lake)
    position: [70, 0, 50], // Approximate position
    title: 'Maritime Tracking',
    description: 'Ships rely on satellite connectivity for navigation, weather data, and emergency communications in remote waters.',
    visuals: {
      type: 'scene',
      elements: [
        { type: 'water', position: [0, -0.2, 0], scale: 3 },
        { type: 'boat', position: [0, 0, 0], scale: 1.2 },
        { type: 'person', position: [0, 0.3, 0], state: 'captain', scale: 0.8 }
      ]
    },
    dataBeam: {
      active: true,
      color: '#2196f3',
      pulseRate: 1.5
    }
  },
  {
    id: 'agriculture',
    biome: 'any', // Can be placed anywhere
    position: [-80, 0, -40], // Approximate position
    title: 'Smart Agriculture',
    description: 'Satellite IoT sensors monitor soil moisture, weather patterns, and crop health to optimize farming operations.',
    visuals: {
      type: 'scene',
      elements: [
        { type: 'field', position: [0, 0, 0], scale: 2 },
        { type: 'sensor', position: [-1, 0.5, 0], scale: 0.5 },
        { type: 'sensor', position: [1, 0.5, 0], scale: 0.5 },
        { type: 'sensor', position: [0, 0.5, 1], scale: 0.5 }
      ]
    },
    dataBeam: {
      active: true,
      color: '#8bc34a',
      pulseRate: 0.6
    }
  },
  {
    id: 'wildlife-conservation',
    biome: 'forest', // Place in forest biome
    position: [-20, 0, -90], // Approximate position
    title: 'Wildlife Conservation',
    description: 'Tracking collars with satellite connectivity help researchers monitor endangered species across vast habitats.',
    visuals: {
      type: 'scene',
      elements: [
        { type: 'tree', position: [-2, 0, -2], scale: 1.5 },
        { type: 'tree', position: [2, 0, -1], scale: 1.8 },
        { type: 'tree', position: [0, 0, -2], scale: 1.2 },
        { type: 'animal', position: [0, 0, 0], state: 'elephant', scale: 1 }
      ]
    },
    dataBeam: {
      active: true,
      color: '#9c27b0',
      pulseRate: 1
    }
  }
];

// Simple representations of scene elements
interface SceneElementProps {
  type: string;
  position: [number, number, number];
  scale?: number;
  state?: string;
}

function SceneElement({ type, position, scale = 1, state = 'default' }: SceneElementProps) {
  const [x, y, z] = position;
  
  // Building element
  if (type === 'building') {
    const color = state === 'damaged' ? '#a1887f' : (state === 'clinic' ? '#bbdefb' : '#e0e0e0');
    const height = state === 'damaged' ? 0.8 * scale : 1.2 * scale;
    
    return (
      <group position={[x, y, z]}>
        <mesh position={[0, height/2, 0]}>
          <boxGeometry args={[1 * scale, height, 1 * scale]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {state === 'damaged' && (
          <mesh position={[0.2, height * 0.7, 0.2]} rotation={[0.3, 0.5, 0.2]}>
            <boxGeometry args={[0.4 * scale, 0.1, 0.3 * scale]} />
            <meshStandardMaterial color="#795548" />
          </mesh>
        )}
        {state === 'clinic' && (
          <mesh position={[0, height * 0.7, 0.51]} rotation={[0, 0, 0]}>
            <planeGeometry args={[0.5 * scale, 0.5 * scale]} />
            <meshBasicMaterial color="#f44336">
              <Text 
                color="white"
                fontSize={0.3 * scale}
                maxWidth={0.5}
                position={[0, 0, 0.01]}
              >
                +
              </Text>
            </meshBasicMaterial>
          </mesh>
        )}
      </group>
    );
  }
  
  // Person element
  else if (type === 'person') {
    const bodyColor = state === 'doctor' ? '#81d4fa' : (state === 'captain' ? '#0d47a1' : '#ffcc80');
    
    return (
      <group position={[x, y, z]} scale={scale}>
        {/* Body */}
        <mesh position={[0, 0.5, 0]}>
          <capsuleGeometry args={[0.2, 0.6, 4, 8]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 1.1, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#ffe0b2" />
        </mesh>
      </group>
    );
  }
  
  // Satellite dish
  else if (type === 'satellite-dish') {
    return (
      <group position={[x, y, z]} scale={scale}>
        {/* Dish */}
        <mesh position={[0, 0.6, 0]} rotation={[Math.PI/4, 0, 0]}>
          <circleGeometry args={[0.5, 16]} />
          <meshStandardMaterial color="#e0e0e0" side={THREE.DoubleSide} />
        </mesh>
        {/* Stand */}
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
          <meshStandardMaterial color="#757575" />
        </mesh>
        {/* Base */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.1, 8]} />
          <meshStandardMaterial color="#424242" />
        </mesh>
      </group>
    );
  }
  
  // Equipment
  else if (type === 'equipment') {
    const color = state === 'medical' ? '#e1f5fe' : '#eeeeee';
    
    return (
      <group position={[x, y, z]} scale={scale}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.6, 1, 0.4]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {state === 'medical' && (
          <>
            <mesh position={[0, 0.8, 0.21]}>
              <planeGeometry args={[0.4, 0.3]} />
              <meshBasicMaterial color="#1976d2" />
            </mesh>
            <mesh position={[-0.2, 0.3, 0.21]}>
              <boxGeometry args={[0.1, 0.1, 0.05]} />
              <meshStandardMaterial color="#f44336" />
            </mesh>
          </>
        )}
      </group>
    );
  }
  
  // Water
  else if (type === 'water') {
    return (
      <mesh position={[x, y, z]} rotation={[-Math.PI/2, 0, 0]} scale={scale}>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial 
          color="#2196f3" 
          transparent 
          opacity={0.7}
          metalness={0.3}
          roughness={0.2}
        />
      </mesh>
    );
  }
  
  // Boat
  else if (type === 'boat') {
    return (
      <group position={[x, y, z]} scale={scale}>
        <mesh position={[0, 0.1, 0]} rotation={[0, Math.PI/2, 0]}>
          <capsuleGeometry args={[0.3, 0.8, 4, 8]} />
          <meshStandardMaterial color="#90a4ae" />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.5, 0.2, 0.3]} />
          <meshStandardMaterial color="#eceff1" />
        </mesh>
      </group>
    );
  }
  
  // Field
  else if (type === 'field') {
    return (
      <group position={[x, y, z]} scale={scale}>
        <mesh position={[0, 0, 0]} rotation={[-Math.PI/2, 0, 0]}>
          <planeGeometry args={[2, 2, 10, 10]} />
          <meshStandardMaterial color="#8bc34a" />
        </mesh>
        {/* Crops in rows */}
        {[...Array(5)].map((_, i) => (
          <group key={`row-${i}`} position={[-1 + i * 0.5, 0.1, 0]}>
            {[...Array(5)].map((_, j) => (
              <mesh 
                key={`plant-${i}-${j}`} 
                position={[0, 0, -1 + j * 0.5]}
                rotation={[0, Math.random() * 0.3, 0]}
              >
                <boxGeometry args={[0.05, 0.2, 0.05]} />
                <meshStandardMaterial color="#689f38" />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    );
  }
  
  // Sensor
  else if (type === 'sensor') {
    return (
      <group position={[x, y, z]} scale={scale}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.2, 0.3, 0.2]} />
          <meshStandardMaterial color="#78909c" />
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
          <meshStandardMaterial color="#424242" />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#4caf50" />
        </mesh>
      </group>
    );
  }
  
  // Tree
  else if (type === 'tree') {
    return (
      <group position={[x, y, z]} scale={scale}>
        <mesh position={[0, 0.8, 0]}>
          <coneGeometry args={[0.6, 1.5, 8]} />
          <meshStandardMaterial color="#388e3c" />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.15, 0.8, 8]} />
          <meshStandardMaterial color="#5d4037" />
        </mesh>
      </group>
    );
  }
  
  // Animal
  else if (type === 'animal') {
    const color = state === 'elephant' ? '#bdbdbd' : '#a1887f';
    
    return (
      <group position={[x, y + 0.5, z]} scale={scale}>
        {/* Body */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
          <capsuleGeometry args={[0.4, 0.8, 4, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {/* Head */}
        <mesh position={[0.6, 0, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {state === 'elephant' && (
          <mesh position={[0.7, -0.2, 0]} rotation={[0, 0, -Math.PI/4]}>
            <cylinderGeometry args={[0.08, 0.05, 0.5, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
        )}
        {/* Tracker */}
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.15, 0.08, 0.3]} />
          <meshStandardMaterial color="#f57c00" />
        </mesh>
      </group>
    );
  }
  
  // Default fallback
  return (
    <mesh position={[x, y, z]} scale={scale}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#f5f5f5" />
    </mesh>
  );
}

// Create a data beam that shows satellite communication
interface DataBeamProps {
  position: [number, number, number];
  color?: string;
  pulseRate?: number;
}

function DataBeam({ position, color = '#2196f3', pulseRate = 1 }: DataBeamProps) {
  const beamRef = useRef<THREE.Group>(null);
  const [time, setTime] = useState(0);
  
  useFrame((state, delta) => {
    setTime(prev => prev + delta);
    if (beamRef.current) {
      beamRef.current.rotation.y += delta * 0.5;
    }
  });
  
  return (
    <group ref={beamRef} position={position}>
      {/* Beam going upward */}
      <mesh position={[0, 10, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 20, 8, 1, true]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.4} 
          side={THREE.DoubleSide} 
        />
      </mesh>
      
      {/* Pulse effect */}
      {[...Array(3)].map((_, i) => {
        const speed = pulseRate * (1 + i * 0.2);
        const height = ((time * speed) % 20); // Repeating pulse between 0-20
        const opacity = Math.max(0, 1 - height / 20); // Fade out as it goes up
        
        return (
          <mesh key={`pulse-${i}`} position={[0, height, 0]}>
            <torusGeometry args={[0.2, 0.05, 8, 16]} />
            <meshBasicMaterial 
              color={color} 
              transparent 
              opacity={opacity * 0.8} 
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Story scene component that renders a complete scene
function StoryScene({ scene }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const sceneRef = useRef<THREE.Group>(null);
  
  // Billboard for the scene label that's always visible
  return (
    <group position={scene.position}>
      {/* Scene elements */}
      <group ref={sceneRef} scale={1.5}>
        {scene.visuals.elements.map((element, i) => (
          <SceneElement 
            key={`element-${i}`}
            type={element.type}
            position={element.position}
            state={element.state}
            scale={element.scale}
          />
        ))}
      </group>
      
      {/* Satellite data beam */}
      {scene.dataBeam.active && (
        <DataBeam 
          position={[0, 0, 0]} 
          color={scene.dataBeam.color}
          pulseRate={scene.dataBeam.pulseRate}
        />
      )}
      
      {/* Scene floating label/icon (always visible) */}
      <Billboard
        position={[0, 4, 0]}
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false}
      >
        <mesh 
          onClick={() => setShowTooltip(!showTooltip)}
          onPointerOver={() => setShowTooltip(true)}
          onPointerOut={() => setShowTooltip(false)}
        >
          <planeGeometry args={[1.5, 1.5]} />
          <meshBasicMaterial 
            color={scene.dataBeam.color} 
            transparent 
            opacity={0.8} 
          />
          <Text 
            color="white"
            fontSize={0.3}
            maxWidth={1.2}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
          >
            📡
          </Text>
        </mesh>
      </Billboard>
      
      {/* Information tooltip */}
      {showTooltip && (
        <Billboard
          position={[0, 5.5, 0]}
          follow={true}
          lockX={false}
          lockY={false}
          lockZ={false}
        >
          <mesh>
            <planeGeometry args={[4, 2]} />
            <meshBasicMaterial color="#263238" transparent opacity={0.9} />
          </mesh>
          <group position={[0, 0.5, 0.1]}>
            <Text 
              color="white"
              fontSize={0.3}
              font="/fonts/Inter-Bold.woff"
              maxWidth={3.5}
              textAlign="center"
              anchorX="center"
              anchorY="middle"
            >
              {scene.title}
            </Text>
          </group>
          <group position={[0, -0.2, 0.1]}>
            <Text 
              color="#e0e0e0"
              fontSize={0.2}
              maxWidth={3.5}
              textAlign="center"
              anchorX="center"
              anchorY="middle"
            >
              {scene.description}
            </Text>
          </group>
          <group position={[0, -0.8, 0.1]}>
            <Text 
              color="#90caf9"
              fontSize={0.15}
              maxWidth={3.5}
              textAlign="center"
              anchorX="center"
              anchorY="middle"
            >
              Satellite connectivity enables this critical service
            </Text>
          </group>
        </Billboard>
      )}
    </group>
  );
}

// Main component that manages all environmental story scenes
export default function EnvironmentalStories() {
  const { gameState, showTitle } = useGame();
  
  // Don't render stories during title screen or assembly/completion states
  if (showTitle || gameState !== 'playing') return null;
  
  return (
    <group>
      {/* Render all story scenes */}
      {STORY_SCENES.map((scene) => (
        <StoryScene key={scene.id} scene={scene} />
      ))}
      
      {/* Global data visualization - satellite network mesh */}
      <group position={[0, 100, 0]}>
        {/* Satellite network visualization - to do if time permits */}
      </group>
    </group>
  );
}