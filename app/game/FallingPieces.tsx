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

    // Remove when off screen
    if (meshRef.current.position.y < REMOVE_Y) {
      removed.current = true;
      onRemove(piece.id);
    }
  });

  // Use the theme's color function so the color always matches the stacked block
  const color = theme.blockColor(piece.hue);

  return (
    <mesh
      ref={meshRef}
      position={[piece.x, piece.y, piece.z]}
      castShadow
    >
      <RoundedBox args={[piece.width, 1, piece.depth]} radius={0.06} smoothness={3}>
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
