"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars, ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { GameStore } from "./useGameStore";
import { ThemeConfig } from "./ThemeContext";
import { LandingEffectData } from "./LandingEffect";
import GameCamera from "./GameCamera";
import MovingBox from "./MovingBox";
import StackedBoxes from "./StackedBoxes";
import FallingPieces from "./FallingPieces";
import LandingEffects from "./LandingEffect";

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
          color: placed.color,
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
      {/* ── Stars background (hidden in pastel theme) ───────────────── */}
      {theme.isDark && (
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
      <FallingPieces pieces={state.fallingPieces} onRemove={removeFallenPiece} />

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
        <Vignette eskil={false} offset={0.12} darkness={theme.isDark ? 0.55 : 0.2} />
      </EffectComposer>
    </Canvas>
  );
}
