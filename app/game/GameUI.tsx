"use client";

import { useState, useEffect } from "react";
import { useTheme, THEMES, ThemeId } from "./ThemeContext";
import { GameStore } from "./useGameStore";
import { ThemeConfig } from "./ThemeContext";
import { SoundEffects } from "./useSoundEffects";

interface GameUIProps {
  store: GameStore;
  theme: ThemeConfig;
  sounds: SoundEffects;
}

/** Inline theme picker — renders theme buttons without absolute positioning */
function InlineThemePicker() {
  const { themeId, setTheme } = useTheme();
  const themeOrder: ThemeId[] = ["classic", "neon", "ice", "jelly"];

  return (
    <div className="inline-theme-picker">
      <p className="theme-pick-label">Choose a theme</p>
      <div className="inline-theme-buttons">
        {themeOrder.map((id) => {
          const t = THEMES[id];
          return (
            <button
              key={id}
              className={`inline-theme-btn ${id === themeId ? "active" : ""}`}
              onClick={(e) => { e.stopPropagation(); setTheme(id); }}
              title={t.name}
              aria-label={`Switch to ${t.name} theme`}
            >
              <span className="theme-emoji">{t.emoji}</span>
              <span className="theme-name">{t.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function GameUI({ store, theme, sounds }: GameUIProps) {
  const { state, startGame, resetGame, retryGame } = store;

  return (
    <div className="ui-overlay">
      {/* ── Mute button (always visible, top-right) ───────────────────── */}
      <button
        className="mute-btn"
        onClick={sounds.toggleMute}
        aria-label={sounds.isMuted ? "Unmute" : "Mute"}
        title={sounds.isMuted ? "Unmute" : "Mute"}
      >
        {sounds.isMuted ? "🔇" : "🔊"}
      </button>

      {/* ── Score panels (visible while playing / game over) ───────────── */}
      <div className={`current-score ${state.phase === "idle" ? "score-hidden" : ""}`}>
        <div className="score-label">SCORE</div>
        <div className="score-value">{state.score}</div>
      </div>
      <div className={`best-score ${state.phase === "idle" ? "score-hidden" : ""}`}>
        <div className="best-label">BEST</div>
        <div className="best-value">{state.bestScore}</div>
      </div>

      {/* ══ START SCREEN ══════════════════════════════════════════════════ */}
      <div className={`center-overlay start-overlay ${state.phase === "idle" ? "overlay-visible" : "overlay-hidden"}`}>
        <h1 className="game-title">STACK TOWER</h1>
        <p className="game-subtitle">3D</p>

        {/* Inline theme picker — embedded in start screen */}
        <InlineThemePicker />

        <button
          className="start-sound-toggle"
          onClick={(e) => { e.stopPropagation(); sounds.toggleMute(); }}
        >
          {sounds.isMuted ? "🔇 Sound: OFF" : "🔊 Sound: ON"}
        </button>

        {state.bestScore > 0 && (
          <p className="best-score-hint">Best Score: {state.bestScore}</p>
        )}

        <button className="start-btn" onClick={startGame}>
          <span className="tap-icon">👆</span> CLICK TO START
        </button>
      </div>

      {/* ══ GAME OVER SCREEN ══════════════════════════════════════════════ */}
      <div className={`center-overlay gameover-overlay ${state.phase === "gameover" ? "overlay-visible" : "overlay-hidden"}`}>
        <h2 className="gameover-title">GAME OVER</h2>
        <div className="final-score-label">SCORE</div>
        <div className="final-score-value">{state.score}</div>
        {state.score > 0 && state.score >= state.bestScore && (
          <div className="new-best">🏆 New Best!</div>
        )}

        {/* Inline theme picker — embedded in game over screen */}
        <p className="theme-pick-label" style={{ marginTop: 20 }}>Change Theme?</p>
        <InlineThemePicker />

        <div className="gameover-btns">
          <button className="gameover-btn gameover-btn-secondary" onClick={resetGame}>
            🎨 Home
          </button>
          <button className="gameover-btn gameover-btn-primary" onClick={retryGame}>
            🔄 RETRY
          </button>
        </div>
      </div>


      {/* ── First-move hint (during play) ────────────────────────────── */}
      {state.phase === "playing" && state.score === 0 && (
        <div className="hint">Click anywhere to drop</div>
      )}
    </div>
  );
}
