"use client";

import { StackedBox } from "./useGameStore";

interface StackedBoxesProps {
  boxes: StackedBox[];
}

/**
 * Renders all successfully placed boxes in the tower.
 * Each box is a simple Three.js mesh with standard material.
 */
export default function StackedBoxes({ boxes }: StackedBoxesProps) {
  return (
    <>
      {boxes.map((box) => (
        <mesh
          key={box.id}
          position={[box.x, box.y, box.z]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[box.width, 1, box.depth]} />
          <meshStandardMaterial
            color={box.color}
            roughness={0.4}
            metalness={0.15}
          />
        </mesh>
      ))}
    </>
  );
}
