"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface LandingEffectData {
  id: number;
  x: number;
  y: number;
  z: number;
  color: string;
}

interface LandingEffectProps {
  effect: LandingEffectData;
  onDone: (id: number) => void;
}

/**
 * Expanding ring + flash effect that plays when a box is placed.
 * - A flat torus ring that scales out and fades over ~0.5s
 * - A disc flash that briefly brightens then fades
 */
function LandingEffect({ effect, onDone }: LandingEffectProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const discRef = useRef<THREE.Mesh>(null);
  const elapsed = useRef(0);
  const done = useRef(false);

  const DURATION = 0.5;

  useFrame((_, delta) => {
    if (done.current) return;
    elapsed.current += delta;

    const t = Math.min(elapsed.current / DURATION, 1); // 0 → 1

    // Ring: scale out from 0.1 to 3, fade from 1 to 0
    if (ringRef.current) {
      const s = 0.1 + t * 2.9;
      ringRef.current.scale.set(s, s, s);
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.pow(1 - t, 1.5);
    }

    // Disc: scale from 0.5 to 1.5, fade fast
    if (discRef.current) {
      const s = 0.5 + t * 1.0;
      discRef.current.scale.set(s, s, s);
      const mat = discRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 0.7 - t * 1.8);
    }

    if (t >= 1) {
      done.current = true;
      onDone(effect.id);
    }
  });

  return (
    <group position={[effect.x, effect.y + 0.52, effect.z]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Expanding ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[0.8, 0.08, 8, 32]} />
        <meshBasicMaterial color={effect.color} transparent opacity={1} />
      </mesh>

      {/* Inner bright disc flash */}
      <mesh ref={discRef}>
        <circleGeometry args={[0.9, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

interface LandingEffectsProps {
  effects: LandingEffectData[];
  onDone: (id: number) => void;
}

export default function LandingEffects({ effects, onDone }: LandingEffectsProps) {
  return (
    <>
      {effects.map((e) => (
        <LandingEffect key={e.id} effect={e} onDone={onDone} />
      ))}
    </>
  );
}
