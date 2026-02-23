"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { GameStore } from "./useGameStore";
import { LandingEffectData } from "./LandingEffect";
import GameCamera from "./GameCamera";
import MovingBox from "./MovingBox";
import StackedBoxes from "./StackedBoxes";
import FallingPieces from "./FallingPieces";
import LandingEffects from "./LandingEffect";

interface StackGameProps {
  store: GameStore;
}

let effectIdCounter = 1000;

export default function StackGame({ store }: StackGameProps) {
  const { state, dropBox, removeFallenPiece } = store;

  // Shared ref: live X and Z position of the moving box each frame
  const positionRef = useRef<{ x: number; z: number }>({ x: 0, z: 0 });

  // Landing effects (visual only — managed locally, not in store)
  const [landingEffects, setLandingEffects] = useState<LandingEffectData[]>([]);
  const prevScoreRef = useRef(state.score);

  // Detect when a new box is successfully placed → trigger landing effect
  useEffect(() => {
    if (state.score > prevScoreRef.current && state.stack.length > 1) {
      const topBox = state.stack[state.stack.length - 1];
      setLandingEffects((prev) => [
        ...prev,
        {
          id: effectIdCounter++,
          x: topBox.x,
          y: topBox.y,
          z: topBox.z,
          color: topBox.color,
        },
      ]);
    }
    prevScoreRef.current = state.score;
  }, [state.score, state.stack]);

  const removeLandingEffect = useCallback((id: number) => {
    setLandingEffects((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const topBox = state.stack[state.stack.length - 1];
  const towerTopY = topBox ? topBox.y + 0.5 : 1;

  // Next hue (one step ahead of last placed box)
  const nextHue = (state.currentHue + 25) % 360;
  const movingColor = `hsl(${nextHue}, 75%, 60%)`;

  const handleClick = useCallback(() => {
    if (state.phase === "playing") {
      dropBox(positionRef.current.x, positionRef.current.z);
    }
  }, [state.phase, dropBox]);

  return (
    <Canvas
      shadows
      style={{ width: "100%", height: "100%" }}
      // Camera is controlled programmatically via GameCamera
      camera={{ position: [7, 6, 7], fov: 50 }}
      onClick={handleClick}
    >
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 15, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      {/* Cool fill from below */}
      <pointLight position={[0, -5, 0]} intensity={0.3} color="#4488ff" />

      {/* Diagonal camera following tower height */}
      <GameCamera towerHeight={towerTopY} />

      {/* Tower */}
      <StackedBoxes boxes={state.stack} />

      {/* Currently oscillating box — alternates X / Z axis each round */}
      {state.phase === "playing" && (
        <MovingBox
          width={state.currentBoxWidth}
          depth={state.currentBoxDepth}
          topY={towerTopY}
          color={movingColor}
          active={true}
          axis={state.currentAxis}
          positionRef={positionRef}
        />
      )}

      {/* Falling cut-off pieces */}
      <FallingPieces pieces={state.fallingPieces} onRemove={removeFallenPiece} />

      {/* Landing ring/flash effects */}
      <LandingEffects effects={landingEffects} onDone={removeLandingEffect} />

      {/* Atmospheric fog */}
      <fog attach="fog" args={["#0a0a0f", 20, 80]} />
    </Canvas>
  );
}
