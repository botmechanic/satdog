'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Line, useTexture } from '@react-three/drei';
import { useGame } from '@/contexts/GameContext';

// Satellite positions in orbit (simplified representation)
const satellitePositions = [
  [0, 300, 0],
  [150, 350, 150],
  [-180, 320, 100],
  [120, 380, -150],
  [-100, 360, -200],
  [220, 340, 50]
];

// Ground station positions
const groundStations = [
  { id: 'station1', position: [80, 1, -60], color: '#4fc3f7', beamActive: true, connected: [0, 2, 4] },
  { id: 'station2', position: [-120, 1, 40], color: '#4caf50', beamActive: true, connected: [1, 2, 3] },
  { id: 'station3', position: [40, 1, 160], color: '#ff9800', beamActive: true, connected: [0, 1, 5] }
];

// Data packet visualization
function DataPacket({ 
  start, 
  end, 
  speed = 0.5, 
  color = '#ffffff', 
  size = 0.2 
}) {
  const ref = useRef<THREE.Mesh>();
  const startVec = useMemo(() => new THREE.Vector3(...start), [start]);
  const endVec = useMemo(() => new THREE.Vector3(...end), [end]);
  const distance = useMemo(() => startVec.distanceTo(endVec), [startVec, endVec]);
  
  // Curve for the packet to follow
  const curve = useMemo(() => {
    // Create a curve with a slight arc
    const midPoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
    
    // Add an arc height proportional to distance
    const arcHeight = distance * 0.2;
    midPoint.y += arcHeight;
    
    return new THREE.QuadraticBezierCurve3(
      startVec,
      midPoint,
      endVec
    );
  }, [startVec, endVec, distance]);
  
  // Progress of the packet along the path
  const [progress, setProgress] = useState(Math.random()); // Start at random position
  
  useFrame((_, delta) => {
    // Update progress along the curve
    setProgress((prev) => (prev + delta * speed) % 1);
    
    if (ref.current) {
      // Get current position along the curve
      const position = curve.getPoint(progress);
      ref.current.position.copy(position);
      
      // Attempt to orient along the curve
      if (progress < 0.99) {
        const tangent = curve.getTangent(progress + 0.01);
        const lookTarget = position.clone().add(tangent);
        ref.current.lookAt(lookTarget);
      }
    }
  });
  
  return (
    <mesh ref={ref}>
      <octahedronGeometry args={[size, 0]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </mesh>
  );
}

// Satellite representation
function Satellite({ position, index }) {
  const ref = useRef<THREE.Group>();
  const [rotationSpeed] = useState(() => 0.2 + Math.random() * 0.3);
  const satelliteColor = useMemo(() => {
    const colors = ['#2196f3', '#4caf50', '#ff9800', '#9c27b0', '#00bcd4', '#ffeb3b'];
    return colors[index % colors.length];
  }, [index]);
  
  useFrame((_, delta) => {
    if (ref.current) {
      // Rotate the satellite
      ref.current.rotation.y += delta * rotationSpeed;
    }
  });
  
  return (
    <group ref={ref} position={position}>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3, 1, 5]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
      
      {/* Solar panels */}
      <mesh position={[-6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[8, 0.1, 3]} />
        <meshStandardMaterial color="#1a237e" />
      </mesh>
      <mesh position={[6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[8, 0.1, 3]} />
        <meshStandardMaterial color="#1a237e" />
      </mesh>
      
      {/* Antenna */}
      <mesh position={[0, 1, 2]} rotation={[Math.PI / 4, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
        <meshStandardMaterial color="#616161" />
      </mesh>
      
      {/* Status light */}
      <pointLight position={[0, 0, 0]} distance={5} intensity={0.5} color={satelliteColor} />
      <mesh position={[0, 0, 2.6]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color={satelliteColor} />
      </mesh>
    </group>
  );
}

// Ground station representation
function GroundStation({ position, color, beamActive, connected }) {
  const ref = useRef<THREE.Group>();
  const [pulseIntensity, setPulseIntensity] = useState(1);
  
  useFrame((_, delta) => {
    // Create pulsing effect
    setPulseIntensity(prev => {
      const newValue = prev + Math.sin(Date.now() * 0.002) * delta;
      return 0.7 + 0.3 * Math.sin(Date.now() * 0.003);
    });
  });
  
  return (
    <group ref={ref} position={position}>
      {/* Base */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1.5, 2, 1, 16]} />
        <meshStandardMaterial color="#546e7a" />
      </mesh>
      
      {/* Building */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#eceff1" />
      </mesh>
      
      {/* Dish */}
      <mesh position={[0, 3, 0]} rotation={[Math.PI / 4, 0, 0]}>
        <coneGeometry args={[2, 1, 16, 1, true]} />
        <meshStandardMaterial color="#cfd8dc" side={THREE.DoubleSide} />
      </mesh>
      
      {/* Status light */}
      <pointLight position={[0, 4, 0]} distance={10} intensity={pulseIntensity} color={color} />
      <mesh position={[0, 4, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      
      {/* Data beam */}
      {beamActive && (
        <mesh position={[0, 30, 0]}>
          <cylinderGeometry args={[0.2, 0.5, 60, 8, 1, true]} />
          <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={0.3} 
            side={THREE.DoubleSide} 
          />
        </mesh>
      )}
      
      {/* Packet visualization */}
      {connected.map((satelliteIndex) => {
        const satPosition = satellitePositions[satelliteIndex];
        
        return (
          <DataPacket
            key={`packet-${satelliteIndex}`}
            start={[0, 4, 0]}
            end={satPosition}
            color={color}
            speed={0.3 + Math.random() * 0.2}
          />
        );
      })}
      
      {/* Visualization of the coverage area */}
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[50, 32]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.05} 
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// Data connection visualization
function DataConnections() {
  const connectionLines = useMemo(() => {
    const lines = [];
    
    // Connect satellites to each other
    for (let i = 0; i < satellitePositions.length; i++) {
      for (let j = i + 1; j < satellitePositions.length; j++) {
        // Not all satellites connect - approximately 70% connection rate
        if (Math.random() > 0.3) {
          lines.push({
            start: satellitePositions[i],
            end: satellitePositions[j],
            color: '#4fc3f7',
            opacity: 0.2
          });
        }
      }
    }
    
    // Connect ground stations to their satellites
    groundStations.forEach(station => {
      station.connected.forEach(satIndex => {
        lines.push({
          start: station.position,
          end: satellitePositions[satIndex],
          color: station.color,
          opacity: 0.4
        });
      });
    });
    
    return lines;
  }, []);
  
  return (
    <group>
      {connectionLines.map((line, index) => (
        <Line
          key={`connection-${index}`}
          points={[line.start, line.end]}
          color={line.color}
          lineWidth={0.5}
          transparent
          opacity={line.opacity}
        />
      ))}
    </group>
  );
}

// World data coverage visualization
function GlobalCoverage() {
  // Dynamic texture loading for pattern
  const texture = useTexture('/textures/data_pattern.png');
  
  if (texture) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);
  }
  
  // Create a ground plane that shows data coverage
  return (
    <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[2000, 2000]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.04}
        color="#4fc3f7"
      />
    </mesh>
  );
}

// Main component that manages data visualization elements
export default function DataVisualization() {
  const { gameState, showTitle } = useGame();
  
  // Don't render during title screen or when not playing
  if (showTitle || gameState !== 'playing') return null;
  
  return (
    <group>
      {/* Global coverage visualization */}
      <GlobalCoverage />
      
      {/* Connection lines between satellites and ground stations */}
      <DataConnections />
      
      {/* Satellites in orbit */}
      {satellitePositions.map((position, index) => (
        <Satellite key={`satellite-${index}`} position={position} index={index} />
      ))}
      
      {/* Ground stations */}
      {groundStations.map((station) => (
        <GroundStation 
          key={station.id}
          position={station.position}
          color={station.color}
          beamActive={station.beamActive}
          connected={station.connected}
        />
      ))}
    </group>
  );
}