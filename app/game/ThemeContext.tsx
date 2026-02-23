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
    bgGradient: "linear-gradient(180deg, #E6E6FA 0%, #E0FFE0 50%, #FFE4E1 100%)",
    blockColor: (hue: number) => {
      const jellyPalette = [
        "#FFB6C1", // Strawberry
        "#FFDAB9", // Orange
        "#FFFACD", // Lemon
        "#E0FFE0", // Lime
        "#B0E0E6", // Blueberry
        "#E6E6FA", // Grape
        "#FFDAB9", // Peach
        "#FFB6D9", // Bubblegum pink
      ];
      return jellyPalette[Math.round(hue / 25) % jellyPalette.length];
    },
    ambientColor: "#FFE4E6",
    ambientIntensity: 0.6,
    dirLightColor: "#FFF5E6",
    dirLightIntensity: 1.8,
    rimColor: "#FFB6D9",
    rimIntensity: 0.8,
    fogColor: "#FFF0F5",
    fogNear: 15,
    fogFar: 80,
    bloomIntensity: 0.5,
    bloomThreshold: 0.2,
    titleGradient: "linear-gradient(135deg, #FFB6C1, #E6E6FA, #B0E0E6)",
    scoreColor: "#FF3D9A",
    overlayBg: "rgba(255, 240, 245, 0.85)",
    buttonBg: "linear-gradient(135deg, #FFB6D9, #FFB6C1)",
    buttonText: "#86198f",
    textColor: "#86198f",
    subtleTextColor: "rgba(134, 25, 143, 0.5)",
    uiItemBg: "rgba(134, 25, 143, 0.08)",
    uiItemBorder: "rgba(134, 25, 143, 0.15)",
    uiItemText: "rgba(134, 25, 143, 0.7)",
    uiItemActiveText: "#86198f",
    isDark: false,
    materialRoughness: 0.05,
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
