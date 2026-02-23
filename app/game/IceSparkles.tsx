"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SPARKLE_COUNT = 150;

/**
 * Ice Sparkles - Small twinkling dots around the blocks for the Ice theme.
 */
export default function IceSparkles() {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, sizes, phases] = useMemo(() => {
    const pos = new Float32Array(SPARKLE_COUNT * 3);
    const sz = new Float32Array(SPARKLE_COUNT);
    const ph = new Float32Array(SPARKLE_COUNT);

    for (let i = 0; i < SPARKLE_COUNT; i++) {
      // Spawn in a cylinder around the tower
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 8;
      pos[i * 3 + 0] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.random() * 30 - 5; // vertical range
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      sz[i] = 0.05 + Math.random() * 0.15;
      ph[i] = Math.random() * Math.PI * 2;
    }
    return [pos, sz, ph];
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();

    // Twinkle effect by updating point sizes or opacity via shader
    // For simplicity, we can modulate the material opacity if we use a shader,
    // but here we'll just drift them slightly
    pointsRef.current.position.y += Math.sin(time * 0.2) * 0.001;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#ffffff"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
