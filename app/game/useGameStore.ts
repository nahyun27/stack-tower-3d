"use client";

import { useState, useCallback, useRef } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

export type GamePhase = "idle" | "playing" | "gameover";
export type MoveAxis = "x" | "z";

/** A box that has been successfully placed on the tower */
export interface StackedBox {
  id: number;
  x: number;       // center X
  z: number;       // center Z
  y: number;       // center Y
  width: number;   // X extent
  depth: number;   // Z extent
  color: string;
}

/** A piece that was cut off and is now falling */
export interface FallingPiece {
  id: number;
  x: number;
  z: number;
  y: number;
  width: number;
  depth: number;
  color: string;
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
  /** Which axis the current moving box oscillates on */
  currentAxis: MoveAxis;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const BOX_HEIGHT = 1;
const INITIAL_WIDTH = 2;
const INITIAL_DEPTH = 2;
const GAME_OVER_THRESHOLD = 0.3;

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
      color: "hsl(200, 60%, 50%)",
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
      currentAxis: "x", // first moving box goes left-right
    };
  }

  const startGame = useCallback(() => {
    setState((prev) => ({ ...prev, phase: "playing" }));
  }, []);

  /**
   * Drop the current moving box.
   * movingX / movingZ: current world position of the oscillating box.
   * Only one axis will have changed; the other stays aligned with the tower.
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

      if (axis === "x") {
        // Box moved on X — calculate overlap on X, Z is fixed
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
      } else {
        // Box moved on Z — calculate overlap on Z, X is fixed
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
      }

      // Game over check
      const overlap = axis === "x" ? overlapX : overlapZ;
      if (overlap < GAME_OVER_THRESHOLD) {
        return {
          ...prev,
          phase: "gameover",
          bestScore: Math.max(prev.score, prev.bestScore),
        };
      }

      const newY = top.y + BOX_HEIGHT;
      const newHue = (prev.currentHue + 25) % 360;
      const newColor = `hsl(${newHue}, 75%, 60%)`;

      // Placed box
      const newBox: StackedBox = {
        id: ++idRef.current,
        x: placedX,
        z: placedZ,
        y: newY,
        width: overlapX,
        depth: overlapZ,
        color: newColor,
      };

      // Falling piece
      const newFalling: FallingPiece[] = [...prev.fallingPieces];

      if (axis === "x") {
        const cutWidth = curWidth - overlapX;
        if (cutWidth > 0.01) {
          const cutOnLeft = movingX - curWidth / 2 < top.x - top.width / 2;
          const cutX = cutOnLeft
            ? (movingX - curWidth / 2) + cutWidth / 2
            : placedX + overlapX / 2 + cutWidth / 2;
          newFalling.push({
            id: ++idRef.current,
            x: cutX, z: top.z, y: newY,
            width: cutWidth, depth: curDepth,
            color: newColor, velocityY: 0,
            rotationSpeed: (Math.random() - 0.5) * 4,
          });
        }
      } else {
        const cutDepth = curDepth - overlapZ;
        if (cutDepth > 0.01) {
          const cutOnFront = movingZ - curDepth / 2 < top.z - top.depth / 2;
          const cutZ = cutOnFront
            ? (movingZ - curDepth / 2) + cutDepth / 2
            : placedZ + overlapZ / 2 + cutDepth / 2;
          newFalling.push({
            id: ++idRef.current,
            x: top.x, z: cutZ, y: newY,
            width: curWidth, depth: cutDepth,
            color: newColor, velocityY: 0,
            rotationSpeed: (Math.random() - 0.5) * 4,
          });
        }
      }

      return {
        ...prev,
        score: prev.score + 1,
        stack: [...prev.stack, newBox],
        fallingPieces: newFalling,
        currentHue: newHue,
        currentBoxWidth: overlapX,
        currentBoxDepth: overlapZ,
        // Alternate axis: X → Z → X → Z …
        currentAxis: axis === "x" ? "z" : "x",
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

  return { state, startGame, dropBox, removeFallenPiece, resetGame };
}

export type GameStore = ReturnType<typeof useGameStore>;
