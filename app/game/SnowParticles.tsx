"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SNOW_COUNT = 800;

export default function SnowParticles() {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate snowflake texture (6-pointed star)
  const snowflakeTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;

    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";

    const centerX = 32;
    const centerY = 32;
    const radius = 24;

    // Draw 6 spokes
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(angle) * radius,
        centerY + Math.sin(angle) * radius
      );
      ctx.stroke();

      // Add cross bars for detail
      ctx.beginPath();
      ctx.moveTo(
        centerX + Math.cos(angle) * (radius * 0.6),
        centerY + Math.sin(angle) * (radius * 0.6)
      );
      const angleOffset = Math.PI / 10;
      ctx.lineTo(
        centerX + Math.cos(angle + angleOffset) * (radius * 0.4),
        centerY + Math.sin(angle + angleOffset) * (radius * 0.4)
      );
      ctx.moveTo(
        centerX + Math.cos(angle) * (radius * 0.6),
        centerY + Math.sin(angle) * (radius * 0.6)
      );
      ctx.lineTo(
        centerX + Math.cos(angle - angleOffset) * (radius * 0.4),
        centerY + Math.sin(angle - angleOffset) * (radius * 0.4)
      );
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  const { positions, speeds, offsets, rotations } = useMemo(() => {
    const positions = new Float32Array(SNOW_COUNT * 3);
    const speeds = new Float32Array(SNOW_COUNT);
    const offsets = new Float32Array(SNOW_COUNT);
    const rotations = new Float32Array(SNOW_COUNT);

    for (let i = 0; i < SNOW_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = Math.random() * 40 - 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
      speeds[i] = 0.02 + Math.random() * 0.03;
      offsets[i] = Math.random() * Math.PI * 2;
      rotations[i] = Math.random() * Math.PI * 2;
    }
    return { positions, speeds, offsets, rotations };
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const attr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const t = clock.getElapsedTime();

    for (let i = 0; i < SNOW_COUNT; i++) {
      arr[i * 3 + 1] -= speeds[i];
      // Side drift
      arr[i * 3] += Math.sin(t * 0.3 + offsets[i]) * 0.01;

      if (arr[i * 3 + 1] < -5) {
        arr[i * 3 + 1] = 35;
      }
    }
    attr.needsUpdate = true;

    // Rotate the entire points container slowly
    pointsRef.current.rotation.y += 0.0005;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        map={snowflakeTexture}
        transparent
        opacity={0.7}
        color="#e6f7ff"
        size={0.25}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
