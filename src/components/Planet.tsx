'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Ring, Torus } from '@react-three/drei';
import * as THREE from 'three';

export default function Planet() {
  const planetRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  
  // Slowly rotate the planet
  useFrame((_, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.1;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.15; // Clouds rotate slightly faster
    }
  });

  // Generate positions for terrain features
  const terrainPositions = useMemo(() => {
    const features = [];
    
    // Generate mountains
    for (let i = 0; i < 8; i++) {
      const theta = (i / 8) * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.8;
      const r = 7; // Planet radius
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);
      
      features.push({
        type: 'mountain',
        position: [x, y, z],
        scale: 0.8 + Math.random() * 0.7,
        rotation: new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(x, y, z).normalize()
        )
      });
    }
    
    // Generate craters
    for (let i = 0; i < 7; i++) {
      const theta = (i / 7) * Math.PI * 2 + 0.5;
      const phi = Math.random() * Math.PI * 0.7 + Math.PI * 0.2;
      const r = 7.05; // Slightly above the planet surface
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);
      
      features.push({
        type: 'crater',
        position: [x, y, z],
        scale: 0.5 + Math.random() * 0.4,
        rotation: new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(x, y, z).normalize()
        )
      });
    }
    
    // Generate lakes
    for (let i = 0; i < 3; i++) {
      const theta = (i / 3) * Math.PI * 2 + 1.0;
      const phi = Math.random() * Math.PI * 0.6 + Math.PI * 0.3;
      const r = 7.05; // Slightly above the planet surface
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);
      
      features.push({
        type: 'lake',
        position: [x, y, z],
        scale: 0.6 + Math.random() * 0.5,
        rotation: new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(x, y, z).normalize()
        )
      });
    }
    
    return features;
  }, []);

  return (
    <group>
      {/* The main planet sphere */}
      <Sphere ref={planetRef} args={[7, 64, 64]} position={[0, 0, 0]} receiveShadow castShadow>
        <MeshDistortMaterial 
          color="#4d8ab5" 
          distort={0.3} 
          speed={1} 
          metalness={0.2}
          roughness={0.8} 
        />
      </Sphere>
      
      {/* Atmospheric glow */}
      <Sphere args={[7.5, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#7fb8e6" transparent opacity={0.1} />
      </Sphere>
      
      {/* Cloud layer */}
      <Sphere ref={cloudsRef} args={[7.2, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.3} 
          roughness={1} 
          alphaMap={new THREE.DataTexture(
            new Uint8Array(1024).map(() => Math.random() > 0.7 ? 255 : 0),
            32, 32, 
            THREE.RedFormat,
            THREE.UnsignedByteType
          )}
        />
      </Sphere>
      
      {/* Orbital ring */}
      <Ring args={[9, 9.5, 64]} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial 
          color="#a1c6e7" 
          side={THREE.DoubleSide} 
          transparent 
          opacity={0.15} 
          roughness={0.4}
          metalness={0.5}
        />
      </Ring>
      
      {/* Planet terrain features */}
      {terrainPositions.map((feature, i) => {
        if (feature.type === 'mountain') {
          return (
            <group 
              key={`mountain-${i}`} 
              position={feature.position as [number, number, number]} 
              quaternion={feature.rotation}
            >
              <Sphere
                args={[feature.scale, 8, 8]}
                position={[0, feature.scale * 0.2, 0]}
                castShadow
              >
                <meshStandardMaterial 
                  color="#3a6f8a" 
                  roughness={0.9}
                />
              </Sphere>
              {/* Snow caps on larger mountains */}
              {feature.scale > 1.2 && (
                <Sphere
                  args={[feature.scale * 0.3, 8, 8]}
                  position={[0, feature.scale * 0.7, 0]}
                  castShadow
                >
                  <meshStandardMaterial 
                    color="#e0f0ff" 
                    roughness={0.6}
                  />
                </Sphere>
              )}
            </group>
          );
        } else if (feature.type === 'crater') {
          return (
            <group 
              key={`crater-${i}`} 
              position={feature.position as [number, number, number]} 
              quaternion={feature.rotation}
            >
              <Torus
                args={[feature.scale, feature.scale * 0.3, 16, 32]}
                position={[0, 0.05, 0]}
                castShadow
              >
                <meshStandardMaterial color="#2c5065" roughness={0.8} />
              </Torus>
              <Sphere
                args={[feature.scale * 0.9, 16, 16]}
                position={[0, -feature.scale * 0.2, 0]}
              >
                <meshStandardMaterial color="#2c5065" roughness={0.8} />
              </Sphere>
            </group>
          );
        } else if (feature.type === 'lake') {
          return (
            <group 
              key={`lake-${i}`} 
              position={feature.position as [number, number, number]} 
              quaternion={feature.rotation}
            >
              <Sphere
                args={[feature.scale, 16, 16]}
                position={[0, 0, 0]}
              >
                <meshStandardMaterial 
                  color="#26c9ff" 
                  roughness={0.1} 
                  metalness={0.3}
                  transparent
                  opacity={0.8}
                />
              </Sphere>
            </group>
          );
        }
      })}
    </group>
  );
}