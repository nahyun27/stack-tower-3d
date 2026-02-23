"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Aurora Background - Animated gradient waves for the Ice theme.
 * Uses multiple large, undulating planes with gradient colors.
 */
export default function AuroraBackground() {
  const meshRefs = useRef<THREE.Mesh[]>([]);

  const auroraLayers = useMemo(() => [
    { color1: "#00ffff", color2: "#9d00ff", speed: 0.2, height: 1.5, offset: 0 },
    { color1: "#9d00ff", color2: "#ff00aa", speed: 0.15, height: 2.0, offset: Math.PI / 2 },
    { color1: "#00ffff", color2: "#ff00aa", speed: 0.1, height: 1.2, offset: Math.PI },
  ], []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const layer = auroraLayers[i];
      // Slow undulating motion
      mesh.position.y = Math.sin(time * layer.speed + layer.offset) * 2 - 10;
      mesh.rotation.z = Math.sin(time * layer.speed * 0.5) * 0.1;

      // Update shader uniforms if using custom material, but for simplicity we'll use opacity
      if (mesh.material instanceof THREE.MeshBasicMaterial) {
        mesh.material.opacity = 0.08 + Math.sin(time * 0.5 + layer.offset) * 0.03;
      }
    });
  });

  return (
    <group position={[0, 0, -30]}>
      {auroraLayers.map((layer, i) => (
        <mesh
          key={i}
          ref={(el) => (meshRefs.current[i] = el!)}
          rotation={[-Math.PI / 2.5, 0, 0]}
        >
          <planeGeometry args={[100, 40, 20, 20]} />
          <meshBasicMaterial
            color={layer.color1}
            transparent
            opacity={0.1}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.NormalBlending}
          />
        </mesh>
      ))}
    </group>
  );
}
