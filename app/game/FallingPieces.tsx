"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { FallingPiece } from "./useGameStore";

const GRAVITY = -15; // units per second²
const REMOVE_Y = -25; // Y threshold to remove piece

interface FallingPieceProps {
  piece: FallingPiece;
  onRemove: (id: number) => void;
}

/** A single falling piece with gravity and rotation simulation. */
function FallingPieceMesh({ piece, onRemove }: FallingPieceProps) {
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

  return (
    <mesh
      ref={meshRef}
      position={[piece.x, piece.y, piece.z]}
      castShadow
    >
      <boxGeometry args={[piece.width, 1, piece.depth]} />
      <meshStandardMaterial
        color={piece.color}
        roughness={0.5}
        metalness={0.05}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

interface FallingPiecesProps {
  pieces: FallingPiece[];
  onRemove: (id: number) => void;
}

/** Renders all currently falling cut-off pieces. */
export default function FallingPieces({ pieces, onRemove }: FallingPiecesProps) {
  return (
    <>
      {pieces.map((piece) => (
        <FallingPieceMesh key={piece.id} piece={piece} onRemove={onRemove} />
      ))}
    </>
  );
}
