"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const RAIN_COUNT = 400;

export default function RainParticles() {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(RAIN_COUNT * 3);
    const speeds = new Float32Array(RAIN_COUNT);
    for (let i = 0; i < RAIN_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = Math.random() * 60 - 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
      speeds[i] = 0.25 + Math.random() * 0.35;
    }
    return { positions, speeds };
  }, []);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions.slice(), 3));
    return g;
  }, [positions]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const attr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < RAIN_COUNT; i++) {
      arr[i * 3 + 1] -= speeds[i];
      if (arr[i * 3 + 1] < -5) {
        arr[i * 3 + 1] = 55;
        arr[i * 3] = (Math.random() - 0.5) * 40;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 40;
      }
    }
    attr.needsUpdate = true;
  });

  // Tall thin sprite for rain streaks
  const mat = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 2;
    canvas.height = 16;
    const ctx2d = canvas.getContext("2d")!;
    const grad = ctx2d.createLinearGradient(0, 0, 0, 16);
    grad.addColorStop(0, "rgba(0,255,255,0)");
    grad.addColorStop(0.3, "rgba(0,255,255,0.8)");
    grad.addColorStop(1, "rgba(0,220,255,0)");
    ctx2d.fillStyle = grad;
    ctx2d.fillRect(0, 0, 2, 16);
    const tex = new THREE.CanvasTexture(canvas);
    return new THREE.PointsMaterial({
      map: tex,
      color: "#00ffff",
      size: 0.6,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  return <points ref={pointsRef} geometry={geo} material={mat} />;
}
