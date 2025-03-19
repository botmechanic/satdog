'use client';

import { useRef, useMemo } from 'react';
import { Box, Circle, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

export default function Planet() {
  const terrainRef = useRef<THREE.Group>(null);
  
  // Platform dimensions
  const PLATFORM_WIDTH = 20;
  const PLATFORM_LENGTH = 20;
  const PLATFORM_HEIGHT = 0.5;
  
  // Generate terrain features
  const terrainFeatures = useMemo(() => {
    const features = [];
    
    // Generate mountains (small hills)
    for (let i = 0; i < 8; i++) {
      const x = (Math.random() - 0.5) * (PLATFORM_WIDTH - 4);
      const z = (Math.random() - 0.5) * (PLATFORM_LENGTH - 4);
      
      features.push({
        type: 'mountain',
        position: [x, 0, z],
        scale: 0.3 + Math.random() * 0.4,
        rotation: Math.random() * Math.PI
      });
    }
    
    // Generate craters (small depressions)
    for (let i = 0; i < 5; i++) {
      const x = (Math.random() - 0.5) * (PLATFORM_WIDTH - 3);
      const z = (Math.random() - 0.5) * (PLATFORM_LENGTH - 3);
      
      features.push({
        type: 'crater',
        position: [x, 0, z],
        scale: 0.3 + Math.random() * 0.2,
        rotation: Math.random() * Math.PI
      });
    }
    
    // Generate lakes (blue patches)
    for (let i = 0; i < 3; i++) {
      const x = (Math.random() - 0.5) * (PLATFORM_WIDTH - 3);
      const z = (Math.random() - 0.5) * (PLATFORM_LENGTH - 3);
      
      features.push({
        type: 'lake',
        position: [x, 0.01, z], // Slightly above the ground to prevent z-fighting
        scale: 0.5 + Math.random() * 0.8,
        rotation: Math.random() * Math.PI
      });
    }
    
    return features;
  }, []);

  // Create grid lines for visual reference
  const gridLines = useMemo(() => {
    const lines = [];
    const gridSize = Math.max(PLATFORM_WIDTH, PLATFORM_LENGTH);
    const spacing = 2; // Grid spacing
    
    for (let i = -gridSize/2; i <= gridSize/2; i += spacing) {
      lines.push({
        start: [i, 0.01, -PLATFORM_LENGTH/2],
        end: [i, 0.01, PLATFORM_LENGTH/2]
      });
      
      lines.push({
        start: [-PLATFORM_WIDTH/2, 0.01, i],
        end: [PLATFORM_WIDTH/2, 0.01, i]
      });
    }
    
    return lines;
  }, [PLATFORM_WIDTH, PLATFORM_LENGTH]);

  return (
    <group ref={terrainRef} position={[0, -0.75, 0]}>
      {/* Main flat platform */}
      <Box 
        args={[PLATFORM_WIDTH, PLATFORM_HEIGHT, PLATFORM_LENGTH]} 
        position={[0, -PLATFORM_HEIGHT/2, 0]} 
        receiveShadow
      >
        <meshStandardMaterial 
          color="#4d8ab5" 
          roughness={0.8}
          metalness={0.2}
        />
      </Box>
      
      {/* Edge boundary to prevent falling off */}
      <Box 
        args={[PLATFORM_WIDTH, 0.4, 0.2]} 
        position={[0, 0.2, PLATFORM_LENGTH/2 + 0.1]} 
        castShadow
      >
        <meshStandardMaterial color="#3a6f8a" roughness={0.9} />
      </Box>
      <Box 
        args={[PLATFORM_WIDTH, 0.4, 0.2]} 
        position={[0, 0.2, -PLATFORM_LENGTH/2 - 0.1]} 
        castShadow
      >
        <meshStandardMaterial color="#3a6f8a" roughness={0.9} />
      </Box>
      <Box 
        args={[0.2, 0.4, PLATFORM_LENGTH]} 
        position={[PLATFORM_WIDTH/2 + 0.1, 0.2, 0]} 
        castShadow
      >
        <meshStandardMaterial color="#3a6f8a" roughness={0.9} />
      </Box>
      <Box 
        args={[0.2, 0.4, PLATFORM_LENGTH]} 
        position={[-PLATFORM_WIDTH/2 - 0.1, 0.2, 0]} 
        castShadow
      >
        <meshStandardMaterial color="#3a6f8a" roughness={0.9} />
      </Box>
      
      {/* Thin grid lines for visual reference as flat boxes */}
      {gridLines.map((line, i) => (
        <Box
          key={`grid-${i}`}
          args={[
            line.start[0] === line.end[0] ? 0.01 : Math.abs(line.end[0] - line.start[0]),
            0.01,
            line.start[2] === line.end[2] ? 0.01 : Math.abs(line.end[2] - line.start[2])
          ]}
          position={[
            (line.start[0] + line.end[0]) / 2,
            line.start[1],
            (line.start[2] + line.end[2]) / 2
          ]}
        >
          <meshBasicMaterial 
            color="#c8ddf0" 
            transparent 
            opacity={0.3} 
          />
        </Box>
      ))}
      
      {/* Terrain features (hills, craters, lakes) */}
      {terrainFeatures.map((feature, i) => {
        if (feature.type === 'mountain') {
          return (
            <Cylinder
              key={`mountain-${i}`}
              args={[0, feature.scale, feature.scale * 0.8, 6]}
              position={[
                feature.position[0],
                feature.position[1] + feature.scale * 0.4,
                feature.position[2]
              ]}
              rotation={[0, feature.rotation, 0]}
              castShadow
            >
              <meshStandardMaterial color="#3a6f8a" roughness={0.9} />
            </Cylinder>
          );
        } else if (feature.type === 'crater') {
          return (
            <Circle
              key={`crater-${i}`}
              args={[feature.scale, 16]}
              position={[
                feature.position[0],
                feature.position[1] + 0.001, // Slightly above to prevent z-fighting
                feature.position[2]
              ]}
              rotation={[-Math.PI / 2, 0, feature.rotation]}
              receiveShadow
            >
              <meshStandardMaterial color="#2c5065" roughness={0.8} />
            </Circle>
          );
        } else if (feature.type === 'lake') {
          return (
            <Circle
              key={`lake-${i}`}
              args={[feature.scale, 16]}
              position={[
                feature.position[0],
                feature.position[1] + 0.002, // Slightly above to prevent z-fighting
                feature.position[2]
              ]}
              rotation={[-Math.PI / 2, 0, feature.rotation]}
            >
              <meshStandardMaterial
                color="#26c9ff"
                roughness={0.1}
                metalness={0.3}
                transparent
                opacity={0.8}
              />
            </Circle>
          );
        }
      })}
      
      {/* Atmospheric haze at the edges */}
      <Box 
        args={[PLATFORM_WIDTH * 1.2, 0.1, PLATFORM_LENGTH * 1.2]} 
        position={[0, -0.4, 0]}
      >
        <meshBasicMaterial 
          color="#7fb8e6" 
          transparent 
          opacity={0.15} 
        />
      </Box>
    </group>
  );
}