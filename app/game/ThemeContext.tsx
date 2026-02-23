"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

export type ThemeId = "classic" | "neon" | "ice" | "jelly";

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  emoji: string;
  bgGradient: string;
  /** Compute block color from hue (0-360) */
  blockColor: (hue: number) => string;
  ambientColor: string;
  ambientIntensity: number;
  dirLightColor: string;
  dirLightIntensity: number;
  rimColor: string;
  rimIntensity: number;
  fogColor: string;
  fogNear: number;
  fogFar: number;
  bloomIntensity: number;
  bloomThreshold: number;
  /** CSS gradients / colors for UI elements */
  titleGradient: string;
  scoreColor: string;
  overlayBg: string;
  buttonBg: string;
  buttonText: string;
  textColor: string;
  subtleTextColor: string;
  uiItemBg: string;
  uiItemBorder: string;
  uiItemText: string;
  uiItemActiveText: string;
  isDark: boolean;
  /** Block material — roughness & metalness for standard themes */
  materialRoughness: number;
  materialMetalness: number;
  /** If true, use clearcoat physical material for a jelly/candy look */
  useClearcoat: boolean;
  /** If true, use transmission/glass material for ice crystal look */
  useTransmission: boolean;
  /** If true, use jelly-specific bouncier spring config */
  useJelly: boolean;
  /** If true, use glass-with-neon-edges material (neon city theme) */
  useNeonGlass: boolean;
  /** If true, use transparent ice crystal material (ice theme) */
  useIceCrystal: boolean;
  /** Path to background music track */
  bgMusic: string;
}

// ─── Theme definitions ──────────────────────────────────────────────────────

export const THEMES: Record<ThemeId, ThemeConfig> = {
  classic: {
    id: "classic",
    name: "Classic",
    emoji: "🌌",
    bgGradient: "linear-gradient(160deg, #0a0a0f 0%, #000000 100%)",
    blockColor: (hue) => `hsl(${hue}, 75%, 58%)`,
    ambientColor: "#ffffff",
    ambientIntensity: 0.5,
    dirLightColor: "#ffffff",
    dirLightIntensity: 1.2,
    rimColor: "#4488ff",
    rimIntensity: 0.35,
    fogColor: "#0a0a0f",
    fogNear: 20,
    fogFar: 80,
    bloomIntensity: 0.6,
    bloomThreshold: 0.4,
    titleGradient: "linear-gradient(135deg, #64b3ff, #c084fc, #f472b6)",
    scoreColor: "#ffffff",
    overlayBg: "rgba(0,0,0,0.48)",
    buttonBg: "linear-gradient(135deg, #64b3ff, #c084fc)",
    buttonText: "#000",
    textColor: "#fff",
    subtleTextColor: "rgba(255,255,255,0.45)",
    uiItemBg: "rgba(255, 255, 255, 0.08)",
    uiItemBorder: "rgba(255, 255, 255, 0.12)",
    uiItemText: "rgba(255, 255, 255, 0.55)",
    uiItemActiveText: "#fff",
    isDark: true,
    materialRoughness: 0.3,
    materialMetalness: 0.18,
    useClearcoat: false,
    useTransmission: false,
    useJelly: false,
    useNeonGlass: false,
    useIceCrystal: false,
    bgMusic: "/sounds/classic.mp3",
  },
  neon: {
    id: "neon",
    name: "Neon",
    emoji: "⚡",
    bgGradient: "linear-gradient(160deg, #1a0033 0%, #000010 100%)",
    blockColor: (hue: number) => {
      // Cyberpunk palette: hot pink, cyan, neon yellow, electric purple
      // Use hue/25 as index so each block drop (+25) gives a new color
      const neonPalette = [
        "#FF10F0", // hot pink
        "#00FFFF", // cyan
        "#FFFF00", // neon yellow
        "#BF00FF", // electric purple
        "#FF10F0",
        "#00FFFF",
        "#FFFF00",
        "#BF00FF",
      ];
      const idx = Math.round(hue / 25) % neonPalette.length;
      return neonPalette[idx];
    },
    ambientColor: "#200040",
    ambientIntensity: 0.3,
    dirLightColor: "#ff10f0",
    dirLightIntensity: 0.7,
    rimColor: "#00ffff",
    rimIntensity: 0.15,
    fogColor: "#070010",
    fogNear: 18,
    fogFar: 65,
    bloomIntensity: 2.8,
    bloomThreshold: 0.08,
    titleGradient: "linear-gradient(135deg, #FF10F0, #00FFFF, #FFFF00)",
    scoreColor: "#00ffff",
    overlayBg: "rgba(5,0,20,0.75)",
    buttonBg: "linear-gradient(135deg, #FF10F0, #BF00FF)",
    buttonText: "#fff",
    textColor: "#00ffff",
    subtleTextColor: "rgba(0,255,255,0.5)",
    uiItemBg: "rgba(0, 255, 255, 0.06)",
    uiItemBorder: "rgba(0, 255, 255, 0.15)",
    uiItemText: "rgba(0, 255, 255, 0.6)",
    uiItemActiveText: "#00ffff",
    isDark: true,
    materialRoughness: 0.05,
    materialMetalness: 0.1,
    useClearcoat: false,
    useTransmission: false,
    useJelly: false,
    useNeonGlass: true,
    useIceCrystal: false,
    bgMusic: "/sounds/neon_city.mp3",
  },
  ice: {
    id: "ice",
    name: "Ice",
    emoji: "🧊",
    bgGradient: "linear-gradient(180deg, #e6f7ff 0%, #b3e0ff 50%, #80d4ff 100%)",
    blockColor: (hue: number) => {
      const icePalette = [
        "#B0E0E6", // Ice blue
        "#7FDBFF", // Crystal cyan
        "#F0F8FF", // Frozen white
        "#CCCCFF", // Arctic purple
        "#4DA6FF", // Glacier blue
        "#E0F2FF", // Diamond clear
      ];
      return icePalette[Math.round(hue / 25) % icePalette.length];
    },
    ambientColor: "#b3e0ff",
    ambientIntensity: 0.5,
    dirLightColor: "#e6f7ff",
    dirLightIntensity: 2.0,
    rimColor: "#70c8ff", // Kept from original, not in diff
    rimIntensity: 0.35, // Kept from original, not in diff
    fogColor: "#f0f8ff",
    fogNear: 5,
    fogFar: 50,
    bloomIntensity: 0.8,
    bloomThreshold: 0.3,
    titleGradient: "linear-gradient(135deg, #7FDBFF, #B0E0E6, #E0F2FF)",
    scoreColor: "#4DA6FF",
    overlayBg: "rgba(230, 247, 255, 0.8)",
    buttonBg: "linear-gradient(135deg, #7FDBFF, #4DA6FF)",
    buttonText: "#fff",
    textColor: "#005580",
    subtleTextColor: "rgba(0, 85, 128, 0.5)",
    uiItemBg: "rgba(0, 85, 128, 0.08)",
    uiItemBorder: "rgba(0, 85, 128, 0.15)",
    uiItemText: "rgba(0, 85, 128, 0.65)",
    uiItemActiveText: "#005580",
    isDark: false,
    materialRoughness: 0.1,
    materialMetalness: 0.3,
    useClearcoat: false,
    useTransmission: true,
    useJelly: false,
    useNeonGlass: false,
    useIceCrystal: true,
    bgMusic: "/sounds/winter_theme.mp3",
  },
  jelly: {
    id: "jelly",
    name: "Jelly",
    emoji: "🍬",
    bgGradient:
      "linear-gradient(160deg, #fff0f7 0%, #ffe4f7 20%, #f8e0ff 45%, #e0f0ff 75%, #e0fff4 100%)",
    blockColor: (hue: number) => {
      // Saturated candy colors — strawberry, grape, blueberry, mint, peach, lemon
      // Use hue/25 as index so each block drop (+25) gives a different candy color
      const candyPalette = [
        "hsl(350, 98%, 60%)", // strawberry red
        "hsl(15, 98%, 60%)",  // peach orange
        "hsl(45, 98%, 58%)",  // lemon yellow
        "hsl(160, 90%, 48%)", // mint green
        "hsl(200, 95%, 60%)", // blueberry blue
        "hsl(270, 95%, 62%)", // grape purple
        "hsl(320, 98%, 60%)", // bubblegum pink
        "hsl(0, 92%, 60%)",   // cherry red
      ];
      const idx = Math.round(hue / 25) % candyPalette.length;
      return candyPalette[idx];
    },
    ambientColor: "#ffddee",
    ambientIntensity: 2.2,
    dirLightColor: "#fff2ff",
    dirLightIntensity: 1.3,
    rimColor: "#ff55bb",
    rimIntensity: 0.06,
    fogColor: "#f5e8ff",
    fogNear: 30,
    fogFar: 100,
    bloomIntensity: 0.9,
    bloomThreshold: 0.22,
    titleGradient: "linear-gradient(135deg, #ff3d9a, #e040fb, #00bfff)",
    scoreColor: "#c026d3",
    overlayBg: "rgba(255,230,255,0.88)",
    buttonBg: "linear-gradient(135deg, #ff3d9a, #e040fb)",
    buttonText: "#fff",
    textColor: "#86198f",
    subtleTextColor: "rgba(134,25,143,0.45)",
    uiItemBg: "rgba(134, 25, 143, 0.06)",
    uiItemBorder: "rgba(134, 25, 143, 0.15)",
    uiItemText: "rgba(134, 25, 143, 0.6)",
    uiItemActiveText: "#86198f",
    isDark: false,
    materialRoughness: 0.0,
    materialMetalness: 0.0,
    useClearcoat: true,
    useTransmission: false,
    useJelly: true,
    useNeonGlass: false,
    useIceCrystal: false,
    bgMusic: "/sounds/jelly_theme.mp3",
  },
};

// ─── Context ────────────────────────────────────────────────────────────────

interface ThemeContextValue {
  theme: ThemeConfig;
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: THEMES.classic,
  themeId: "classic",
  setTheme: () => { },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>("classic");

  // Restore saved theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("stack-tower-theme") as ThemeId;
    if (saved && THEMES[saved]) setThemeId(saved);
  }, []);

  // Persist theme choice and apply CSS variable for background
  useEffect(() => {
    const t = THEMES[themeId];
    document.documentElement.style.setProperty("--game-bg", t.bgGradient);
    document.documentElement.style.setProperty("--score-color", t.scoreColor);
    document.documentElement.style.setProperty("--text-color", t.textColor);
    document.documentElement.style.setProperty("--subtle-text", t.subtleTextColor);
    document.documentElement.style.setProperty("--overlay-bg", t.overlayBg);
    document.documentElement.style.setProperty("--btn-bg", t.buttonBg);
    document.documentElement.style.setProperty("--btn-text", t.buttonText);
    document.documentElement.style.setProperty("--title-gradient", t.titleGradient);
    document.documentElement.style.setProperty("--ui-item-bg", t.uiItemBg);
    document.documentElement.style.setProperty("--ui-item-border", t.uiItemBorder);
    document.documentElement.style.setProperty("--ui-item-text", t.uiItemText);
    document.documentElement.style.setProperty("--ui-item-active-text", t.uiItemActiveText);
  }, [themeId]);

  const setTheme = useCallback((id: ThemeId) => {
    setThemeId(id);
    localStorage.setItem("stack-tower-theme", id);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: THEMES[themeId], themeId, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
