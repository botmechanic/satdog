'use client';

import { useRef, useState, useEffect, forwardRef, Ref } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGame } from '@/contexts/GameContext';
import { useMultiplayer } from '@/contexts/MultiplayerContext';

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
  
  // Position state with React state
  const [position, setPosition] = useState<THREE.Vector3>(new THREE.Vector3(0, 0.25, 0));
  
  // Physics-related states with useRef instead of useState to prevent render loops
  const physicsState = useRef({
    onGround: true,
    jumping: false,
    isMoving: false
  });
  
  // Animation states
  const [isWaggingTail, setIsWaggingTail] = useState(false);
  const [tailWagSpeed, setTailWagSpeed] = useState(0);
  const [tailWagTime, setTailWagTime] = useState(0);
  const [happyJump, setHappyJump] = useState(false);
  const [idleTimer, setIdleTimer] = useState(0);
  const [idleAnimation, setIdleAnimation] = useState<'breathe' | 'lookAround' | 'stretch'>('breathe');
  
  const { components, collectComponent: gameCollectComponent, gameState, showTitle, collectedComponents } = useGame();
  const { collectComponent: multiplayerCollectComponent } = useMultiplayer();

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
  
  // Import the multiplayer context
  const { updatePlayerPosition } = useMultiplayer();
  
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
    else if (!physicsState.current.isMoving && !isWaggingTail && physicsState.current.onGround) {
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
    const controls = getKeyboardControls();
    const forward = !!controls.forward;
    const backward = !!controls.backward;
    const left = !!controls.left;
    const right = !!controls.right;
    const jump = !!controls.jump;
    
    // ---------------------------------------------------------------
    // SIMPLIFIED FLAT TERRAIN MOVEMENT SYSTEM
    // ---------------------------------------------------------------
    
    // Get physics state from ref
    const isJumping = physicsState.current.jumping;
    
    // Gravity is always downward in flat terrain
    
    // Get camera directions for Fortnite-style movement (always relative to camera view)
    const cameraForward = new THREE.Vector3(0, 0, -1).applyQuaternion(state.camera.quaternion);
    cameraForward.y = 0; // Keep movement on ground plane
    cameraForward.normalize();
    
    const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(state.camera.quaternion);
    cameraRight.y = 0; // Keep movement on ground plane
    cameraRight.normalize();
    
    // Calculate input direction on the horizontal plane
    const moveDirection = new THREE.Vector3();
    if (forward) moveDirection.add(cameraForward);
    if (backward) moveDirection.sub(cameraForward);
    if (right) moveDirection.add(cameraRight);
    if (left) moveDirection.sub(cameraRight);
    
    // Update movement state for animation system
    const isCurrentlyMoving = moveDirection.length() > 0;
    if (physicsState.current.isMoving !== isCurrentlyMoving) {
      physicsState.current.isMoving = isCurrentlyMoving;
      
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
    
    // Move along the ground if input is given - Fortnite-style faster movement
    if (moveDirection.length() > 0) {
      // Faster movement speed for Fortnite-like feel
      const moveSpeed = 1.2; // Even faster base speed for responsive movement
      
      // Add sprint capability with shift key
      const sprint = !!controls.sprint;
      const finalSpeed = sprint ? moveSpeed * 1.6 : moveSpeed; // Sprinting is 1.6x normal speed
      
      // Apply movement in camera-relative direction (Fortnite style)
      newPosition.x += moveDirection.x * finalSpeed;
      newPosition.z += moveDirection.z * finalSpeed;
    }
    
    // ----------------------------------------
    // HANDLE JUMPING
    // ----------------------------------------
    
    // Simpler jumping mechanics
    
    // If jump button is pressed and we're not already jumping
    if (jump && !physicsState.current.jumping && physicsState.current.onGround) {
      physicsState.current.jumping = true;
      physicsState.current.onGround = false;
      
      // Add upward movement for jumps
      newPosition.y += 1.0;
    }
    
    // If we're in the middle of a jump, apply simplified gravity
    if (physicsState.current.jumping) {
      // Apply gravity
      newPosition.y -= 0.15;
      
      // Add minimal air control
      if (moveDirection.length() > 0) {
        const airControlBoost = 0.02;
        newPosition.x += moveDirection.x * airControlBoost;
        newPosition.z += moveDirection.z * airControlBoost;
      }
      
      // Check if we've hit the ground
      if (newPosition.y <= 0.25) {
        newPosition.y = 0.25;
        physicsState.current.jumping = false;
        physicsState.current.onGround = true;
      }
    }
    
    // For an infinite playground, we don't need boundary enforcement
    // The terrain chunks will be generated procedurally as the player moves
    
    // Update position state
    setPosition(newPosition);
    
    // Update mesh position
    dogRef.current.position.copy(newPosition);
    
    // Make SatDog look in the direction of movement
    let rotation = dogRef.current.rotation.y;
    if (moveDirection.length() > 0.1) {
      // Calculate rotation to face movement direction (much simpler for flat terrain)
      rotation = Math.atan2(moveDirection.x, moveDirection.z);
      dogRef.current.rotation.y = rotation;
    }
    
    // Send position update to server
    updatePlayerPosition(
      { 
        x: newPosition.x, 
        y: newPosition.y, 
        z: newPosition.z 
      },
      rotation,
      physicsState.current.isMoving,
      physicsState.current.jumping
    );
    
    // Store position in localStorage for navigation system
    localStorage.setItem('satDogPosition', JSON.stringify({
      x: newPosition.x, 
      y: newPosition.y, 
      z: newPosition.z,
      rotation: rotation
    }));
    
    // Animate legs when moving
    if (physicsState.current.isMoving && physicsState.current.onGround && 
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
          gameCollectComponent(component.type);
          multiplayerCollectComponent(component.type);
          
          // Trigger educational content - store the component type in localStorage
          // The SpaceEducation component will check for this and show relevant content
          localStorage.setItem('lastCollectedComponent', component.type);
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
      <mesh ref={bodyRef}>
        <boxGeometry args={[0.8, 0.5, 1.2]} />
        <meshStandardMaterial 
          color="#f9a825" 
          roughness={0.7} 
          emissive={isWaggingTail ? "#ff9500" : "#000000"}
          emissiveIntensity={isWaggingTail ? 0.5 : 0}
        />
      </mesh>
      
      {/* Head */}
      <mesh ref={headRef} position={[0, 0.3, 0.5]}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial 
          color="#fbc02d" 
          roughness={0.7} 
          emissive={isWaggingTail ? "#ff9500" : "#000000"}
          emissiveIntensity={isWaggingTail ? 0.3 : 0}
        />
      </mesh>
      
      {/* Ears - now with animation */}
      <mesh ref={earLeftRef} position={[-0.25, 0.6, 0.5]}>
        <coneGeometry args={[0.15, 0.3, 4]} />
        <meshStandardMaterial color="#e0a029" roughness={0.7} />
      </mesh>
      <mesh ref={earRightRef} position={[0.25, 0.6, 0.5]}>
        <coneGeometry args={[0.15, 0.3, 4]} />
        <meshStandardMaterial color="#e0a029" roughness={0.7} />
      </mesh>
      
      {/* Snout */}
      <mesh position={[0, 0.1, 0.8]}>
        <boxGeometry args={[0.4, 0.3, 0.3]} />
        <meshStandardMaterial color="#404040" roughness={0.9} />
      </mesh>
      
      {/* Eyes - blink when happy */}
      <mesh position={[-0.15, 0.35, 0.81]}>
        <sphereGeometry args={[0.08, 8, 8]} /> {/* Reduced geometry complexity */}
        <meshStandardMaterial 
          color="#000000" 
          roughness={0.5} 
          emissive={isWaggingTail ? "#ffffff" : "#000000"}
          emissiveIntensity={isWaggingTail ? 0.5 : 0}
        />
      </mesh>
      <mesh position={[0.15, 0.35, 0.81]}>
        <sphereGeometry args={[0.08, 8, 8]} /> {/* Reduced geometry complexity */}
        <meshStandardMaterial 
          color="#000000" 
          roughness={0.5} 
          emissive={isWaggingTail ? "#ffffff" : "#000000"}
          emissiveIntensity={isWaggingTail ? 0.5 : 0}
        />
      </mesh>
      
      {/* Legs */}
      <mesh ref={legFrontLeftRef} position={[-0.3, -0.4, 0.4]}>
        <boxGeometry args={[0.2, 0.4, 0.2]} />
        <meshStandardMaterial color="#e0a029" roughness={0.7} />
      </mesh>
      <mesh ref={legFrontRightRef} position={[0.3, -0.4, 0.4]}>
        <boxGeometry args={[0.2, 0.4, 0.2]} />
        <meshStandardMaterial color="#e0a029" roughness={0.7} />
      </mesh>
      <mesh ref={legBackLeftRef} position={[-0.3, -0.4, -0.4]}>
        <boxGeometry args={[0.2, 0.4, 0.2]} />
        <meshStandardMaterial color="#e0a029" roughness={0.7} />
      </mesh>
      <mesh ref={legBackRightRef} position={[0.3, -0.4, -0.4]}>
        <boxGeometry args={[0.2, 0.4, 0.2]} />
        <meshStandardMaterial color="#e0a029" roughness={0.7} />
      </mesh>
      
      {/* Tail - now animated */}
      <mesh ref={tailRef} position={[0, 0.1, -0.7]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshStandardMaterial 
          color="#fbc02d" 
          roughness={0.7} 
          emissive={isWaggingTail ? "#ff9500" : "#000000"}
          emissiveIntensity={isWaggingTail ? 0.8 : 0}
        />
      </mesh>
      
      {/* Simplified celebration effect when collecting (fewer particles) */}
      {isWaggingTail && (
        <group>
          {[...Array(4)].map((_, i) => ( // Reduced from 8 to 4 particles
            <mesh 
              key={`particle-${i}`} 
              position={[
                Math.sin(i / 4 * Math.PI * 2) * 0.8,
                Math.cos(i / 4 * Math.PI * 2) * 0.8,
                0
              ]}
            >
              {/* Larger but less complex geometry */}
              <sphereGeometry args={[0.08, 6, 6]} />
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