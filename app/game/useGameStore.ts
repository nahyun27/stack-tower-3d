"use client";

import { useState, useCallback, useRef } from "react";
import { LandQuality } from "./useSoundEffects";

// ─── Types ─────────────────────────────────────────────────────────────────

export type GamePhase = "idle" | "playing" | "gameover";
export type MoveAxis = "x" | "z";

export interface StackedBox {
  id: number;
  x: number;
  z: number;
  y: number;
  width: number;
  depth: number;
  /** Raw hue (0–360) — color computed at render time by theme */
  hue: number;
}

export interface FallingPiece {
  id: number;
  x: number;
  z: number;
  y: number;
  width: number;
  depth: number;
  hue: number;
  velocityY: number;
  rotationSpeed: number;
}

export interface GameState {
  phase: GamePhase;
  score: number;
  bestScore: number;
  stack: StackedBox[];
  fallingPieces: FallingPiece[];
  currentHue: number;
  currentBoxWidth: number;
  currentBoxDepth: number;
  currentAxis: MoveAxis;
  /** True if the last drop was a perfect (100%) overlap */
  lastDropPerfect: boolean;
  /** Quality grade of the last successful drop (for sound selection) */
  lastDropQuality: LandQuality;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const BOX_HEIGHT = 1;
const INITIAL_WIDTH = 2;
const INITIAL_DEPTH = 2;
const GAME_OVER_THRESHOLD = 0.3;
const PERFECT_THRESHOLD = 0.05; // within 0.05 units = "perfect"

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useGameStore() {
  const [state, setState] = useState<GameState>(() => buildInitialState());
  const idRef = useRef(0);

  function buildInitialState(): GameState {
    const platform: StackedBox = {
      id: 0,
      x: 0,
      z: 0,
      y: 0.5,
      width: INITIAL_WIDTH,
      depth: INITIAL_DEPTH,
      hue: 200,
    };
    return {
      phase: "idle",
      score: 0,
      bestScore: 0,
      stack: [platform],
      fallingPieces: [],
      currentHue: 220,
      currentBoxWidth: INITIAL_WIDTH,
      currentBoxDepth: INITIAL_DEPTH,
      currentAxis: "x",
      lastDropPerfect: false,
      lastDropQuality: "good",
    };
  }

  const startGame = useCallback(() => {
    setState((prev) => ({ ...prev, phase: "playing" }));
  }, []);

  /**
   * Drop the current moving box.
   * Pass the live world X and Z of the oscillating box.
   */
  const dropBox = useCallback((movingX: number, movingZ: number) => {
    setState((prev) => {
      if (prev.phase !== "playing") return prev;

      const top = prev.stack[prev.stack.length - 1];
      const curWidth = prev.currentBoxWidth;
      const curDepth = prev.currentBoxDepth;
      const axis = prev.currentAxis;

      let overlapX: number;
      let overlapZ: number;
      let placedX: number;
      let placedZ: number;
      let cutDimension: number; // size of the cut-off piece on the moving axis

      if (axis === "x") {
        const curLeft = movingX - curWidth / 2;
        const curRight = movingX + curWidth / 2;
        const topLeft = top.x - top.width / 2;
        const topRight = top.x + top.width / 2;
        const oLeft = Math.max(curLeft, topLeft);
        const oRight = Math.min(curRight, topRight);
        overlapX = oRight - oLeft;
        overlapZ = curDepth;
        placedX = (oLeft + oRight) / 2;
        placedZ = top.z;
        cutDimension = curWidth - overlapX;
      } else {
        const curFront = movingZ - curDepth / 2;
        const curBack = movingZ + curDepth / 2;
        const topFront = top.z - top.depth / 2;
        const topBack = top.z + top.depth / 2;
        const oFront = Math.max(curFront, topFront);
        const oBack = Math.min(curBack, topBack);
        overlapX = curWidth;
        overlapZ = oBack - oFront;
        placedX = top.x;
        placedZ = (oFront + oBack) / 2;
        cutDimension = curDepth - overlapZ;
      }

      // ── Game over ─────────────────────────────────────────────────────
      const primaryOverlap = axis === "x" ? overlapX : overlapZ;
      if (primaryOverlap < GAME_OVER_THRESHOLD) {
        return {
          ...prev,
          phase: "gameover",
          bestScore: Math.max(prev.score, prev.bestScore),
          lastDropPerfect: false,
        };
      }

      // ── Perfect detection & quality ──────────────────────────────────
      const isPerfect = cutDimension < PERFECT_THRESHOLD;
      const overlapRatio = axis === "x" ? overlapX / curWidth : overlapZ / curDepth;
      const quality: LandQuality = isPerfect ? "perfect" : overlapRatio >= 0.72 ? "good" : "okay";
      // If perfect, snap exactly to center of previous box
      const finalX = isPerfect ? top.x : placedX;
      const finalZ = isPerfect ? top.z : placedZ;
      const finalW = isPerfect ? curWidth : overlapX;
      const finalD = isPerfect ? curDepth : overlapZ;

      const newY = top.y + BOX_HEIGHT;
      const newHue = (prev.currentHue + 25) % 360;

      const newBox: StackedBox = {
        id: ++idRef.current,
        x: finalX,
        z: finalZ,
        y: newY,
        width: finalW,
        depth: finalD,
        hue: newHue,
      };

      // ── Falling piece ─────────────────────────────────────────────────
      const newFalling: FallingPiece[] = [...prev.fallingPieces];

      if (!isPerfect && cutDimension > 0.01) {
        if (axis === "x") {
          const cutOnLeft = movingX - curWidth / 2 < top.x - top.width / 2;
          const cutX = cutOnLeft
            ? (movingX - curWidth / 2) + cutDimension / 2
            : finalX + overlapX / 2 + cutDimension / 2;
          newFalling.push({
            id: ++idRef.current,
            x: cutX, z: top.z, y: newY,
            width: cutDimension, depth: curDepth,
            hue: newHue, velocityY: 0,
            rotationSpeed: (Math.random() - 0.5) * 4,
          });
        } else {
          const cutOnFront = movingZ - curDepth / 2 < top.z - top.depth / 2;
          const cutZ = cutOnFront
            ? (movingZ - curDepth / 2) + cutDimension / 2
            : finalZ + overlapZ / 2 + cutDimension / 2;
          newFalling.push({
            id: ++idRef.current,
            x: top.x, z: cutZ, y: newY,
            width: curWidth, depth: cutDimension,
            hue: newHue, velocityY: 0,
            rotationSpeed: (Math.random() - 0.5) * 4,
          });
        }
      }

      return {
        ...prev,
        score: prev.score + (isPerfect ? 5 : 1),
        stack: [...prev.stack, newBox],
        fallingPieces: newFalling,
        currentHue: newHue,
        currentBoxWidth: finalW,
        currentBoxDepth: finalD,
        currentAxis: axis === "x" ? "z" : "x",
        lastDropPerfect: isPerfect,
        lastDropQuality: quality,
      };
    });
  }, []);

  const removeFallenPiece = useCallback((id: number) => {
    setState((prev) => ({
      ...prev,
      fallingPieces: prev.fallingPieces.filter((p) => p.id !== id),
    }));
  }, []);

  const resetGame = useCallback(() => {
    setState((prev) => {
      const fresh = buildInitialState();
      return { ...fresh, bestScore: prev.bestScore, phase: "idle" };
    });
  }, []);

  /** Reset and immediately start playing — skips the start screen (used by RETRY). */
  const retryGame = useCallback(() => {
    setState((prev) => {
      const fresh = buildInitialState();
      return { ...fresh, bestScore: prev.bestScore, phase: "playing" };
    });
  }, []);

  return { state, startGame, dropBox, removeFallenPiece, resetGame, retryGame };
}

export type GameStore = ReturnType<typeof useGameStore>;
