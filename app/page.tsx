"use client";

import { ThemeProvider, useTheme } from "./game/ThemeContext";
import { useGameStore } from "./game/useGameStore";
import StackGame from "./game/StackGame";
import GameUI from "./game/GameUI";

/** Inner component so it can access the ThemeContext */
function GameApp() {
  const store = useGameStore();
  const { theme } = useTheme();

  return (
    <div
      className="game-root"
      onClick={() => {
        if (store.state.phase === "idle") store.startGame();
      }}
    >
      <StackGame store={store} theme={theme} />
      <GameUI store={store} theme={theme} />
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
