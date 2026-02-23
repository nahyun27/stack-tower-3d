"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Jelly bubbles for the Jelly theme.
 * Floating upward spheres with bobbing motion.
 */
export default function JellyBubbles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 500;

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random();
      temp.push({
        t,
        factor: 20 + Math.random() * 10,
        speed: 0.01 + Math.random() * 0.02,
        x: (Math.random() - 0.5) * 30,
        y: (Math.random() - 0.5) * 40,
        z: (Math.random() - 0.5) * 30,
        scale: 0.05 + Math.random() * 0.07,
        color: new THREE.Color().setHSL(Math.random(), 0.7, 0.8),
      });
    }
    return temp;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (!meshRef.current) return;

    particles.forEach((p, i) => {
      p.y += p.speed;
      if (p.y > 25) p.y = -25;

      const wobble = Math.sin(time + i) * 0.1;
      dummy.position.set(p.x + wobble, p.y, p.z);
      dummy.scale.set(p.scale, p.scale, p.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, p.color);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial transparent opacity={0.2} depthWrite={false} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
}
