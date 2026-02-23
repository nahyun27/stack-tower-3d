"use client";

import { GameStore } from "./useGameStore";

interface GameUIProps {
  store: GameStore;
}

/**
 * HTML overlay rendered on top of the R3F canvas.
 * Handles: score display, "Click to Start", and "Game Over" screen.
 */
export default function GameUI({ store }: GameUIProps) {
  const { state, startGame, resetGame } = store;

  return (
    <div className="ui-overlay">
      {/* ── Score ─────────────────────────────────────────────────────── */}
      {state.phase !== "idle" && (
        <div className="score-panel">
          <div className="score-label">SCORE</div>
          <div className="score-value">{state.score}</div>
          <div className="best-label">BEST</div>
          <div className="best-value">{state.bestScore}</div>
        </div>
      )}

      {/* ── Click to Start ────────────────────────────────────────────── */}
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
          {state.score >= state.bestScore && state.score > 0 && (
            <div className="new-best">🏆 New Best!</div>
          )}
          <button className="restart-btn" onClick={resetGame}>
            Restart
          </button>
        </div>
      )}

      {/* ── Playing hint (disappears after first drop) ─────────────────── */}
      {state.phase === "playing" && state.score === 0 && (
        <div className="hint">Click anywhere to drop</div>
      )}
    </div>
  );
}
