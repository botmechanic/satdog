'use client';

import { useRef, useMemo } from 'react';
import { useMultiplayer } from '@/contexts/MultiplayerContext';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export default function OtherPlayers() {
  const { players, currentPlayerId } = useMultiplayer();
  
  // Filter out the current player to only render other players
  const otherPlayers = useMemo(() => {
    return Object.values(players).filter(player => player.id !== currentPlayerId);
  }, [players, currentPlayerId]);
  
  return (
    <group>
      {otherPlayers.map((player) => (
        <OtherPlayer key={player.id} player={player} />
      ))}
    </group>
  );
}

function OtherPlayer({ player }: { player: { id: string; username: string; position: { x: number; y: number; z: number }; rotation: number; isMoving: boolean; isJumping: boolean; } }) {
  const dogRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const earLeftRef = useRef<THREE.Mesh>(null);
  const earRightRef = useRef<THREE.Mesh>(null);
  const legFrontLeftRef = useRef<THREE.Mesh>(null);
  const legFrontRightRef = useRef<THREE.Mesh>(null);
  const legBackLeftRef = useRef<THREE.Mesh>(null);
  const legBackRightRef = useRef<THREE.Mesh>(null);
  
  // Animate the player based on their state
  useFrame((state) => {
    if (!dogRef.current) return;
    
    // Position the player based on data from the server
    dogRef.current.position.set(
      player.position.x,
      player.position.y,
      player.position.z
    );
    
    // Set rotation
    dogRef.current.rotation.y = player.rotation;
    
    // Animate legs when moving
    if (player.isMoving && 
        legFrontLeftRef.current && legFrontRightRef.current && 
        legBackLeftRef.current && legBackRightRef.current) {
      
      // Calculate leg animation cycle based on time
      const legCycle = state.clock.elapsedTime * 8;
      
      // Front legs move in alternating pattern (diagonal pairs)
      const frontLeftAngle = Math.sin(legCycle) * 0.4;
      const frontRightAngle = Math.sin(legCycle + Math.PI) * 0.4;
      
      // Apply rotations to legs
      legFrontLeftRef.current.rotation.x = frontLeftAngle;
      legFrontRightRef.current.rotation.x = frontRightAngle;
      legBackLeftRef.current.rotation.x = frontRightAngle;
      legBackRightRef.current.rotation.x = frontLeftAngle;
      
      // Also add a slight tail wag during movement
      if (tailRef.current) {
        const runWagAngle = Math.sin(legCycle) * 0.3;
        tailRef.current.rotation.y = runWagAngle;
      }
      
      // Subtle body bob during movement for more lively animation
      if (bodyRef.current) {
        const bobHeight = Math.abs(Math.sin(legCycle * 0.5)) * 0.05;
        bodyRef.current.position.y = bobHeight;
      }
    }
  });
  
  // Different color for other players (light blue)
  const playerColor = "#4fc3f7";
  const playerSecondaryColor = "#29b6f6";
  
  return (
    <group ref={dogRef} position={[player.position.x, player.position.y, player.position.z]}>
      {/* Username display */}
      <Billboard position={[0, 1.2, 0]}>
        <Text
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#000000"
        >
          {player.username}
        </Text>
      </Billboard>
      
      {/* Body */}
      <mesh ref={bodyRef} castShadow>
        <boxGeometry args={[0.8, 0.5, 1.2]} />
        <meshStandardMaterial 
          color={playerColor} 
          roughness={0.7} 
        />
      </mesh>
      
      {/* Head */}
      <mesh ref={headRef} position={[0, 0.3, 0.5]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial 
          color={playerColor} 
          roughness={0.7} 
        />
      </mesh>
      
      {/* Ears */}
      <mesh ref={earLeftRef} position={[-0.25, 0.6, 0.5]} castShadow>
        <coneGeometry args={[0.15, 0.3, 4]} />
        <meshStandardMaterial color={playerSecondaryColor} roughness={0.7} />
      </mesh>
      <mesh ref={earRightRef} position={[0.25, 0.6, 0.5]} castShadow>
        <coneGeometry args={[0.15, 0.3, 4]} />
        <meshStandardMaterial color={playerSecondaryColor} roughness={0.7} />
      </mesh>
      
      {/* Snout */}
      <mesh position={[0, 0.1, 0.8]} castShadow>
        <boxGeometry args={[0.4, 0.3, 0.3]} />
        <meshStandardMaterial color="#404040" roughness={0.9} />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[-0.15, 0.35, 0.81]} castShadow>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshStandardMaterial color="#000000" roughness={0.5} />
      </mesh>
      <mesh position={[0.15, 0.35, 0.81]} castShadow>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshStandardMaterial color="#000000" roughness={0.5} />
      </mesh>
      
      {/* Legs */}
      <mesh ref={legFrontLeftRef} position={[-0.3, -0.4, 0.4]} castShadow>
        <boxGeometry args={[0.2, 0.4, 0.2]} />
        <meshStandardMaterial color={playerSecondaryColor} roughness={0.7} />
      </mesh>
      <mesh ref={legFrontRightRef} position={[0.3, -0.4, 0.4]} castShadow>
        <boxGeometry args={[0.2, 0.4, 0.2]} />
        <meshStandardMaterial color={playerSecondaryColor} roughness={0.7} />
      </mesh>
      <mesh ref={legBackLeftRef} position={[-0.3, -0.4, -0.4]} castShadow>
        <boxGeometry args={[0.2, 0.4, 0.2]} />
        <meshStandardMaterial color={playerSecondaryColor} roughness={0.7} />
      </mesh>
      <mesh ref={legBackRightRef} position={[0.3, -0.4, -0.4]} castShadow>
        <boxGeometry args={[0.2, 0.4, 0.2]} />
        <meshStandardMaterial color={playerSecondaryColor} roughness={0.7} />
      </mesh>
      
      {/* Tail */}
      <mesh ref={tailRef} position={[0, 0.1, -0.7]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshStandardMaterial 
          color={playerColor} 
          roughness={0.7} 
        />
      </mesh>
    </group>
  );
}