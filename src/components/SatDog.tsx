'use client';

import { useRef, useState, useEffect, forwardRef, Ref } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGame } from '@/contexts/GameContext';

const SatDog = forwardRef(function SatDog(props, ref: Ref<THREE.Group>) {
  const dogRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const earLeftRef = useRef<THREE.Mesh>(null);
  const earRightRef = useRef<THREE.Mesh>(null);
  
  const [position, setPosition] = useState<THREE.Vector3>(new THREE.Vector3(0, 5, 0));
  const [velocity, setVelocity] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const [onGround, setOnGround] = useState(false);
  const [jumping, setJumping] = useState(false);
  const [isWaggingTail, setIsWaggingTail] = useState(false);
  const [tailWagSpeed, setTailWagSpeed] = useState(0);
  const [tailWagTime, setTailWagTime] = useState(0);
  const [happyJump, setHappyJump] = useState(false);
  
  const planetRadius = 4;
  const { components, collectComponent, gameState, showTitle, collectedComponents } = useGame();

  // Set up keyboard controls for WASD and Space
  const [, getKeyboardControls] = useKeyboardControls();

  // Handle component collection celebration
  useEffect(() => {
    // Check if component was just collected (compare previous count with current count)
    if (collectedComponents.length > 0 && !isWaggingTail) {
      // Start tail wagging animation
      setIsWaggingTail(true);
      setTailWagSpeed(15);
      setTailWagTime(0);
      
      // Also do a little jump of happiness
      setHappyJump(true);
      
      // Stop animations after 2.5 seconds
      const timeout = setTimeout(() => {
        setIsWaggingTail(false);
        setTailWagSpeed(0);
        setHappyJump(false);
      }, 2500);
      
      return () => clearTimeout(timeout);
    }
  }, [collectedComponents.length, isWaggingTail]);
  
  useFrame((state, delta) => {
    if (!dogRef.current || gameState !== 'playing' || showTitle) return;
    
    // Animate tail wagging
    if (isWaggingTail && tailRef.current) {
      setTailWagTime(prev => prev + delta * tailWagSpeed);
      
      // Wag tail side to side with increasing amplitude
      const wagAngle = Math.sin(tailWagTime) * Math.PI / 3;
      tailRef.current.rotation.set(0, wagAngle, Math.PI / 4);
      
      // Also animate the ears for more enthusiasm
      if (earLeftRef.current && earRightRef.current) {
        const earAngle = Math.sin(tailWagTime * 1.5) * 0.2;
        earLeftRef.current.rotation.z = earAngle - 0.1;
        earRightRef.current.rotation.z = -earAngle + 0.1;
      }
      
      // Add a happy jumping motion if collecting a component
      if (happyJump && dogRef.current) {
        const jumpHeight = Math.sin(tailWagTime * 5) * 0.2;
        if (jumpHeight > 0) {
          dogRef.current.position.y += jumpHeight;
        }
      }
    }
    
    // Get keyboard state
    const { forward, backward, left, right, jump } = getKeyboardControls() as { forward: boolean; backward: boolean; left: boolean; right: boolean; jump: boolean };
    
    // Calculate direction relative to the camera
    const camera = state.camera;
    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3(0, 0, (backward ? 1 : 0) - (forward ? 1 : 0));
    const sideVector = new THREE.Vector3((left ? 1 : 0) - (right ? 1 : 0), 0, 0);
    direction.subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(delta * 2); // Reduced from 5 to 2 for slower movement
      
    // Apply camera's Y-rotation to movement direction
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), camera.rotation.y);
    
    // Only apply horizontal movement (x and z)
    const horizontalVelocity = new THREE.Vector3(direction.x, 0, direction.z);
    
    // Update velocity
    const newVelocity = velocity.clone();
    if ((forward || backward || left || right) && onGround) {
      newVelocity.x = horizontalVelocity.x;
      newVelocity.z = horizontalVelocity.z;
      
      // Slight tail wag while running
      if (tailRef.current && !isWaggingTail) {
        const runWagAngle = Math.sin(state.clock.elapsedTime * 8) * 0.3;
        tailRef.current.rotation.y = runWagAngle;
      }
    }
    
    // Jump - add force in the direction away from planet center
    if (jump && onGround) {
      const jumpDirection = position.clone().normalize();
      newVelocity.add(jumpDirection.multiplyScalar(3)); // Jump along normal direction
      setOnGround(false);
      setJumping(true);
    }
    
    // Apply gravity towards planet center when in air
    if (!onGround) {
      const gravityDirection = position.clone().normalize().multiplyScalar(-1);
      newVelocity.add(gravityDirection.multiplyScalar(delta * 7));
    }
    
    // Update position
    const newPosition = position.clone().add(newVelocity.clone().multiplyScalar(delta));
    
    // Planet gravity - force the character to stick to the surface
    const distanceFromCenter = newPosition.length();
    const normal = newPosition.clone().normalize();
    
    // Distance from planet surface
    const distanceFromSurface = distanceFromCenter - planetRadius;
    
    if (distanceFromSurface < 1.1) {
      // Position the player at the right height above the surface
      newPosition.copy(normal.multiplyScalar(planetRadius + 1));
      
      // If the dog is close enough to the surface or falling towards it, snap to surface
      if (distanceFromSurface < 1.05 || newVelocity.dot(normal) < 0) {
        // Align velocity to the planet's surface by removing any component in the direction of the normal
        const up = normal.clone();
        newVelocity.sub(up.multiplyScalar(newVelocity.dot(normal)));
        
        // Apply friction to prevent sliding
        newVelocity.multiplyScalar(0.9);
        
        if (!onGround) {
          setOnGround(true);
          if (jumping) {
            setJumping(false);
          }
        }
      }
    } else {
      // Apply stronger gravity when further from the planet
      newVelocity.add(normal.multiplyScalar(-delta * 10));
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
    
    // Animate legs when moving
    if ((forward || backward || left || right) && onGround) {
      // Add leg animations here if desired
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
    
    // Pass the dog ref to the forwarded ref
    if (typeof ref === 'function') {
      ref(dogRef.current);
    } else if (ref) {
      ref.current = dogRef.current;
    }
  }, [position, ref]);

  return (
    <group ref={dogRef} position={[0, 5, 0]}>
      {/* Body - with glow effect when collecting */}
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.5, 1.2]} />
        <meshStandardMaterial 
          color="#f9a825" 
          roughness={0.7} 
          emissive={isWaggingTail ? "#ff9500" : "#000000"}
          emissiveIntensity={isWaggingTail ? 0.5 : 0}
        />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 0.3, 0.5]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial 
          color="#fbc02d" 
          roughness={0.7} 
          emissive={isWaggingTail ? "#ff9500" : "#000000"}
          emissiveIntensity={isWaggingTail ? 0.3 : 0}
        />
      </mesh>
      
      {/* Ears - now with animation */}
      <mesh ref={earLeftRef} position={[-0.25, 0.6, 0.5]} castShadow>
        <coneGeometry args={[0.15, 0.3, 4]} />
        <meshStandardMaterial color="#e0a029" roughness={0.7} />
      </mesh>
      <mesh ref={earRightRef} position={[0.25, 0.6, 0.5]} castShadow>
        <coneGeometry args={[0.15, 0.3, 4]} />
        <meshStandardMaterial color="#e0a029" roughness={0.7} />
      </mesh>
      
      {/* Snout */}
      <mesh position={[0, 0.1, 0.8]} castShadow>
        <boxGeometry args={[0.4, 0.3, 0.3]} />
        <meshStandardMaterial color="#404040" roughness={0.9} />
      </mesh>
      
      {/* Eyes - blink when happy */}
      <mesh position={[-0.15, 0.35, 0.81]} castShadow>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshStandardMaterial 
          color="#000000" 
          roughness={0.5} 
          emissive={isWaggingTail ? "#ffffff" : "#000000"}
          emissiveIntensity={isWaggingTail ? 0.5 : 0}
        />
      </mesh>
      <mesh position={[0.15, 0.35, 0.81]} castShadow>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshStandardMaterial 
          color="#000000" 
          roughness={0.5} 
          emissive={isWaggingTail ? "#ffffff" : "#000000"}
          emissiveIntensity={isWaggingTail ? 0.5 : 0}
        />
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
      
      {/* Tail - now animated */}
      <mesh ref={tailRef} position={[0, 0.1, -0.7]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshStandardMaterial 
          color="#fbc02d" 
          roughness={0.7} 
          emissive={isWaggingTail ? "#ff9500" : "#000000"}
          emissiveIntensity={isWaggingTail ? 0.8 : 0}
        />
      </mesh>
      
      {/* Celebration particles when collecting */}
      {isWaggingTail && (
        <group>
          {[...Array(8)].map((_, i) => (
            <mesh 
              key={`particle-${i}`} 
              position={[
                Math.sin(i / 8 * Math.PI * 2) * 0.8,
                Math.cos(i / 8 * Math.PI * 2) * 0.8,
                0
              ]}
            >
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshBasicMaterial 
                color={i % 2 === 0 ? "#ffff00" : "#ff9500"} 
                transparent 
                opacity={Math.sin(tailWagTime * 3 + i) * 0.5 + 0.5} 
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
});

export default SatDog;