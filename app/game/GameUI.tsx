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
  const { state, startGame, resetGame, retryGame } = store;

  return (
    <div className="ui-overlay">
      {/* ── Theme Switcher: visible only on start / game over screens ── */}
      {state.phase !== "playing" && <ThemeSwitcher />}

      {/* ── Mute button (top-right, always visible) ──────────────────── */}
      <button
        className="mute-btn"
        onClick={sounds.toggleMute}
        aria-label={sounds.isMuted ? "Unmute" : "Mute"}
        title={sounds.isMuted ? "Unmute" : "Mute"}
      >
        {sounds.isMuted ? "🔇" : "🔊"}
      </button>

      {/* ── Score (visible while playing + game over) ─────────────────── */}
      {state.phase !== "idle" && (
        <div className="score-panel">
          <div className="score-label">SCORE</div>
          <div className="score-value">{state.score}</div>
          <div className="best-label">BEST</div>
          <div className="best-value">{state.bestScore}</div>
        </div>
      )}

      {/* ── Start Screen ──────────────────────────────────────────────── */}
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

      {/* ── Game Over ─────────────────────────────────────────────────── */}
      {state.phase === "gameover" && (
        <div className="center-overlay gameover">
          <h2 className="gameover-title">GAME OVER</h2>
          <div className="final-score-label">SCORE</div>
          <div className="final-score-value">{state.score}</div>
          {state.score > 0 && state.score >= state.bestScore && (
            <div className="new-best">🏆 New Best!</div>
          )}
          {/* RETRY → immediately starts a new game */}
          <button className="restart-btn" onClick={retryGame}>
            RETRY
          </button>
          {/* Secondary: go back to start screen (so user can change theme) */}
          <button
            className="restart-btn"
            style={{ marginTop: 8, fontSize: "0.8em", opacity: 0.7 }}
            onClick={resetGame}
          >
            Change Theme
          </button>
        </div>
      )}

      {/* ── First-move hint ───────────────────────────────────────────── */}
      {state.phase === "playing" && state.score === 0 && (
        <div className="hint">Click anywhere to drop</div>
      )}
    </div>
  );
}
