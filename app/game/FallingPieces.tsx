"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { FallingPiece } from "./useGameStore";
import { ThemeConfig } from "./ThemeContext";

const GRAVITY = -15; // units per second²
const REMOVE_Y = -25; // Y threshold to remove piece

interface FallingPieceProps {
  piece: FallingPiece;
  onRemove: (id: number) => void;
  theme: ThemeConfig;
}

/** A single falling piece with gravity and rotation simulation. */
function FallingPieceMesh({ piece, onRemove, theme }: FallingPieceProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const velocityRef = useRef(piece.velocityY);
  const removed = useRef(false);

  useFrame((_, delta) => {
    if (!meshRef.current || removed.current) return;

    // Apply gravity
    velocityRef.current += GRAVITY * delta;
    meshRef.current.position.y += velocityRef.current * delta;

    // Rotate as it falls
    meshRef.current.rotation.x += piece.rotationSpeed * delta;
    meshRef.current.rotation.z += piece.rotationSpeed * 0.7 * delta;

    // Jelly specific animation
    if (theme.id === "jelly") {
      const time = _.clock.getElapsedTime();
      meshRef.current.scale.x = 1 + Math.sin(time * 20) * 0.1;
      meshRef.current.scale.z = 1 + Math.cos(time * 20) * 0.1;
      meshRef.current.rotation.y += delta * 10;
    }

    // Remove when off screen
    if (meshRef.current.position.y < REMOVE_Y) {
      removed.current = true;
      onRemove(piece.id);
    }
  });

  // Use the theme's color function so the color always matches the stacked block
  const color = theme.blockColor(piece.hue);

  // Render multiple shards if Ice theme
  if (theme.id === "ice") {
    const shardCount = 4;
    return (
      <group ref={meshRef as any} position={[piece.x, piece.y, piece.z]}>
        {Array.from({ length: shardCount }).map((_, i) => {
          const offsetX = (i - 1.5) * (piece.width / 3);
          const offsetZ = ((i % 2) - 0.5) * (piece.depth / 2);
          return (
            <mesh key={i} position={[offsetX, 0, offsetZ]} rotation={[Math.random(), Math.random(), Math.random()]}>
              <octahedronGeometry args={[Math.min(0.3, piece.width / 2), 0]} />
              <meshPhysicalMaterial
                color={color}
                roughness={0.1}
                metalness={0.3}
                transmission={0.8}
                transparent
                opacity={0.6}
              />
            </mesh>
          );
        })}
      </group>
    );
  }

  return (
    <mesh
      ref={meshRef}
      position={[piece.x, piece.y, piece.z]}
      castShadow
    >
      <RoundedBox args={[piece.width, 1, piece.depth]} radius={theme.id === "jelly" ? 0.15 : 0.06} smoothness={theme.id === "jelly" ? 5 : 3}>
        {theme.useNeonGlass ? (
          <meshPhysicalMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.5}
            roughness={0.05}
            metalness={0.1}
            transparent
            opacity={0.75}
          />
        ) : theme.id === "jelly" ? (
          <meshPhysicalMaterial
            color={color}
            roughness={0.05}
            metalness={0.1}
            transparent
            opacity={0.4}
            transmission={0.6}
            thickness={1}
          />
        ) : theme.useIceCrystal ? (
          <meshPhysicalMaterial
            color={color}
            roughness={0.1}
            metalness={0.3}
            transmission={0.8}
            transparent
            opacity={0.6}
          />
        ) : theme.useClearcoat ? (
          <meshPhysicalMaterial
            color={color}
            roughness={0.05}
            metalness={0.0}
            clearcoat={0.8}
            clearcoatRoughness={0.1}
            transparent
            opacity={0.88}
          />
        ) : (
          <meshStandardMaterial
            color={color}
            roughness={theme.materialRoughness}
            metalness={theme.materialMetalness}
            transparent
            opacity={0.9}
          />
        )}
      </RoundedBox>
    </mesh>
  );
}

interface FallingPiecesProps {
  pieces: FallingPiece[];
  onRemove: (id: number) => void;
  theme: ThemeConfig;
}

/** Renders all currently falling cut-off pieces. */
export default function FallingPieces({ pieces, onRemove, theme }: FallingPiecesProps) {
  return (
    <>
      {pieces.map((piece) => (
        <FallingPieceMesh key={piece.id} piece={piece} onRemove={onRemove} theme={theme} />
      ))}
    </>
  );
}
