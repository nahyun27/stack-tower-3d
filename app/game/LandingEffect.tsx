"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

export interface LandingEffectData {
  id: number;
  x: number;
  y: number;
  z: number;
  color: string;
  perfect: boolean;
  themeId?: string;
}

// ─── Expanding ring + disc flash ────────────────────────────────────────────

interface RingEffectProps {
  x: number; y: number; z: number;
  color: string;
  onDone: () => void;
}

function RingEffect({ x, y, z, color, onDone }: RingEffectProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const discRef = useRef<THREE.Mesh>(null);
  const elapsed = useRef(0);
  const done = useRef(false);
  const DURATION = 0.45;

  useFrame((_, delta) => {
    if (done.current) return;
    elapsed.current += delta;
    const t = Math.min(elapsed.current / DURATION, 1);

    if (ringRef.current) {
      const s = 0.1 + t * 3.0;
      ringRef.current.scale.set(s, s, s);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = Math.pow(1 - t, 1.5);
    }
    if (discRef.current) {
      const s = 0.4 + t * 1.2;
      discRef.current.scale.set(s, s, s);
      (discRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.6 - t * 1.8);
    }
    if (t >= 1) { done.current = true; onDone(); }
  });

  return (
    <group position={[x, y + 0.52, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh ref={ringRef}>
        <torusGeometry args={[0.75, 0.07, 8, 48]} />
        <meshBasicMaterial color={color} transparent opacity={1} />
      </mesh>
      <mesh ref={discRef}>
        <circleGeometry args={[0.85, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

// ─── Particle burst ──────────────────────────────────────────────────────────

interface Particle {
  vx: number; vy: number; vz: number;
  rx: number; rz: number;
}

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, () => {
    const theta = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 2;
    return {
      vx: Math.cos(theta) * speed * (0.5 + Math.random() * 0.5),
      vy: 1.5 + Math.random() * 2.5,
      vz: Math.sin(theta) * speed * (0.5 + Math.random() * 0.5),
      rx: (Math.random() - 0.5) * 6,
      rz: (Math.random() - 0.5) * 6,
    };
  });
}

interface ParticleBurstProps {
  x: number; y: number; z: number;
  color: string;
  count?: number;
}

// ─── Ice Crystal Burst ───────────────────────────────────────────────────

function IceCrystalBurst({ x, y, z }: { x: number; y: number; z: number }) {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const particles = useRef(
    Array.from({ length: 20 }, () => ({
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 4 + 2,
      vz: (Math.random() - 0.5) * 4,
      scale: 0.1 + Math.random() * 0.15,
    }))
  );
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    elapsed.current += delta;
    const t = elapsed.current;
    particles.current.forEach((p, i) => {
      const mesh = meshRefs.current[i];
      if (!mesh) return;
      mesh.position.x = p.vx * t;
      mesh.position.y = p.vy * t - 9.8 * 0.5 * t * t;
      mesh.position.z = p.vz * t;
      mesh.rotation.y += delta * 5;
      mesh.rotation.x += delta * 2;
      const opacity = Math.max(0, 1 - t * 1.5);
      (mesh.material as THREE.MeshBasicMaterial).opacity = opacity;
    });
  });

  return (
    <group position={[x, y + 0.5, z]}>
      {particles.current.map((p, i) => (
        <mesh key={i} ref={(el) => (meshRefs.current[i] = el)}>
          <octahedronGeometry args={[p.scale, 0]} />
          <meshBasicMaterial color="#7FDBFF" transparent opacity={1} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Radial Ice Spikes (Perfect) ──────────────────────────────────────────

function RadialIceSpikes({ x, y, z }: { x: number; y: number; z: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const elapsed = useRef(0);
  const DURATION = 0.6;

  useFrame((_, delta) => {
    elapsed.current += delta;
    const t = Math.min(elapsed.current / DURATION, 1);
    if (!groupRef.current) return;
    groupRef.current.scale.set(1 + t * 4, 1 + t * 4, 1 + t * 4);
    groupRef.current.children.forEach((child) => {
      ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 1 - t;
    });
  });

  return (
    <group ref={groupRef} position={[x, y + 0.5, z]}>
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} rotation={[0, (i * Math.PI) / 6, Math.PI / 2]} position={[0.5, 0, 0]}>
          <coneGeometry args={[0.05, 0.8, 4]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={1} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
}

function ParticleBurst({ x, y, z, color, count = 10 }: ParticleBurstProps) {
  const groupRef = useRef<THREE.Group>(null);
  const particles = useRef<Particle[]>(makeParticles(count));
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const elapsed = useRef(0);
  const GRAVITY = -8;
  const DURATION = 0.8;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    elapsed.current += delta;
    const t = elapsed.current;

    particles.current.forEach((p, i) => {
      const mesh = meshRefs.current[i];
      if (!mesh) return;
      mesh.position.set(
        p.vx * t,
        p.vy * t + 0.5 * GRAVITY * t * t,
        p.vz * t
      );
      mesh.rotation.x += p.rx * delta;
      mesh.rotation.z += p.rz * delta;
      const fade = Math.max(0, 1 - t / DURATION);
      (mesh.material as THREE.MeshBasicMaterial).opacity = fade;
    });
  });

  return (
    <group ref={groupRef} position={[x, y + 0.6, z]}>
      {particles.current.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el; }}
        >
          <boxGeometry args={[0.09, 0.09, 0.09]} />
          <meshBasicMaterial color={color} transparent opacity={1} />
        </mesh>
      ))}
    </group>
  );
}

// ─── "Perfect!" floating text ────────────────────────────────────────────────

function PerfectText({ x, y, z }: { x: number; y: number; z: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const elapsed = useRef(0);
  const DURATION = 1.4;

  useFrame((_, delta) => {
    if (!ref.current) return;
    elapsed.current += delta;
    const t = Math.min(elapsed.current / DURATION, 1);
    ref.current.position.y = y + 1.5 + t * 1.2;
    (ref.current.material as THREE.MeshBasicMaterial).opacity =
      t < 0.3 ? t / 0.3 : Math.max(0, 1 - (t - 0.3) / 0.7);
  });

  return (
    <Text
      ref={ref as any}
      position={[x, y + 1.5, z]}
      fontSize={0.45}
      color="#FFD700"
      anchorX="center"
      anchorY="middle"
      material-transparent
      material-opacity={0}
    >
      ✦ PERFECT ✦
    </Text>
  );
}

// ─── Composite landing effect ────────────────────────────────────────────────

interface LandingEffectProps {
  effect: LandingEffectData;
  onDone: (id: number) => void;
}

function LandingEffect({ effect, onDone }: LandingEffectProps) {
  const ringDone = useRef(false);
  const isIce = effect.themeId === "ice";

  return (
    <>
      {!isIce && (
        <RingEffect
          x={effect.x} y={effect.y} z={effect.z}
          color={effect.color}
          onDone={() => {
            if (!ringDone.current) { ringDone.current = true; onDone(effect.id); }
          }}
        />
      )}
      {isIce ? (
        <IceCrystalBurst x={effect.x} y={effect.y} z={effect.z} />
      ) : (
        <ParticleBurst
          x={effect.x} y={effect.y} z={effect.z}
          color={effect.perfect ? "#FFD700" : effect.color}
          count={effect.perfect ? 16 : 10}
        />
      )}
      {isIce && effect.perfect && (
        <RadialIceSpikes x={effect.x} y={effect.y} z={effect.z} />
      )}
      {effect.perfect && (
        <PerfectText x={effect.x} y={effect.y} z={effect.z} />
      )}
      {/* Fallback for ice ring completion since we hid the RingEffect */}
      {isIce && (
        <primitive
          object={new THREE.Object3D()}
          onUpdate={() => {
            if (!ringDone.current) {
              setTimeout(() => { if (!ringDone.current) { ringDone.current = true; onDone(effect.id); } }, 600);
            }
          }}
        />
      )}
    </>
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
