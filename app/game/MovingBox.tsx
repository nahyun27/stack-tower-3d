"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MoveAxis } from "./useGameStore";

interface MovingBoxProps {
  width: number;
  depth: number;
  topY: number;
  color: string;
  active: boolean;
  /** Which axis this box oscillates on */
  axis: MoveAxis;
  /** Shared ref exposing live {x, z} to parent */
  positionRef: React.MutableRefObject<{ x: number; z: number }>;
}

// Slow, far-reaching oscillation for the "approaching from afar" feel
const SPEED = 0.1;      // units per second (was 2.2)
const AMPLITUDE = 4.0;  // starts far away, ±5.5

export default function MovingBox({
  width,
  depth,
  topY,
  color,
  active,
  axis,
  positionRef,
}: MovingBoxProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const dirRef = useRef(1);

  useFrame((_, delta) => {
    if (!meshRef.current || !active) return;

    const mesh = meshRef.current;

    if (axis === "x") {
      let newX = mesh.position.x + dirRef.current * SPEED;
      if (newX > AMPLITUDE) { newX = AMPLITUDE; dirRef.current = -1; }
      if (newX < -AMPLITUDE) { newX = -AMPLITUDE; dirRef.current = 1; }
      mesh.position.x = newX;
      mesh.position.z = 0;
      positionRef.current.x = newX;
      positionRef.current.z = 0;
    } else {
      // Axis Z: box comes from front-left diagonal and goes to back-right
      let newZ = mesh.position.z + dirRef.current * SPEED;
      if (newZ > AMPLITUDE) { newZ = AMPLITUDE; dirRef.current = -1; }
      if (newZ < -AMPLITUDE) { newZ = -AMPLITUDE; dirRef.current = 1; }
      mesh.position.x = 0;
      mesh.position.z = newZ;
      positionRef.current.x = 0;
      positionRef.current.z = newZ;
    }
  });

  const yPos = topY + 0.5;

  return (
    <mesh ref={meshRef} position={[axis === "x" ? -AMPLITUDE : 0, yPos, axis === "z" ? -AMPLITUDE : 0]} castShadow>
      <boxGeometry args={[width, 1, depth]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
    </mesh>
  );
}
