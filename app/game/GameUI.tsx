"use client";

import { GameStore } from "./useGameStore";
import { ThemeConfig } from "./ThemeContext";
import { SoundEffects } from "./useSoundEffects";
import ThemeSwitcher from "./ThemeSwitcher";

interface GameUIProps {
  store: GameStore;
  theme: ThemeConfig;
  sounds: SoundEffects;
}

export default function GameUI({ store, theme, sounds }: GameUIProps) {
  const { state, startGame, resetGame } = store;

  return (
    <div className="ui-overlay">
      {/* ── Theme Switcher (top-left, always visible) ─────────────── */}
      <ThemeSwitcher />

      {/* ── Mute button (top-right, above score) ────────────────── */}
      <button
        className="mute-btn"
        onClick={sounds.toggleMute}
        aria-label={sounds.isMuted ? "Unmute" : "Mute"}
        title={sounds.isMuted ? "Unmute" : "Mute"}
      >
        {sounds.isMuted ? "🔇" : "🔊"}
      </button>

      {/* ── Score (top-right) ─────────────────────────────────────── */}
      {state.phase !== "idle" && (
        <div className="score-panel">
          <div className="score-label">SCORE</div>
          <div className="score-value">{state.score}</div>
          <div className="best-label">BEST</div>
          <div className="best-value">{state.bestScore}</div>
        </div>
      )}

      {/* ── Click to Start ────────────────────────────────────────── */}
      {state.phase === "idle" && (
        <div className="center-overlay" onClick={startGame}>
          <h1 className="game-title">STACK TOWER</h1>
          <p className="game-subtitle">3D</p>
          <div className="start-prompt">
            <span className="tap-icon">👆</span>
            <span>Click to Start</span>
          </div>
        </div>
      )}

      {/* ── Game Over ─────────────────────────────────────────────── */}
      {state.phase === "gameover" && (
        <div className="center-overlay gameover">
          <h2 className="gameover-title">GAME OVER</h2>
          <div className="final-score-label">SCORE</div>
          <div className="final-score-value">{state.score}</div>
          {state.score > 0 && state.score >= state.bestScore && (
            <div className="new-best">🏆 New Best!</div>
          )}
          <button className="restart-btn" onClick={resetGame}>
            Restart
          </button>
        </div>
      )}

      {/* ── First-move hint ───────────────────────────────────────── */}
      {state.phase === "playing" && state.score === 0 && (
        <div className="hint">Click anywhere to drop</div>
      )}
    </div>
  );
}
