import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { ThemeConfig } from "./ThemeContext";
import { StackedBox } from "./useGameStore";

interface SingleBoxProps {
  box: StackedBox;
  isLatest: boolean;
  theme: ThemeConfig;
}

function SingleBox({ box, isLatest, theme }: SingleBoxProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = theme.blockColor(box.hue);
  const isJelly = theme.useJelly;
  const landTime = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current || !isJelly) return;
    const time = state.clock.getElapsedTime();

    // Idle subtle wobble
    const idleScale = 1 + Math.sin(time * 2 + box.id) * 0.015;
    meshRef.current.scale.x = idleScale;
    meshRef.current.scale.z = idleScale;

    // Landing bounce ONLY for the latest box
    if (isLatest) {
      landTime.current += delta;
      const bounceDur = 0.6;
      if (landTime.current < bounceDur) {
        const t = landTime.current / bounceDur;
        const bounce = Math.sin(t * Math.PI * 4) * Math.exp(-t * 5) * 0.1;
        meshRef.current.scale.y = 1 - bounce;
        meshRef.current.position.y = box.y + 0.5 - bounce * 0.5;
      } else {
        meshRef.current.scale.y = 1;
        meshRef.current.position.y = box.y + 0.5;
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[box.x, box.y + 0.5, box.z]}
      castShadow
      receiveShadow
    >
      <RoundedBox args={[box.width, 1, box.depth]} radius={isJelly ? 0.15 : (box as any).radius || 0.06} smoothness={isJelly ? 5 : 3}>
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
        ) : isJelly ? (
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
            thickness={1}
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

interface StackedBoxesProps {
  boxes: StackedBox[];
  theme: ThemeConfig;
  latestBoxId?: number;
}

export default function StackedBoxes({ boxes, theme, latestBoxId }: StackedBoxesProps) {
  return (
    <>
      {boxes.map((box) => (
        <SingleBox
          key={box.id}
          box={box}
          theme={theme}
          isLatest={box.id === latestBoxId}
        />
      ))}
    </>
  );
}
