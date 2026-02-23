"use client";

import { useMemo } from "react";
import * as THREE from "three";

/**
 * Neon Cyberpunk City Grid Floor 
 * Renders a glowing cyan grid plane at y=0 and distant city building silhouettes.
 */
export default function CityGrid() {
  // Grid plane
  const gridTexture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    // Dark background
    ctx.fillStyle = "#020412";
    ctx.fillRect(0, 0, size, size);

    // Neon grid lines — cyan with glow
    const cellSize = size / 8;
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 10;
    ctx.strokeStyle = "#00aacc";
    ctx.lineWidth = 1.5;

    for (let x = 0; x <= size; x += cellSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }
    for (let y = 0; y <= size; y += cellSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }

    // Accent lines — brighter every 4th cell
    ctx.shadowBlur = 20;
    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 2.5;
    for (let x = 0; x <= size; x += cellSize * 4) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }
    for (let y = 0; y <= size; y += cellSize * 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }, []);

  // City silhouette texture
  const cityTexture = useMemo(() => {
    const w = 1024;
    const h = 256;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;

    // Transparent background
    ctx.clearRect(0, 0, w, h);

    // Draw buildings as dark silhouettes with neon-lit windows
    const buildingData = [
      { x: 0, w: 60, h: 180 }, { x: 55, w: 40, h: 120 }, { x: 90, w: 80, h: 220 },
      { x: 165, w: 50, h: 150 }, { x: 210, w: 70, h: 200 }, { x: 275, w: 45, h: 130 },
      { x: 315, w: 90, h: 240 }, { x: 400, w: 55, h: 170 }, { x: 450, w: 65, h: 190 },
      { x: 510, w: 80, h: 210 }, { x: 585, w: 50, h: 145 }, { x: 630, w: 75, h: 230 },
      { x: 700, w: 60, h: 175 }, { x: 755, w: 45, h: 135 }, { x: 795, w: 85, h: 215 },
      { x: 875, w: 55, h: 160 }, { x: 925, w: 70, h: 200 }, { x: 990, w: 34, h: 120 },
    ];

    buildingData.forEach(({ x, w: bw, h: bh }) => {
      // Dark building body
      ctx.fillStyle = "#08061a";
      ctx.fillRect(x, h - bh, bw, bh);

      // Neon windows — randomly lit in cyan, pink, yellow
      const winColors = ["#00ffff", "#ff10f0", "#ffff00", "#bf00ff"];
      const winW = 5;
      const winH = 7;
      const winPadX = 8;
      const winPadY = 10;
      const cols = Math.floor((bw - winPadX * 2) / (winW + 4));
      const rows = Math.floor((bh - winPadY * 2) / (winH + 5));

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() > 0.45) {
            const wx = x + winPadX + c * (winW + 4);
            const wy = h - bh + winPadY + r * (winH + 5);
            const col = winColors[Math.floor(Math.random() * winColors.length)];
            ctx.shadowColor = col;
            ctx.shadowBlur = 6;
            ctx.fillStyle = col;
            ctx.fillRect(wx, wy, winW, winH);
          }
        }
      }
    });

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, []);

  return (
    <>
      {/* Neon grid floor plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshBasicMaterial
          map={gridTexture}
          transparent
          opacity={0.85}
          depthWrite={false}
        />
      </mesh>

      {/* City silhouettes — 4 sides far out */}
      {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((rot, i) => (
        <mesh
          key={i}
          rotation={[0, rot, 0]}
          position={[
            Math.sin(rot) * 55,
            12,
            Math.cos(rot) * 55,
          ]}
        >
          <planeGeometry args={[120, 28]} />
          <meshBasicMaterial
            map={cityTexture}
            transparent
            opacity={0.82}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  );
}
