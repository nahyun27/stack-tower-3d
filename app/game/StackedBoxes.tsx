"use client";

import { useRef } from "react";
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
  // Jelly uses a much bouncier spring — high tension, low friction
  const springConfig = theme.useJelly
    ? { tension: 480, friction: 10, mass: 0.5 }
    : { tension: 260, friction: 14, mass: 0.8 };

  const { scaleXZ, scaleY } = useSpring({
    from: isLatest
      ? { scaleXZ: theme.useJelly ? 1.18 : 1.1, scaleY: theme.useJelly ? 0.75 : 0.85 }
      : { scaleXZ: 1, scaleY: 1 },
    to: { scaleXZ: 1, scaleY: 1 },
    reset: isLatest,
    config: springConfig,
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
      <RoundedBox args={[box.width, 1, box.depth]} radius={0.1} smoothness={4}>
        {theme.useNeonGlass ? (
          /* ⚡ Neon Glass — semi-transparent with emissive neon edge glow */
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
          /* 🧊 Ice Crystal — refractive, transparent ice */
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
          /* 🍬 Jelly — thick, saturated clearcoat candy */
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
          /* Standard material */
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
