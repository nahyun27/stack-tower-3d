"use client";

import StackGame from "./game/StackGame";
import GameUI from "./game/GameUI";
import { useGameStore } from "./game/useGameStore";

/**
 * Root page — renders the 3D game canvas and the HTML UI overlay.
 * Both share the same game store instance.
 */
export default function Home() {
  const store = useGameStore();

  return (
    <div className="game-root" onClick={() => {
      // Start game on first click anywhere (idle phase)
      if (store.state.phase === "idle") {
        store.startGame();
      }
    }}>
      {/* 3D canvas fills the screen */}
      <StackGame store={store} />

      {/* HTML overlay sits on top */}
      <GameUI store={store} />
    </div>
  );
}
