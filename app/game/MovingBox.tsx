"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { MoveAxis } from "./useGameStore";
import { useTheme } from "./ThemeContext";

interface MovingBoxProps {
  width: number;
  depth: number;
  topY: number;
  color: string;
  active: boolean;
  axis: MoveAxis;
  /** Center X of the previous (top) stacked box — oscillate around this */
  pivotX: number;
  /** Center Z of the previous (top) stacked box — oscillate around this */
  pivotZ: number;
  positionRef: React.MutableRefObject<{ x: number; z: number }>;
}

// User-set values
const SPEED = 0.1;
const AMPLITUDE = 4.0;

export default function MovingBox({
  width,
  depth,
  topY,
  color,
  active,
  axis,
  pivotX,
  pivotZ,
  positionRef,
}: MovingBoxProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const dirRef = useRef(1);

  // Reset direction and sync positionRef when pivot/axis changes
  useEffect(() => {
    if (!meshRef.current) return;
    dirRef.current = 1;
    if (axis === "x") {
      meshRef.current.position.set(pivotX - AMPLITUDE, topY + 0.5, pivotZ);
      positionRef.current = { x: pivotX - AMPLITUDE, z: pivotZ };
    } else {
      meshRef.current.position.set(pivotX, topY + 0.5, pivotZ - AMPLITUDE);
      positionRef.current = { x: pivotX, z: pivotZ - AMPLITUDE };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [axis, pivotX, pivotZ]);

  useFrame(() => {
    if (!meshRef.current || !active) return;

    const mesh = meshRef.current;

    if (axis === "x") {
      let newX = mesh.position.x + dirRef.current * SPEED;
      if (newX > pivotX + AMPLITUDE) { newX = pivotX + AMPLITUDE; dirRef.current = -1; }
      if (newX < pivotX - AMPLITUDE) { newX = pivotX - AMPLITUDE; dirRef.current = 1; }
      mesh.position.x = newX;
      mesh.position.z = pivotZ;
      positionRef.current.x = newX;
      positionRef.current.z = pivotZ;
    } else {
      let newZ = mesh.position.z + dirRef.current * SPEED;
      if (newZ > pivotZ + AMPLITUDE) { newZ = pivotZ + AMPLITUDE; dirRef.current = -1; }
      if (newZ < pivotZ - AMPLITUDE) { newZ = pivotZ - AMPLITUDE; dirRef.current = 1; }
      mesh.position.x = pivotX;
      mesh.position.z = newZ;
      positionRef.current.x = pivotX;
      positionRef.current.z = newZ;
    }
  });

  const initX = axis === "x" ? pivotX - AMPLITUDE : pivotX;
  const initZ = axis === "z" ? pivotZ - AMPLITUDE : pivotZ;

  const { theme } = useTheme();

  return (
    <mesh
      ref={meshRef}
      position={[initX, topY + 0.5, initZ]}
      castShadow
    >
      <RoundedBox args={[width, 1, depth]} radius={0.1} smoothness={4}>
        {theme.useNeonGlass ? (
          /* ⚡ Neon Glass */
          <meshPhysicalMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.8}
            roughness={0.05}
            metalness={0.15}
            transmission={0.25}
            thickness={0.5}
            ior={1.4}
            clearcoat={1.0}
            clearcoatRoughness={0.0}
            reflectivity={0.9}
            transparent
            opacity={0.82}
          />
        ) : theme.useIceCrystal ? (
          /* 🧊 Ice Crystal */
          <meshPhysicalMaterial
            color={color}
            roughness={0.1}
            metalness={0.3}
            transmission={0.8}
            thickness={2.0}
            ior={1.31}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            reflectivity={0.8}
            transparent
            opacity={0.6}
            attenuationDistance={0.5}
            attenuationColor={color}
          />
        ) : theme.useClearcoat ? (
          /* 🍬 Jelly moving block */
          <meshPhysicalMaterial
            color={color}
            roughness={0.05}
            metalness={0.0}
            clearcoat={1.0}
            clearcoatRoughness={0.05}
            ior={1.6}
            reflectivity={0.7}
            sheen={0.4}
            sheenRoughness={0.3}
            sheenColor={color}
          />
        ) : (
          <meshStandardMaterial
            color={color}
            roughness={theme.materialRoughness}
            metalness={theme.materialMetalness}
          />
        )}
      </RoundedBox>
    </mesh>
  );
}
