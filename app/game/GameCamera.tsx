"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface GameCameraProps {
  towerHeight: number;
}

// Diagonal camera: positioned at equal X and Z, elevated
const START_X = 7;
const START_Z = 7;
const BASE_Y = 6;
const LERP_FACTOR = 0.04;

/**
 * Diagonal isometric-style camera.
 * Starts at [7, 6, 7] and follows tower height smoothly.
 */
export default function GameCamera({ towerHeight }: GameCameraProps) {
  const { camera } = useThree();

  // Set initial diagonal position once
  const initialized = useRef(false);
  if (!initialized.current) {
    camera.position.set(START_X, BASE_Y, START_Z);
    camera.lookAt(0, 0, 0);
    initialized.current = true;
  }

  useFrame(() => {
    const desiredY = Math.max(BASE_Y, towerHeight + BASE_Y - 1);

    camera.position.y = THREE.MathUtils.lerp(camera.position.y, desiredY, LERP_FACTOR);

    // Always look at a point slightly below the camera on the tower axis
    camera.lookAt(0, camera.position.y - 5, 0);
  });

  return null;
}
