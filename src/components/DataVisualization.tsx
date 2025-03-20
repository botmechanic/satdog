'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { useGame } from '@/contexts/GameContext';

// Satellite positions in orbit (simplified representation)
// Keeping this for reference
/* const genericSatellitePositions: [number, number, number][] = [
  [0, 300, 0],
  [150, 350, 150],
  [-180, 320, 100],
  [120, 380, -150],
  [-100, 360, -200],
  [220, 340, 50]
]; */

// Iridium constellation specific satellite positions
// Simulating the 6 planes with 11 satellites each in a more accurate representation
function generateIridiumConstellation(): [number, number, number][] {
  const positions: [number, number, number][] = [];
  const planes = 6;
  const satellitesPerPlane = 11;
  const orbitRadius = 250; // LEO orbit
  
  // Create satellites in 6 evenly spaced orbital planes
  for (let plane = 0; plane < planes; plane++) {
    const planeAngle = (plane * Math.PI) / 3; // 60 degrees apart
    
    // Create 11 satellites in each orbital plane
    for (let sat = 0; sat < satellitesPerPlane; sat++) {
      const satAngle = (sat * 2 * Math.PI) / satellitesPerPlane;
      
      // Calculate position using spherical coordinates
      const x = orbitRadius * Math.cos(satAngle) * Math.cos(planeAngle);
      const z = orbitRadius * Math.cos(satAngle) * Math.sin(planeAngle);
      const y = orbitRadius * Math.sin(satAngle) + 300; // Add 300 to raise above terrain
      
      positions.push([x, y, z]);
    }
  }
  
  return positions;
}

// Use the Iridium constellation layout
const satellitePositions = generateIridiumConstellation();

// Ground station positions
interface GroundStation {
  id: string;
  position: [number, number, number];
  color: string;
  beamActive: boolean;
  connected: number[];
}

const groundStations: GroundStation[] = [
  { id: 'station1', position: [80, 1, -60], color: '#4fc3f7', beamActive: true, connected: [0, 2, 4] },
  { id: 'station2', position: [-120, 1, 40], color: '#4caf50', beamActive: true, connected: [1, 2, 3] },
  { id: 'station3', position: [40, 1, 160], color: '#ff9800', beamActive: true, connected: [0, 1, 5] }
];

// Data packet visualization
interface DataPacketProps {
  start: [number, number, number];
  end: [number, number, number];
  speed?: number;
  color?: string;
  size?: number;
}

function DataPacket({ 
  start, 
  end, 
  speed = 0.5, 
  color = '#ffffff', 
  size = 0.2 
}: DataPacketProps) {
  const ref = useRef<THREE.Mesh>(null);
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
interface SatelliteProps {
  position: [number, number, number];
  index: number;
}

function Satellite({ position, index }: SatelliteProps) {
  const ref = useRef<THREE.Group>(null);
  const [rotationSpeed] = useState(() => 0.2 + Math.random() * 0.3);
  
  // Determine which orbital plane this satellite belongs to (for Iridium visualization)
  const planeNumber = Math.floor(index / 11);
  
  // Use Iridium blue colors for the constellation, varying by plane for visibility
  const satelliteColor = useMemo(() => {
    const iridiumColors = [
      '#0056A4', // Iridium primary blue
      '#1664AF',
      '#2D72B9',
      '#4385C4',
      '#5997CF',
      '#70A9DA'
    ];
    
    // Use Iridium colors for the 6 planes (11 satellites per plane)
    return iridiumColors[planeNumber % iridiumColors.length];
  }, [planeNumber]);
  
  useFrame((_, delta) => {
    if (ref.current) {
      // Rotate the satellite
      ref.current.rotation.y += delta * rotationSpeed;
    }
  });
  
  // Scale down the satellites since we have many more now
  const scale = 0.6;
  
  return (
    <group ref={ref} position={position} scale={[scale, scale, scale]}>
      {/* Body - Iridium satellite design */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.5, 0.8, 4]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
      
      {/* Main Mission Antenna (L-band) */}
      <mesh position={[0, 0.9, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.2, 16]} />
        <meshStandardMaterial color="#d0d0d0" />
      </mesh>
      
      {/* Solar panels - Iridium NEXT has three panels */}
      <mesh position={[-4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[6, 0.1, 2]} />
        <meshStandardMaterial color="#1a237e" />
      </mesh>
      <mesh position={[4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[6, 0.1, 2]} />
        <meshStandardMaterial color="#1a237e" />
      </mesh>
      
      {/* Ka-band crosslink antennas (4 for communication with adjacent satellites) */}
      <mesh position={[1.2, 0, 1.8]} rotation={[0, 0, 0]}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshStandardMaterial color="#b0b0b0" />
      </mesh>
      <mesh position={[-1.2, 0, 1.8]} rotation={[0, 0, 0]}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshStandardMaterial color="#b0b0b0" />
      </mesh>
      <mesh position={[1.2, 0, -1.8]} rotation={[0, 0, 0]}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshStandardMaterial color="#b0b0b0" />
      </mesh>
      <mesh position={[-1.2, 0, -1.8]} rotation={[0, 0, 0]}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshStandardMaterial color="#b0b0b0" />
      </mesh>
      
      {/* Status light - Iridium Blue */}
      <pointLight position={[0, 0, 0]} distance={10} intensity={0.5} color={satelliteColor} />
      <mesh position={[0, 0, 2.1]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color={satelliteColor} />
      </mesh>
    </group>
  );
}

// Ground station representation
interface GroundStationProps {
  position: [number, number, number];
  color: string;
  beamActive: boolean;
  connected: number[];
}

function GroundStation({ position, color, beamActive, connected }: GroundStationProps) {
  const ref = useRef<THREE.Group>(null);
  const [pulseIntensity, setPulseIntensity] = useState(1);
  
  useFrame(() => {
    // Create pulsing effect
    setPulseIntensity(() => {
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
    const numPlanes = 6;
    const satellitesPerPlane = 11;
    
    // Create Iridium's unique cross-link architecture
    // Each satellite connects to:
    // 1. The satellites ahead and behind in the same plane (intra-plane links)
    // 2. The corresponding satellites in adjacent planes (inter-plane links)
    
    // Connect satellites within the same orbital plane (intra-plane links)
    for (let plane = 0; plane < numPlanes; plane++) {
      for (let sat = 0; sat < satellitesPerPlane; sat++) {
        const currentIndex = plane * satellitesPerPlane + sat;
        
        // Connect to next satellite in plane (with wrap-around)
        const nextSatIndex = plane * satellitesPerPlane + ((sat + 1) % satellitesPerPlane);
        
        lines.push({
          start: satellitePositions[currentIndex],
          end: satellitePositions[nextSatIndex],
          color: '#0056A4', // Iridium blue
          opacity: 0.3,
          planeConnection: true
        });
      }
    }
    
    // Connect satellites between adjacent planes (inter-plane links)
    for (let plane = 0; plane < numPlanes; plane++) {
      const nextPlane = (plane + 1) % numPlanes;
      
      for (let sat = 0; sat < satellitesPerPlane; sat++) {
        const currentIndex = plane * satellitesPerPlane + sat;
        const correspondingIndex = nextPlane * satellitesPerPlane + sat;
        
        lines.push({
          start: satellitePositions[currentIndex],
          end: satellitePositions[correspondingIndex],
          color: '#4fc3f7', // Lighter blue for cross-plane links
          opacity: 0.15,
          planeConnection: false
        });
      }
    }
    
    // Connect ground stations to their satellites
    groundStations.forEach(station => {
      // Connect to multiple satellites for better coverage
      for (let i = 0; i < 5; i++) {
        // Select satellites evenly distributed across the constellation
        const satIndex = Math.floor(Math.random() * satellitePositions.length);
        
        lines.push({
          start: station.position,
          end: satellitePositions[satIndex],
          color: station.color,
          opacity: 0.4,
          planeConnection: false
        });
      }
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
          lineWidth={(line as { planeConnection?: boolean }).planeConnection ? 0.6 : 0.4}
          transparent
          opacity={line.opacity}
        />
      ))}
    </group>
  );
}

// World data coverage visualization
function GlobalCoverage() {
  try {
    // Create a procedural pattern
    const canvasSize = 128;
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const context = canvas.getContext('2d');
    
    if (context) {
      // Clear canvas
      context.fillStyle = '#000000';
      context.fillRect(0, 0, canvasSize, canvasSize);
      
      // Draw grid pattern
      context.strokeStyle = '#4fc3f7';
      context.lineWidth = 1;
      
      // Draw grid lines
      const gridSize = 16;
      for (let i = 0; i <= canvasSize; i += gridSize) {
        // Horizontal lines
        context.beginPath();
        context.moveTo(0, i);
        context.lineTo(canvasSize, i);
        context.stroke();
        
        // Vertical lines
        context.beginPath();
        context.moveTo(i, 0);
        context.lineTo(i, canvasSize);
        context.stroke();
      }
      
      // Add some dots at intersections
      context.fillStyle = '#4fc3f7';
      for (let x = 0; x < canvasSize; x += gridSize) {
        for (let y = 0; y < canvasSize; y += gridSize) {
          if (Math.random() > 0.7) {
            context.beginPath();
            context.arc(x, y, 2, 0, Math.PI * 2);
            context.fill();
          }
        }
      }
    }
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(50, 50);
    
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
  } catch (error) {
    console.error("Error creating data pattern:", error);
    
    // Fallback to simple colored plane if texture creation fails
    return (
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2000, 2000]} />
        <meshBasicMaterial 
          color="#4fc3f7"
          transparent
          opacity={0.02}
        />
      </mesh>
    );
  }
}

// Iridium Logo visualization in 3D
function IridiumBranding() {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((_, delta) => {
    if (ref.current) {
      // Slowly rotate the logo
      ref.current.rotation.y += delta * 0.1;
    }
  });
  
  return (
    <group ref={ref} position={[0, 500, 0]} scale={[20, 20, 20]}>
      {/* Simplified Iridium logo representation */}
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[5, 0.5, 16, 32]} />
        <meshStandardMaterial color="#0056A4" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Add satellite silhouette in the center */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4, 0.8, 7]} />
        <meshStandardMaterial color="#0056A4" metalness={0.6} roughness={0.3} />
      </mesh>
      
      {/* Solar panels */}
      <mesh position={[-6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[7, 0.1, 2]} />
        <meshStandardMaterial color="#0056A4" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[7, 0.1, 2]} />
        <meshStandardMaterial color="#0056A4" metalness={0.6} roughness={0.3} />
      </mesh>
      
      {/* Add lighting to make it more visible */}
      <pointLight position={[0, 5, 0]} distance={50} intensity={2} color="#4fc3f7" />
      <pointLight position={[0, -5, 0]} distance={50} intensity={2} color="#0056A4" />
    </group>
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
      
      {/* Iridium branding */}
      <IridiumBranding />
      
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
      
      {/* Disclaimer */}
      <group position={[0, 200, 300]} rotation={[0, Math.PI, 0]}>
        <mesh>
          <planeGeometry args={[100, 20]} />
          <meshBasicMaterial color="#0056A4" transparent opacity={0.8} />
        </mesh>
      </group>
    </group>
  );
}