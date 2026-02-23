"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSpring, animated } from "@react-spring/three";
import { RoundedBox } from "@react-three/drei";
import { StackedBox } from "./useGameStore";
import { ThemeConfig } from "./ThemeContext";

interface SingleBoxProps {
  box: StackedBox;
  isLatest: boolean;
  theme: ThemeConfig;
}

/** Individual box with spring bounce when it's the latest placed block. */
function SingleBox({ box, isLatest, theme }: SingleBoxProps) {
  // Spring squash-and-stretch: land with a slight squash, then bounce back
  const { scaleXZ, scaleY } = useSpring({
    from: isLatest ? { scaleXZ: 1.1, scaleY: 0.85 } : { scaleXZ: 1, scaleY: 1 },
    to: { scaleXZ: 1, scaleY: 1 },
    reset: isLatest,
    config: { tension: 260, friction: 14, mass: 0.8 },
  });

  const color = theme.blockColor(box.hue);

  return (
    <animated.mesh
      position={[box.x, box.y, box.z]}
      scale-x={scaleXZ}
      scale-y={scaleY}
      scale-z={scaleXZ}
      castShadow
      receiveShadow
    >
      <RoundedBox args={[box.width, 1, box.depth]} radius={0.07} smoothness={3}>
        {theme.useClearcoat ? (
          <meshPhysicalMaterial
            color={color}
            roughness={0.0}
            metalness={0.0}
            clearcoat={1.0}
            clearcoatRoughness={0.0}
            ior={1.45}
            reflectivity={0.6}
          />
        ) : (
          <meshStandardMaterial
            color={color}
            roughness={theme.materialRoughness}
            metalness={theme.materialMetalness}
          />
        )}
      </RoundedBox>
    </animated.mesh>
  );
}

interface StackedBoxesProps {
  boxes: StackedBox[];
  latestBoxId: number | null;
  theme: ThemeConfig;
}

export default function StackedBoxes({
  boxes,
  latestBoxId,
  theme,
}: StackedBoxesProps) {
  return (
    <>
      {boxes.map((box) => (
        <SingleBox
          key={box.id}
          box={box}
          isLatest={box.id === latestBoxId}
          theme={theme}
        />
      ))}
    </>
  );
}
