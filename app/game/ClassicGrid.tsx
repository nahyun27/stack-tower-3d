"use client";

import { Grid } from "@react-three/drei";

export default function ClassicGrid() {
  return (
    <Grid
      position={[0, -0.01, 0]}
      args={[100, 100]}
      cellSize={1}
      cellThickness={0.8}
      cellColor="#1a1a3e"
      sectionSize={5}
      sectionThickness={1.5}
      sectionColor="#1a1a3e"
      fadeDistance={40}
      fadeStrength={1}
      infiniteGrid
    />
  );
}
