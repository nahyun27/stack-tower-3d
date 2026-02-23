"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars, ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { GameStore } from "./useGameStore";
import { ThemeConfig } from "./ThemeContext";
import { LandingEffectData } from "./LandingEffect";
import GameCamera from "./GameCamera";
import MovingBox from "./MovingBox";
import StackedBoxes from "./StackedBoxes";
import FallingPieces from "./FallingPieces";
import LandingEffects from "./LandingEffect";
import SnowParticles from "./SnowParticles";
import RainParticles from "./RainParticles";
import ElectricSparks from "./ElectricSparks";
import CityGrid from "./CityGrid";

interface StackGameProps {
  store: GameStore;
  theme: ThemeConfig;
  playDrop: () => void;
}

let effectIdCounter = 2000;

export default function StackGame({ store, theme, playDrop }: StackGameProps) {
  const { state, dropBox, removeFallenPiece } = store;

  // Live world position of the oscillating box (updated every frame by MovingBox)
  const positionRef = useRef<{ x: number; z: number }>({ x: 0, z: 0 });

  // Landing effects state (visual only)
  const [landingEffects, setLandingEffects] = useState<LandingEffectData[]>([]);
  const prevScoreRef = useRef(state.score);
  const [latestBoxId, setLatestBoxId] = useState<number | null>(null);

  // Top stacked box — provides pivot and camera height
  const topBox = state.stack[state.stack.length - 1];
  const towerTopY = topBox ? topBox.y + 0.5 : 1;
  const pivotX = topBox?.x ?? 0;
  const pivotZ = topBox?.z ?? 0;

  // Detect successful drops → trigger landing effects + track latest box
  useEffect(() => {
    if (state.score > prevScoreRef.current && state.stack.length > 1) {
      const placed = state.stack[state.stack.length - 1];
      setLatestBoxId(placed.id);
      setLandingEffects((prev) => [
        ...prev,
        {
          id: effectIdCounter++,
          x: placed.x,
          y: placed.y,
          z: placed.z,
          color: theme.blockColor(placed.hue),
          perfect: state.lastDropPerfect,
        },
      ]);
      // Clear "latest" after bounce animation completes (~600ms)
      const timer = setTimeout(() => setLatestBoxId(null), 600);
      return () => clearTimeout(timer);
    }
    prevScoreRef.current = state.score;
  }, [state.score, state.stack, state.lastDropPerfect]);

  const removeLandingEffect = useCallback((id: number) => {
    setLandingEffects((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // Moving box color: next hue ahead of last placed
  const nextHue = (state.currentHue + 25) % 360;
  const movingColor = theme.blockColor(nextHue);

  const handleClick = useCallback(() => {
    if (state.phase === "playing") {
      playDrop();
      dropBox(positionRef.current.x, positionRef.current.z);
    }
  }, [state.phase, dropBox, playDrop]);

  return (
    <Canvas
      shadows
      style={{ width: "100%", height: "100%" }}
      camera={{ position: [7, 6, 7], fov: 50 }}
      onClick={handleClick}
    >
      {/* ── Lighting (theme-aware) ─────────────────────────────────── */}
      <ambientLight color={theme.ambientColor} intensity={theme.ambientIntensity} />
      <directionalLight
        position={[5, 15, 5]}
        color={theme.dirLightColor}
        intensity={theme.dirLightIntensity}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      {/* ── Aurora fill light (ice theme only) ───────────────────── */}
      {theme.id === "ice" && (
        <>
          <hemisphereLight color="#00e8ff" groundColor="#4466ff" intensity={0.7} />
          <pointLight position={[0, 30, 0]} color="#00ffcc" intensity={0.5} distance={80} />
        </>
      )}

      {/* ── Stars background (dark themes) ─────────────────────────── */}
      {theme.isDark && theme.id !== "ice" && (
        <Stars
          radius={120}
          depth={60}
          count={700}
          factor={4}
          saturation={theme.id === "neon" ? 1 : 0}
          fade
          speed={0.6}
        />
      )}

      {/* ── Neon City: grid floor + rain + electric sparks ───────────── */}
      {theme.id === "neon" && (
        <>
          <CityGrid />
          <RainParticles />
          <ElectricSparks />
          {/* Extra neon point lights for atmosphere */}
          <pointLight position={[-8, 4, 0]} color="#FF10F0" intensity={1.2} distance={25} />
          <pointLight position={[8, 4, 0]} color="#00FFFF" intensity={1.2} distance={25} />
          <pointLight position={[0, 4, -8]} color="#BF00FF" intensity={0.8} distance={25} />
        </>
      )}

      {/* ── Snow particles (ice theme only) ────────────────────────── */}
      {theme.id === "ice" && <SnowParticles />}

      {/* ── Camera ─────────────────────────────────────────────────── */}
      <GameCamera towerHeight={towerTopY} />

      {/* ── Tower blocks ───────────────────────────────────────────── */}
      <StackedBoxes
        boxes={state.stack}
        latestBoxId={latestBoxId}
        theme={theme}
      />

      {/* ── Moving box (pivot-relative oscillation) ─────────────────── */}
      {state.phase === "playing" && (
        <MovingBox
          key={`${state.currentAxis}-${pivotX.toFixed(2)}-${pivotZ.toFixed(2)}`}
          width={state.currentBoxWidth}
          depth={state.currentBoxDepth}
          topY={towerTopY}
          color={movingColor}
          active
          axis={state.currentAxis}
          pivotX={pivotX}
          pivotZ={pivotZ}
          positionRef={positionRef}
        />
      )}

      {/* ── Falling cut-off pieces ──────────────────────────────────── */}
      <FallingPieces pieces={state.fallingPieces} onRemove={removeFallenPiece} theme={theme} />

      {/* ── Landing ring / particles / Perfect text ─────────────────── */}
      <LandingEffects effects={landingEffects} onDone={removeLandingEffect} />

      {/* ── Ground contact shadows ──────────────────────────────────── */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={theme.isDark ? 0.5 : 0.25}
        scale={18}
        blur={2.5}
        far={4}
      />

      {/* ── Atmospheric fog ─────────────────────────────────────────── */}
      <fog attach="fog" args={[theme.fogColor, theme.fogNear, theme.fogFar]} />

      {/* ── Post-processing ─────────────────────────────────────────── */}
      <EffectComposer>
        <Bloom
          intensity={theme.bloomIntensity}
          luminanceThreshold={theme.bloomThreshold}
          luminanceSmoothing={0.9}
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={[theme.id === "neon" ? 0.002 : 0, theme.id === "neon" ? 0.002 : 0] as unknown as import("three").Vector2}
          radialModulation={false}
          modulationOffset={0}
        />
        <Vignette eskil={false} offset={0.12} darkness={theme.isDark ? 0.55 : 0.2} />
      </EffectComposer>
    </Canvas>
  );
}
