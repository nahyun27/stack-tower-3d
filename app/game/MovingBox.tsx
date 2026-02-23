"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MoveAxis } from "./useGameStore";

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

// User-set values (modified from 1.4 → 0.1, 5.5 → 4.0)
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

  useFrame((_, delta) => {
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

  return (
    <mesh
      ref={meshRef}
      position={[initX, topY + 0.5, initZ]}
      castShadow
    >
      <boxGeometry args={[width, 1, depth]} />
      <meshStandardMaterial color={color} roughness={0.28} metalness={0.2} />
    </mesh>
  );
}
