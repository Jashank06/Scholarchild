'use client';
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Environment, Sparkles } from '@react-three/drei';

function AIBrain({ status }) {
  const meshRef = useRef();
  
  // Rotate slowly
  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * 0.2;
    meshRef.current.rotation.y += delta * 0.3;
  });

  // Determine color based on status (scanning, idle, processing)
  let color = '#3B82F6'; // Default blue (idle)
  let distort = 0.3;
  
  if (status === 'scanning') {
    color = '#10B981'; // Green (scanning)
    distort = 0.6;
  } else if (status === 'processing') {
    color = '#F59E0B'; // Orange
    distort = 0.8;
  }

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial 
          color={color} 
          envMapIntensity={1} 
          clearcoat={1} 
          clearcoatRoughness={0} 
          metalness={0.5} 
          roughness={0.2} 
          distort={distort} 
          speed={3} 
        />
      </mesh>
      {/* Halo effect */}
      <mesh scale={1.2}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.1} wireframe />
      </mesh>
    </Float>
  );
}

export default function AIMascot({ status = 'idle', style }) {
  return (
    <div style={{ width: '150px', height: '150px', ...style }}>
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} color="#4F46E5" intensity={2} />
        <AIBrain status={status} />
        <Sparkles count={50} scale={3} size={2} speed={0.4} opacity={0.2} color={status === 'scanning' ? '#10B981' : '#3B82F6'} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
