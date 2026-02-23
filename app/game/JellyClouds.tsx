"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Fluffy pastel clouds for the Jelly theme.
 */
export default function JellyClouds() {
  const groupRef = useRef<THREE.Group>(null);

  const clouds = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 50,
        15 + Math.random() * 10,
        -20 - Math.random() * 20,
      ] as [number, number, number],
      scale: 2 + Math.random() * 3,
      speed: 0.05 + Math.random() * 0.1,
    }));
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const cloud = clouds[i];
        child.position.x += cloud.speed * 0.1;
        if (child.position.x > 30) child.position.x = -30;
        child.position.y += Math.sin(time * 0.5 + i) * 0.005;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {clouds.map((cloud, i) => (
        <mesh key={i} position={cloud.position} scale={cloud.scale}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color="#FFF0F5" transparent opacity={0.6} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}
