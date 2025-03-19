'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Box, Circle, Cylinder } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGame } from '@/contexts/GameContext';

// Chunk size and view distance configuration
const CHUNK_SIZE = 30; // Larger chunk size to reduce number of rendered objects
const RENDER_DISTANCE = 2; // Decreased render distance to improve performance
const VIEW_DISTANCE = CHUNK_SIZE * RENDER_DISTANCE; // Actual view distance in units

// Utility function to generate deterministic random using a seed
function seededRandom(seed: number) {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

// Generate a unique seed for a chunk based on its position
function getChunkSeed(x: number, z: number) {
  return Math.abs(x * 10000 + z);
}

// Component to render a single terrain chunk
function TerrainChunk({ position, seed }: { position: [number, number, number], seed: number }) {
  const chunkRef = useRef<THREE.Group>(null);
  const [chunkX, chunkY, chunkZ] = position;
  
  // Create a seeded random generator for this chunk
  const random = seededRandom(seed);
  
  // Generate terrain features for this chunk - reduced for better performance
  const terrainFeatures = useMemo(() => {
    const features = [];
    
    // Generate mountains (small hills) - reduced count
    const mountainCount = Math.floor(random() * 3) + 1; // 1-3 mountains per chunk
    for (let i = 0; i < mountainCount; i++) {
      const x = (random() - 0.5) * (CHUNK_SIZE - 4);
      const z = (random() - 0.5) * (CHUNK_SIZE - 4);
      
      features.push({
        type: 'mountain',
        position: [x, 0, z],
        scale: 0.3 + random() * 0.5, // Slightly larger scale for fewer mountains
        rotation: random() * Math.PI
      });
    }
    
    // Generate craters (small depressions) - reduced count
    // Only add craters to some chunks for performance
    if (random() > 0.4) { // 60% chance to have craters
      const craterCount = Math.floor(random() * 2) + 1; // 1-2 craters per chunk
      for (let i = 0; i < craterCount; i++) {
        const x = (random() - 0.5) * (CHUNK_SIZE - 3);
        const z = (random() - 0.5) * (CHUNK_SIZE - 3);
        
        features.push({
          type: 'crater',
          position: [x, 0, z],
          scale: 0.4 + random() * 0.3, // Slightly larger scale
          rotation: random() * Math.PI
        });
      }
    }
    
    // Generate lakes (blue patches) - reduced frequency
    if (random() > 0.6) { // 40% chance to have lakes
      const lakeCount = 1; // Just 1 lake per chunk
      for (let i = 0; i < lakeCount; i++) {
        const x = (random() - 0.5) * (CHUNK_SIZE - 3);
        const z = (random() - 0.5) * (CHUNK_SIZE - 3);
        
        features.push({
          type: 'lake',
          position: [x, 0.01, z], // Slightly above the ground to prevent z-fighting
          scale: 0.7 + random() * 0.8, // Slightly larger lakes
          rotation: random() * Math.PI
        });
      }
    }
    
    return features;
  }, [random]);

  // Create simplified grid lines for visual reference - fewer lines for better performance
  const gridLines = useMemo(() => {
    const lines = [];
    const gridSpacing = 6; // Increased spacing for fewer grid lines
    
    for (let i = -CHUNK_SIZE/2; i <= CHUNK_SIZE/2; i += gridSpacing) {
      lines.push({
        start: [i, 0.01, -CHUNK_SIZE/2],
        end: [i, 0.01, CHUNK_SIZE/2]
      });
      
      lines.push({
        start: [-CHUNK_SIZE/2, 0.01, i],
        end: [CHUNK_SIZE/2, 0.01, i]
      });
    }
    
    return lines;
  }, []);

  // Define different terrain types based on position
  const getTerrainType = useMemo(() => {
    // Use the distance from origin to create different biomes
    const distance = Math.sqrt(chunkX * chunkX + chunkZ * chunkZ);
    
    if (distance < 1) {
      return {
        baseColor: "#4d8ab5", // Original blue color
        edgeColor: "#3a6f8a",
        craterColor: "#2c5065",
        mountainColor: "#3a6f8a"
      };
    } else if (distance < 3) {
      return {
        baseColor: "#6b9e7b", // Forest green
        edgeColor: "#4a7b5c",
        craterColor: "#3a6148",
        mountainColor: "#4a7b5c"
      };
    } else if (distance < 5) {
      return {
        baseColor: "#c2a875", // Desert sand
        edgeColor: "#a08b5f",
        craterColor: "#8a7550",
        mountainColor: "#a08b5f"
      };
    } else {
      return {
        baseColor: "#a67262", // Rust red (Mars-like)
        edgeColor: "#7e5549",
        craterColor: "#6b473e",
        mountainColor: "#7e5549"
      };
    }
  }, [chunkX, chunkZ]);

  return (
    <group ref={chunkRef} position={position}>
      {/* Main flat platform */}
      <Box 
        args={[CHUNK_SIZE, 0.5, CHUNK_SIZE]} 
        position={[0, -0.25, 0]} 
        receiveShadow
      >
        <meshStandardMaterial 
          color={getTerrainType.baseColor}
          roughness={0.8}
          metalness={0.2}
        />
      </Box>
      
      {/* Optional grid lines - only render when close to origin for performance */}
      {Math.abs(chunkX) < CHUNK_SIZE * 2 && Math.abs(chunkZ) < CHUNK_SIZE * 2 && 
        gridLines.map((line, i) => (
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
              opacity={0.15} // Reduced opacity
            />
          </Box>
        ))
      }
      
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
              <meshStandardMaterial color={getTerrainType.mountainColor} roughness={0.9} />
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
              <meshStandardMaterial color={getTerrainType.craterColor} roughness={0.8} />
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
    </group>
  );
}

export default function Planet() {
  const terrainRef = useRef<THREE.Group>(null);
  const loadedChunks = useRef<Map<string, boolean>>(new Map());
  const playerPosition = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const { components } = useGame();
  
  // Track the currently visible chunks
  const [visibleChunks, setVisibleChunks] = useState<{ key: string; position: [number, number, number]; seed: number }[]>([]);

  // Update player position from components or use default at origin
  useEffect(() => {
    // This assumes the SatDog component is updating the position externally
    const playerComponent = components.find(comp => comp.type === 'OrbitStabilizer');
    if (playerComponent && !playerComponent.collected) {
      playerPosition.current.set(0, 0, 0); // Default starting position
    }
  }, [components]);

  // Track player position and update chunks - with throttling for performance
  const lastUpdatePos = useRef(new THREE.Vector3(0, 0, 0));
  const updateThreshold = CHUNK_SIZE / 4; // Only update chunks when player has moved significantly
  
  useFrame((state) => {
    // Get the SatDog's position from the camera target
    const target = state.camera.position.clone();
    target.y = 0; // We only care about x and z for chunk loading
    
    // Update player position reference
    playerPosition.current.copy(target);
    
    // Only update chunks when player has moved a significant distance
    if (target.distanceTo(lastUpdatePos.current) > updateThreshold) {
      lastUpdatePos.current.copy(target);
      updateVisibleChunks();
    }
  });

  // Function to calculate which chunks should be visible based on player position
  const updateVisibleChunks = () => {
    const newVisibleChunks: { key: string; position: [number, number, number]; seed: number }[] = [];
    
    // Calculate the chunk the player is standing in
    const playerChunkX = Math.floor(playerPosition.current.x / CHUNK_SIZE);
    const playerChunkZ = Math.floor(playerPosition.current.z / CHUNK_SIZE);
    
    // Generate chunks in a square area around the player
    for (let x = playerChunkX - RENDER_DISTANCE; x <= playerChunkX + RENDER_DISTANCE; x++) {
      for (let z = playerChunkZ - RENDER_DISTANCE; z <= playerChunkZ + RENDER_DISTANCE; z++) {
        const chunkKey = `${x},${z}`;
        
        // Calculate the world position of this chunk
        const worldX = x * CHUNK_SIZE;
        const worldZ = z * CHUNK_SIZE;
        
        // Generate a unique seed based on chunk coordinates
        const seed = getChunkSeed(x, z);
        
        newVisibleChunks.push({
          key: chunkKey,
          position: [worldX, -0.75, worldZ], // Y-position matches the original terrain
          seed: seed
        });
        
        // Mark this chunk as loaded
        loadedChunks.current.set(chunkKey, true);
      }
    }
    
    // Update the list of visible chunks
    setVisibleChunks(newVisibleChunks);
  };

  // Simpler fog effect for better performance
  const fogEffect = useMemo(() => {
    // Use a more aggressive fog effect to hide pop-in and reduce rendering load
    return (
      <fog attach="fog" args={['#87ceeb', VIEW_DISTANCE * 0.5, VIEW_DISTANCE * 0.9]} />
    );
  }, []);

  return (
    <group ref={terrainRef}>
      {/* Render all currently visible chunks */}
      {visibleChunks.map(chunk => (
        <TerrainChunk
          key={chunk.key}
          position={chunk.position}
          seed={chunk.seed}
        />
      ))}
      
      {/* Far distance atmospheric haze */}
      {fogEffect}
      
      {/* Add ambient base to provide sense of ground in the far distance */}
      <mesh position={[0, -10, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[VIEW_DISTANCE * 10, VIEW_DISTANCE * 10]} />
        <meshBasicMaterial color="#1e4d6b" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}