'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGame } from '@/contexts/GameContext';

export default function SatDog() {
  const dogRef = useRef<THREE.Group>(null);
  const [position, setPosition] = useState<THREE.Vector3>(new THREE.Vector3(0, 8, 0));
  const [velocity, setVelocity] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const [onGround, setOnGround] = useState(false);
  const [jumping, setJumping] = useState(false);
  const planetRadius = 7;
  const { components, collectComponent, gameState, showTitle } = useGame();

  // Set up keyboard controls for WASD and Space
  const [, getKeyboardControls] = useKeyboardControls();
  
  useFrame((state, delta) => {
    if (!dogRef.current || gameState !== 'playing' || showTitle) return;
    
    // Get keyboard state
    const { forward, backward, left, right, jump } = getKeyboardControls() as { forward: boolean; backward: boolean; left: boolean; right: boolean; jump: boolean };
    
    // Calculate direction relative to the camera
    const camera = state.camera;
    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3(0, 0, (backward ? 1 : 0) - (forward ? 1 : 0));
    const sideVector = new THREE.Vector3((left ? 1 : 0) - (right ? 1 : 0), 0, 0);
    direction.subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(delta * 5);
      
    // Apply camera's Y-rotation to movement direction
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), camera.rotation.y);
    
    // Only apply horizontal movement (x and z)
    const horizontalVelocity = new THREE.Vector3(direction.x, 0, direction.z);
    
    // Update velocity
    const newVelocity = velocity.clone();
    if ((forward || backward || left || right) && onGround) {
      newVelocity.x = horizontalVelocity.x;
      newVelocity.z = horizontalVelocity.z;
    }
    
    // Jump
    if (jump && onGround) {
      newVelocity.y = 5;
      setOnGround(false);
      setJumping(true);
    }
    
    // Apply gravity
    if (!onGround) {
      newVelocity.y -= delta * 9.8; // Gravity
    }
    
    // Update position
    const newPosition = position.clone().add(newVelocity.clone().multiplyScalar(delta));
    
    // Planet gravity - force the character to stick to the surface
    const distanceFromCenter = newPosition.length();
    
    if (distanceFromCenter < planetRadius + 1) {
      // Calculate normal from the center to the player
      const normal = newPosition.clone().normalize();
      
      // Position the player at the right height above the surface
      newPosition.copy(normal.multiplyScalar(planetRadius + 1));
      
      // Align velocity to the planet's surface
      const up = normal.clone();
      newVelocity.sub(up.multiplyScalar(newVelocity.dot(normal)));
      
      if (!onGround && jumping) {
        setOnGround(true);
        setJumping(false);
      }
    } else {
      setOnGround(false);
    }
    
    // Update state
    setPosition(newPosition);
    setVelocity(newVelocity);
    
    // Update the mesh position
    dogRef.current.position.copy(newPosition);
    
    // Make SatDog look in the direction of movement
    if ((forward || backward || left || right) && horizontalVelocity.length() > 0) {
      const targetRotation = Math.atan2(horizontalVelocity.x, horizontalVelocity.z);
      dogRef.current.rotation.y = targetRotation;
    }
    
    // Check for component collection
    components.forEach(component => {
      if (!component.collected) {
        const componentPos = new THREE.Vector3(...component.position);
        const distance = newPosition.distanceTo(componentPos);
        
        if (distance < 1.5) {
          collectComponent(component.type);
        }
      }
    });
  });

  // Orient the dog to the planet surface
  useEffect(() => {
    if (dogRef.current) {
      const normal = position.clone().normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normal);
      dogRef.current.quaternion.copy(quaternion);
    }
  }, [position]);

  return (
    <group ref={dogRef} position={[0, 8, 0]}>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.5, 1.2]} />
        <meshStandardMaterial color="#f9a825" roughness={0.7} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 0.3, 0.5]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color="#fbc02d" roughness={0.7} />
      </mesh>
      
      {/* Ears */}
      <mesh position={[-0.25, 0.6, 0.5]} castShadow>
        <coneGeometry args={[0.15, 0.3, 4]} />
        <meshStandardMaterial color="#e0a029" roughness={0.7} />
      </mesh>
      <mesh position={[0.25, 0.6, 0.5]} castShadow>
        <coneGeometry args={[0.15, 0.3, 4]} />
        <meshStandardMaterial color="#e0a029" roughness={0.7} />
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
      <mesh position={[-0.3, -0.4, 0.4]} castShadow>
        <boxGeometry args={[0.2, 0.4, 0.2]} />
        <meshStandardMaterial color="#e0a029" roughness={0.7} />
      </mesh>
      <mesh position={[0.3, -0.4, 0.4]} castShadow>
        <boxGeometry args={[0.2, 0.4, 0.2]} />
        <meshStandardMaterial color="#e0a029" roughness={0.7} />
      </mesh>
      <mesh position={[-0.3, -0.4, -0.4]} castShadow>
        <boxGeometry args={[0.2, 0.4, 0.2]} />
        <meshStandardMaterial color="#e0a029" roughness={0.7} />
      </mesh>
      <mesh position={[0.3, -0.4, -0.4]} castShadow>
        <boxGeometry args={[0.2, 0.4, 0.2]} />
        <meshStandardMaterial color="#e0a029" roughness={0.7} />
      </mesh>
      
      {/* Tail */}
      <mesh position={[0, 0.1, -0.7]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshStandardMaterial color="#fbc02d" roughness={0.7} />
      </mesh>
    </group>
  );
}