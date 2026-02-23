"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SPARK_COUNT = 60;

export default function ElectricSparks() {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, velocities, lives, maxLives } = useMemo(() => {
    const positions = new Float32Array(SPARK_COUNT * 3);
    const velocities = new Float32Array(SPARK_COUNT * 3);
    const lives = new Float32Array(SPARK_COUNT);
    const maxLives = new Float32Array(SPARK_COUNT);
    for (let i = 0; i < SPARK_COUNT; i++) {
      lives[i] = 0; // start all dead
      maxLives[i] = 20 + Math.random() * 40;
    }
    return { positions, velocities, lives, maxLives };
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

    for (let i = 0; i < SPARK_COUNT; i++) {
      if (lives[i] <= 0) {
        // Random chance to spawn near the tower area
        if (Math.random() < 0.03) {
          arr[i * 3] = (Math.random() - 0.5) * 6;
          arr[i * 3 + 1] = Math.random() * 20 + 1;
          arr[i * 3 + 2] = (Math.random() - 0.5) * 6;
          velocities[i * 3] = (Math.random() - 0.5) * 0.08;
          velocities[i * 3 + 1] = (Math.random() * 0.12);
          velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.08;
          lives[i] = maxLives[i];
        }
      } else {
        arr[i * 3] += velocities[i * 3];
        arr[i * 3 + 1] += velocities[i * 3 + 1];
        arr[i * 3 + 2] += velocities[i * 3 + 2];
        velocities[i * 3 + 1] -= 0.004; // gravity
        lives[i]--;
      }
    }
    attr.needsUpdate = true;
  });

  // Electric spark colors — alternate cyan/pink/yellow
  const colors = useMemo(() => {
    const neonColors = ["#00ffff", "#ff10f0", "#ffff00", "#bf00ff", "#00ffff"];
    const c = new Float32Array(SPARK_COUNT * 3);
    for (let i = 0; i < SPARK_COUNT; i++) {
      const col = new THREE.Color(neonColors[i % neonColors.length]);
      c[i * 3] = col.r;
      c[i * 3 + 1] = col.g;
      c[i * 3 + 2] = col.b;
    }
    return c;
  }, []);

  const mat = useMemo(
    () =>
      new THREE.PointsMaterial({
        vertexColors: true,
        size: 0.18,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  const geoWithColors = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions.slice(), 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors.slice(), 3));
    return g;
  }, [positions, colors]);

  return <points ref={pointsRef} geometry={geoWithColors} material={mat} />;
}
