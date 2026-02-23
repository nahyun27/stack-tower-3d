"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SNOW_COUNT = 280;

export default function SnowParticles() {
  const pointsRef = useRef<THREE.Points>(null);

  // Initialize random positions in a column above/around the tower
  const { positions, speeds, offsets } = useMemo(() => {
    const positions = new Float32Array(SNOW_COUNT * 3);
    const speeds = new Float32Array(SNOW_COUNT);
    const offsets = new Float32Array(SNOW_COUNT);

    for (let i = 0; i < SNOW_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 26;     // x
      positions[i * 3 + 1] = Math.random() * 55 - 5;     // y (5 below to 50 above)
      positions[i * 3 + 2] = (Math.random() - 0.5) * 26; // z
      speeds[i] = 0.012 + Math.random() * 0.018;
      offsets[i] = Math.random() * Math.PI * 2;
    }
    return { positions, speeds, offsets };
  }, []);

  const positionAttr = useMemo(
    () => new THREE.BufferAttribute(positions.slice(), 3),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const attr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const t = clock.getElapsedTime();

    for (let i = 0; i < SNOW_COUNT; i++) {
      // Drift downward
      arr[i * 3 + 1] -= speeds[i];
      // Gentle horizontal sway
      arr[i * 3] += Math.sin(t * 0.5 + offsets[i]) * 0.003;

      // Wrap around when falling below
      if (arr[i * 3 + 1] < -5) {
        arr[i * 3 + 1] = 50;
        arr[i * 3] = (Math.random() - 0.5) * 26;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 26;
      }
    }
    attr.needsUpdate = true;
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
        color="#d0f0ff"
        size={0.12}
        sizeAttenuation
        transparent
        opacity={0.75}
        depthWrite={false}
      />
    </points>
  );
}
