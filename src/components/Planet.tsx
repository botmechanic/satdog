'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

export default function Planet() {
  const planetRef = useRef<THREE.Mesh>(null);
  
  // Slowly rotate the planet
  useFrame((_, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group>
      {/* The main planet sphere */}
      <Sphere ref={planetRef} args={[7, 32, 32]} position={[0, 0, 0]} receiveShadow castShadow>
        <MeshDistortMaterial 
          color="#4d8ab5" 
          distort={0.3} 
          speed={2} 
          metalness={0.2}
          roughness={0.8} 
        />
      </Sphere>
      
      {/* Create several hills/mountains on the planet */}
      {[...Array(6)].map((_, i) => {
        const theta = (i / 6) * Math.PI * 2;
        const phi = Math.random() * Math.PI / 2;
        const r = 7; // Planet radius
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.cos(phi);
        const z = r * Math.sin(phi) * Math.sin(theta);
        
        return (
          <Sphere 
            key={`hill-${i}`} 
            args={[0.8 + Math.random() * 0.5, 8, 8]} 
            position={[x, y, z]}
            castShadow
          >
            <meshStandardMaterial 
              color="#3a6f8a" 
              roughness={0.9}
            />
          </Sphere>
        );
      })}
      
      {/* Create several craters */}
      {[...Array(5)].map((_, i) => {
        const theta = (i / 5) * Math.PI * 2 + 0.5;
        const phi = Math.random() * Math.PI / 2 + Math.PI / 4;
        const r = 7.05; // Slightly above the planet surface
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.cos(phi);
        const z = r * Math.sin(phi) * Math.sin(theta);
        
        // Calculate the normal at the position to align the crater
        const normal = new THREE.Vector3(x, y, z).normalize();
        const rotation = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          normal
        );

        return (
          <group key={`crater-${i}`} position={[x, y, z]} quaternion={rotation}>
            <Sphere
              args={[0.6 + Math.random() * 0.3, 16, 16]}
              position={[0, 0.05, 0]}
            >
              <meshStandardMaterial color="#2c5065" roughness={0.8} />
            </Sphere>
          </group>
        );
      })}
    </group>
  );
}