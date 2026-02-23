"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

export default function ClassicStars() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      // 0.01 units/sec as requested
      // multiplying by 60 for delta time normalization
      groupRef.current.position.y += 0.01 * 60 * delta;

      // Reset to prevent overflowing
      if (groupRef.current.position.y > 50) {
        groupRef.current.position.y = 0;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main star field */}
      <Stars
        radius={60}
        depth={30}
        count={500}
        factor={2} // mapped to 0.05-0.1 size roughly
        saturation={0} // White stars
        fade={true}
        speed={1} // Twinkling
      />
      {/* Secondary star field lower down to loop seamlessly */}
      <group position={[0, -50, 0]}>
        <Stars
          radius={60}
          depth={30}
          count={500}
          factor={2}
          saturation={0}
          fade={true}
          speed={1}
        />
      </group>
    </group>
  );
}
