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
          const jumpDir = position.clone().normalize();
          dogRef.current.position.add(jumpDir.multiplyScalar(jumpHeight));
        }
      }
    }
    
    // Get keyboard state
    const { forward, backward, left, right, jump } = getKeyboardControls() as { forward: boolean; backward: boolean; left: boolean; right: boolean; jump: boolean };
    
    // ------------------------------
    // Calculate movement direction
    // ------------------------------
    
    // Get the up direction based on current position (points away from planet center)
    const upDirection = position.clone().normalize();
    
    // Create a coordinate system for the planet surface at the player's position
    const forwardDirection = new THREE.Vector3(0, 0, 1);
    if (Math.abs(upDirection.y) < 0.99) {
      // If not at poles, compute a tangent direction to planet
      forwardDirection.crossVectors(new THREE.Vector3(0, 1, 0), upDirection).normalize();
    }
    
    // Get camera's forward and right directions projected onto the planet surface
    const cameraForward = new THREE.Vector3(0, 0, -1).applyQuaternion(state.camera.quaternion);
    const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(state.camera.quaternion);
    
    // Project camera directions onto the tangent plane
    const projectedForward = cameraForward.clone().sub(upDirection.clone().multiplyScalar(cameraForward.dot(upDirection))).normalize();
    const projectedRight = cameraRight.clone().sub(upDirection.clone().multiplyScalar(cameraRight.dot(upDirection))).normalize();
    
    // Calculate movement direction based on input and camera orientation
    const moveDirection = new THREE.Vector3();
    if (forward) moveDirection.add(projectedForward);
    if (backward) moveDirection.sub(projectedForward);
    if (right) moveDirection.add(projectedRight);
    if (left) moveDirection.sub(projectedRight);
    
    if (moveDirection.length() > 0) {
      moveDirection.normalize();
    }
    
    // ------------------------------
    // Apply physics
    // ------------------------------
    
    // Current distance from planet center
    const distanceFromCenter = position.length();
    const distanceFromSurface = distanceFromCenter - planetRadius;
    
    // Determine if the character is on the ground
    const isNowOnGround = distanceFromSurface < 1.1;
    if (isNowOnGround !== onGround) {
      setOnGround(isNowOnGround);
      if (isNowOnGround && jumping) {
        setJumping(false);
      }
    }
    
    // Update velocity based on inputs and state
    const newVelocity = velocity.clone();
    
    // Apply movement if on ground
    if (isNowOnGround && moveDirection.length() > 0) {
      // Apply movement force
      const moveSpeed = 5.0 * delta;
      newVelocity.add(moveDirection.multiplyScalar(moveSpeed));
      
      // Slight tail wag while running
      if (tailRef.current && !isWaggingTail) {
        const runWagAngle = Math.sin(state.clock.elapsedTime * 8) * 0.3;
        tailRef.current.rotation.y = runWagAngle;
      }
    }
    
    // Jump if on ground and jump key pressed
    if (jump && isNowOnGround && !jumping) {
      newVelocity.add(upDirection.multiplyScalar(4.0));
      setJumping(true);
      setOnGround(false);
    }
    
    // Apply gravity (always toward planet center)
    const gravityForce = 10.0 * delta;
    newVelocity.add(upDirection.clone().multiplyScalar(-gravityForce));
    
    // Apply damping/friction
    if (isNowOnGround) {
      // Higher friction on ground
      newVelocity.multiplyScalar(0.9);
    } else {
      // Lower air resistance
      newVelocity.multiplyScalar(0.98);
    }
    
    // ------------------------------
    // Update position
    // ------------------------------
    
    // Calculate new position
    const newPosition = position.clone().add(newVelocity);
    
    // Ensure player stays at correct distance from planet
    const newDistanceFromCenter = newPosition.length();
    const newUpDirection = newPosition.clone().normalize();
    
    if (newDistanceFromCenter < planetRadius + 1.0) {
      // If too close to planet, push back to surface
      newPosition.copy(newUpDirection.multiplyScalar(planetRadius + 1.0));
      
      // Remove velocity component toward planet
      const normalVelocity = newVelocity.dot(newUpDirection);
      if (normalVelocity < 0) {
        newVelocity.sub(newUpDirection.clone().multiplyScalar(normalVelocity));
        newVelocity.multiplyScalar(0.8); // Add bounce damping
      }
    }
    
    // Update state with new values
    setPosition(newPosition);
    setVelocity(newVelocity);
    
    // Update mesh position
    dogRef.current.position.copy(newPosition);
    
    // Make SatDog look in the direction of movement
    if (moveDirection.length() > 0.1) {
      // Calculate rotation to face movement direction
      const targetQuaternion = new THREE.Quaternion();
      
      // Create a basis where Y is up, and Z is the movement direction
      const tempUp = newUpDirection;
      const tempForward = moveDirection.clone();
      const tempRight = new THREE.Vector3().crossVectors(tempForward, tempUp).normalize();
      tempForward.crossVectors(tempUp, tempRight).normalize();
      
      // Create rotation matrix and convert to quaternion
      const rotMatrix = new THREE.Matrix4().makeBasis(tempRight, tempUp, tempForward);
      targetQuaternion.setFromRotationMatrix(rotMatrix);
      
      // Apply rotation to dog model
      dogRef.current.quaternion.copy(targetQuaternion);
    } else {
      // When not moving, just orient to planet surface
      const normal = newPosition.clone().normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normal);
      dogRef.current.quaternion.copy(quaternion);
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

  // Pass the dog ref to the forwarded ref
  useEffect(() => {
    if (dogRef.current) {
      if (typeof ref === 'function') {
        ref(dogRef.current);
      } else if (ref) {
        ref.current = dogRef.current;
      }
    }
  }, [ref]);

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