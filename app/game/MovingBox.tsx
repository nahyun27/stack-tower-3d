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
  positionRef?: React.MutableRefObject<[number, number, number]>;
}

// User-set values
const SPEED = 0.1;
const AMPLITUDE = 4.0;

export default function MovingBox({ width, depth, topY, color, axis, pivotX, pivotZ, active, positionRef }: MovingBoxProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const dirRef = useRef(1);
  const { theme } = useTheme();

  // Spring for landing squish
  const landTime = useRef(0);
  const isJelly = theme.useJelly;

  // Reset direction and sync positionRef when pivot/axis changes
  useEffect(() => {
    if (!meshRef.current) return;
    dirRef.current = 1;
    const initialOffset = AMPLITUDE; // Assuming initial position is at one end of the amplitude
    if (axis === "x") {
      meshRef.current.position.set(pivotX - initialOffset, topY + 0.5, pivotZ);
      if (positionRef) positionRef.current = [pivotX - initialOffset, topY + 0.5, pivotZ];
    } else {
      meshRef.current.position.set(pivotX, topY + 0.5, pivotZ - initialOffset);
      if (positionRef) positionRef.current = [pivotX, topY + 0.5, pivotZ - initialOffset];
    }
    // Reset landTime when a new box is activated
    landTime.current = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [axis, pivotX, pivotZ]);

  useFrame(({ clock }, delta) => {
    if (!meshRef.current) return;

    const mesh = meshRef.current;

    // ── Moving Logic ────────────────────────────────────────────────────────
    if (active) {
      if (axis === "x") {
        let newX = mesh.position.x + dirRef.current * SPEED;
        if (newX > pivotX + AMPLITUDE) { newX = pivotX + AMPLITUDE; dirRef.current = -1; }
        if (newX < pivotX - AMPLITUDE) { newX = pivotX - AMPLITUDE; dirRef.current = 1; }
        mesh.position.x = newX;
        mesh.position.z = pivotZ;
        if (positionRef) positionRef.current = [newX, topY + 0.5, pivotZ];
      } else {
        let newZ = mesh.position.z + dirRef.current * SPEED;
        if (newZ > pivotZ + AMPLITUDE) { newZ = pivotZ + AMPLITUDE; dirRef.current = -1; }
        if (newZ < pivotZ - AMPLITUDE) { newZ = pivotZ - AMPLITUDE; dirRef.current = 1; }
        mesh.position.x = pivotX;
        mesh.position.z = newZ;
        if (positionRef) positionRef.current = [pivotX, topY + 0.5, newZ];
      }
    } else {
      // If not active, ensure it's at the pivot point for the next box
      mesh.position.x = pivotX;
      mesh.position.z = pivotZ;
      if (positionRef) positionRef.current = [pivotX, topY + 0.5, pivotZ];
    }

    // ── Jelly Wobble ────────────────────────────────────────────────────────
    if (isJelly) {
      const time = clock.getElapsedTime();

      // Idle subtle jiggle
      const idleScale = 1 + Math.sin(time * 10) * 0.01;
      mesh.scale.x = idleScale;
      mesh.scale.z = idleScale;

      mesh.position.y = topY + 0.5;
    }
  });

  const initX = axis === "x" ? pivotX - AMPLITUDE : pivotX;
  const initZ = axis === "z" ? pivotZ - AMPLITUDE : pivotZ;

  // The initial position is set in useEffect, but we need a default for the first render
  // This will be immediately overwritten by useEffect
  const initialPosition = [initX, topY + 0.5, initZ] as [number, number, number];

  return (
    <mesh ref={meshRef} castShadow position={initialPosition}>
      <RoundedBox args={[width, 1, depth]} radius={isJelly ? 0.15 : 0.06} smoothness={isJelly ? 5 : 3}>
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
        ) : isJelly ? (
          /* 🍬 Jelly moving block */
          <meshPhysicalMaterial
            color={color}
            roughness={0.05}
            metalness={0.1} // Some slight specular
            transparent
            opacity={0.55}
            transmission={0.4}
            thickness={1}
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
