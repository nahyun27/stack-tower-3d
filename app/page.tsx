"use client";

import { useEffect, useRef } from "react";
import { ThemeProvider, useTheme } from "./game/ThemeContext";
import { useGameStore } from "./game/useGameStore";
import { useSoundEffects } from "./game/useSoundEffects";
import StackGame from "./game/StackGame";
import GameUI from "./game/GameUI";

function GameApp() {
  const store = useGameStore();
  const { theme } = useTheme();
  const sounds = useSoundEffects();

  const { state } = store;
  const prevScoreRef = useRef(state.score);
  const prevPhaseRef = useRef(state.phase);
  const prevFallingCountRef = useRef(state.fallingPieces.length);

  // ── Music & Sound effect detection ────────────────────────────────────────
  useEffect(() => {
    // Music control — update if theme changes
    // We start playing as soon as the app loads or theme changes
    sounds.playMusic(theme.bgMusic);

    // Phase transitions for specific sounds
    if (state.phase !== prevPhaseRef.current) {
      if (state.phase === "gameover") {
        sounds.playGameOver();
      }
      prevPhaseRef.current = state.phase;
    }

    // Successful block placement
    if (state.score > prevScoreRef.current) {
      sounds.playLand(state.lastDropQuality, theme.id);
      prevScoreRef.current = state.score;
    }

    // New falling piece added
    if (state.fallingPieces.length > prevFallingCountRef.current) {
      sounds.playFall();
    }
    prevFallingCountRef.current = state.fallingPieces.length;
  }, [state.phase, state.score, state.fallingPieces.length, state.lastDropQuality, theme, sounds]);

  return (
    <div
      className={`game-root${theme.id === "neon" ? " neon-theme" : ""}`}
      onClick={() => {
        if (store.state.phase === "idle") store.startGame();
      }}
    >
      <StackGame store={store} theme={theme} playDrop={sounds.playDrop} />
      <GameUI store={store} theme={theme} sounds={sounds} />
    </div>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <GameApp />
    </ThemeProvider>
  );
}
