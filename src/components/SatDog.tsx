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
  const legFrontLeftRef = useRef<THREE.Mesh>(null);
  const legFrontRightRef = useRef<THREE.Mesh>(null);
  const legBackLeftRef = useRef<THREE.Mesh>(null);
  const legBackRightRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  
  const [position, setPosition] = useState<THREE.Vector3>(new THREE.Vector3(0, 0.25, 0));
  const [onGround, setOnGround] = useState(false);
  const [jumping, setJumping] = useState(false);
  const [isWaggingTail, setIsWaggingTail] = useState(false);
  const [tailWagSpeed, setTailWagSpeed] = useState(0);
  const [tailWagTime, setTailWagTime] = useState(0);
  const [happyJump, setHappyJump] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [idleTimer, setIdleTimer] = useState(0);
  const [idleAnimation, setIdleAnimation] = useState<'breathe' | 'lookAround' | 'stretch'>('breathe');
  
  // Platform dimensions (must match Planet.tsx)
  const PLATFORM_WIDTH = 20;
  const PLATFORM_LENGTH = 20;
  
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
    
    // Animate tail wagging for celebration
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
    // Idle animations when not moving or celebrating
    else if (!isMoving && !isWaggingTail && onGround) {
      // Increment idle timer
      setIdleTimer(prev => prev + delta);
      
      // Switch between idle animations every few seconds
      if (idleTimer > 5) {
        setIdleAnimation(prev => {
          const animations: ('breathe' | 'lookAround' | 'stretch')[] = ['breathe', 'lookAround', 'stretch'];
          const currentIndex = animations.indexOf(prev);
          const nextIndex = (currentIndex + 1) % animations.length;
          return animations[nextIndex];
        });
        setIdleTimer(0);
      }
      
      // Apply different idle animations
      if (bodyRef.current && headRef.current && tailRef.current && 
          earLeftRef.current && earRightRef.current) {
        
        // Subtle breathing animation (body slightly moves up and down)
        if (idleAnimation === 'breathe') {
          const breatheScale = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.02;
          bodyRef.current.scale.set(1, breatheScale, 1);
          
          // Gentle tail movement
          const tailAngle = Math.sin(state.clock.elapsedTime * 2) * 0.1;
          tailRef.current.rotation.set(0, tailAngle, Math.PI / 4);
        }
        
        // Looking around animation
        else if (idleAnimation === 'lookAround') {
          // Head turns from side to side
          const lookAngle = Math.sin(state.clock.elapsedTime * 0.8) * 0.3;
          headRef.current.rotation.y = lookAngle;
          
          // Ears perk up when looking
          const earAngle = Math.abs(Math.sin(state.clock.elapsedTime)) * 0.1;
          earLeftRef.current.rotation.z = -earAngle - 0.1;
          earRightRef.current.rotation.z = earAngle + 0.1;
        }
        
        // Stretching animation
        else if (idleAnimation === 'stretch') {
          // Calculate stretch phase (0 to 1 to 0 over 5 seconds)
          const stretchPhase = Math.min(idleTimer, 5 - idleTimer) / 2.5;
          
          // Body stretches forward
          bodyRef.current.scale.set(1, 1, 1 + stretchPhase * 0.2);
          
          // Tail stretches up during stretch
          tailRef.current.rotation.set(-stretchPhase * 0.5, 0, Math.PI / 4);
          
          // Gentle ear movement
          earLeftRef.current.rotation.z = -stretchPhase * 0.2 - 0.1;
          earRightRef.current.rotation.z = stretchPhase * 0.2 + 0.1;
        }
      }
    }
    
    // Get keyboard state
    const { forward, backward, left, right, jump } = getKeyboardControls() as { forward: boolean; backward: boolean; left: boolean; right: boolean; jump: boolean };
    
    // ---------------------------------------------------------------
    // SIMPLIFIED FLAT TERRAIN MOVEMENT SYSTEM
    // ---------------------------------------------------------------
    
    // Basic state check - are we jumping?
    const isJumping = jumping;
    
    // Gravity is always downward in flat terrain
    
    // Project camera directions for intuitive controls based on view
    const cameraForward = new THREE.Vector3(0, 0, -1).applyQuaternion(state.camera.quaternion);
    cameraForward.y = 0; // Project onto xz plane
    cameraForward.normalize();
    
    const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(state.camera.quaternion);
    cameraRight.y = 0; // Project onto xz plane
    cameraRight.normalize();
    
    // Calculate input direction on the horizontal plane
    const moveDirection = new THREE.Vector3();
    if (forward) moveDirection.add(cameraForward);
    if (backward) moveDirection.sub(cameraForward);
    if (right) moveDirection.add(cameraRight);
    if (left) moveDirection.sub(cameraRight);
    
    // Update movement state for animation system
    const isCurrentlyMoving = moveDirection.length() > 0;
    if (isMoving !== isCurrentlyMoving) {
      setIsMoving(isCurrentlyMoving);
      
      // Reset idle timer when starting/stopping movement
      if (!isCurrentlyMoving) {
        setIdleTimer(0);
        setIdleAnimation('breathe');
      }
    }
    
    // Normalize input direction if any input is given
    if (moveDirection.length() > 0) {
      moveDirection.normalize();
    }
    
    // Start with the current position
    const newPosition = position.clone();
    
    // ----------------------------------------
    // HANDLE MOVEMENT ALONG GROUND 
    // ----------------------------------------
    
    // Move along the ground if input is given
    if (moveDirection.length() > 0) {
      const moveSpeed = 0.15; // Slightly faster on flat terrain
      
      // Move along the flat surface in the input direction
      newPosition.x += moveDirection.x * moveSpeed;
      newPosition.z += moveDirection.z * moveSpeed;
    }
    
    // ----------------------------------------
    // HANDLE JUMPING
    // ----------------------------------------
    
    // Jumping with better physics for flat terrain
    
    // If jump button is pressed and we're not already jumping
    if (jump && !isJumping && onGround) {
      setJumping(true);
      setOnGround(false);
      
      // Add a burst of upward movement
      newPosition.y += 0.5;
    }
    
    // If we're in the middle of a jump, simulate a parabola
    if (isJumping) {
      // Simple gravity effect
      newPosition.y -= 0.1;
      
      // Check if we've hit the ground
      if (newPosition.y <= 0.25) { // 0.25 is the ground level for the dog
        newPosition.y = 0.25;
        setJumping(false);
        setOnGround(true);
      }
    }
    
    // ----------------------------------------
    // ENFORCE TERRAIN BOUNDARIES
    // ----------------------------------------
    
    // Keep the dog within platform boundaries
    const halfWidth = PLATFORM_WIDTH / 2 - 1;
    const halfLength = PLATFORM_LENGTH / 2 - 1;
    
    // Clamp position to platform boundaries
    newPosition.x = Math.max(-halfWidth, Math.min(halfWidth, newPosition.x));
    newPosition.z = Math.max(-halfLength, Math.min(halfLength, newPosition.z));
    
    // Update position state
    setPosition(newPosition);
    
    // Update mesh position
    dogRef.current.position.copy(newPosition);
    
    // Make SatDog look in the direction of movement
    if (moveDirection.length() > 0.1) {
      // Calculate rotation to face movement direction (much simpler for flat terrain)
      const angle = Math.atan2(moveDirection.x, moveDirection.z);
      dogRef.current.rotation.y = angle;
    }
    
    // Animate legs when moving
    if (isMoving && onGround && 
        legFrontLeftRef.current && legFrontRightRef.current && 
        legBackLeftRef.current && legBackRightRef.current) {
      
      // Calculate leg animation cycle based on movement speed and time
      const legCycle = state.clock.elapsedTime * 8;
      
      // Front legs move in alternating pattern (diagonal pairs)
      // Front left and back right move together, front right and back left move together
      const frontLeftAngle = Math.sin(legCycle) * 0.4;
      const frontRightAngle = Math.sin(legCycle + Math.PI) * 0.4;
      
      // Apply rotations to legs
      legFrontLeftRef.current.rotation.x = frontLeftAngle;
      legFrontRightRef.current.rotation.x = frontRightAngle;
      legBackLeftRef.current.rotation.x = frontRightAngle;
      legBackRightRef.current.rotation.x = frontLeftAngle;
      
      // Also add a slight tail wag during movement
      if (tailRef.current && !isWaggingTail) {
        const runWagAngle = Math.sin(legCycle) * 0.3;
        tailRef.current.rotation.y = runWagAngle;
      }
      
      // Subtle body bob during movement for more lively animation
      if (bodyRef.current) {
        const bobHeight = Math.abs(Math.sin(legCycle * 0.5)) * 0.05;
        bodyRef.current.position.y = bobHeight;
      }
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
    <group ref={dogRef} position={[0, 0.25, 0]}>
      {/* Body - with glow effect when collecting */}
      <mesh ref={bodyRef} castShadow>
        <boxGeometry args={[0.8, 0.5, 1.2]} />
        <meshStandardMaterial 
          color="#f9a825" 
          roughness={0.7} 
          emissive={isWaggingTail ? "#ff9500" : "#000000"}
          emissiveIntensity={isWaggingTail ? 0.5 : 0}
        />
      </mesh>
      
      {/* Head */}
      <mesh ref={headRef} position={[0, 0.3, 0.5]} castShadow>
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
      <mesh ref={legFrontLeftRef} position={[-0.3, -0.4, 0.4]} castShadow>
        <boxGeometry args={[0.2, 0.4, 0.2]} />
        <meshStandardMaterial color="#e0a029" roughness={0.7} />
      </mesh>
      <mesh ref={legFrontRightRef} position={[0.3, -0.4, 0.4]} castShadow>
        <boxGeometry args={[0.2, 0.4, 0.2]} />
        <meshStandardMaterial color="#e0a029" roughness={0.7} />
      </mesh>
      <mesh ref={legBackLeftRef} position={[-0.3, -0.4, -0.4]} castShadow>
        <boxGeometry args={[0.2, 0.4, 0.2]} />
        <meshStandardMaterial color="#e0a029" roughness={0.7} />
      </mesh>
      <mesh ref={legBackRightRef} position={[0.3, -0.4, -0.4]} castShadow>
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