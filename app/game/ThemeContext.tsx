"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

export type ThemeId = "classic" | "neon" | "pastel" | "jelly";

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
  isDark: boolean;
  /** Block material — roughness & metalness for non-jelly themes */
  materialRoughness: number;
  materialMetalness: number;
  /** If true, use clearcoat physical material for a jelly/candy look */
  useClearcoat: boolean;
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
    isDark: true,
    materialRoughness: 0.3,
    materialMetalness: 0.18,
    useClearcoat: false,
    bgMusic: "/sounds/classic.mp3",
  },
  neon: {
    id: "neon",
    name: "Neon",
    emoji: "⚡",
    bgGradient: "linear-gradient(160deg, #1a0033 0%, #000010 100%)",
    blockColor: (hue) => `hsl(${hue}, 100%, 63%)`,
    ambientColor: "#4400cc",
    ambientIntensity: 0.4,
    dirLightColor: "#ff00cc",
    dirLightIntensity: 0.9,
    rimColor: "#00ffff",
    rimIntensity: 0.15,
    fogColor: "#0d0020",
    fogNear: 15,
    fogFar: 60,
    bloomIntensity: 2.2,
    bloomThreshold: 0.12,
    titleGradient: "linear-gradient(135deg, #00ffff, #ff00ff, #ffff00)",
    scoreColor: "#00ffff",
    overlayBg: "rgba(10,0,30,0.65)",
    buttonBg: "linear-gradient(135deg, #00ffff, #ff00ff)",
    buttonText: "#000",
    textColor: "#00ffff",
    subtleTextColor: "rgba(0,255,255,0.5)",
    isDark: true,
    materialRoughness: 0.12,
    materialMetalness: 0.2,
    useClearcoat: false,
    bgMusic: "/sounds/neon.mp3",
  },
  pastel: {
    id: "pastel",
    name: "Pastel",
    emoji: "🌸",
    bgGradient: "linear-gradient(160deg, #f0e6ff 0%, #e6f0ff 100%)",
    blockColor: (hue) => `hsl(${hue}, 45%, 76%)`,
    ambientColor: "#fff5e6",
    ambientIntensity: 1.0,
    dirLightColor: "#fffacd",
    dirLightIntensity: 0.7,
    rimColor: "#ffb3d9",
    rimIntensity: 0.5,
    fogColor: "#e6f0ff",
    fogNear: 20,
    fogFar: 80,
    bloomIntensity: 0.05,
    bloomThreshold: 0.9,
    titleGradient: "linear-gradient(135deg, #f472b6, #c084fc, #67e8f9)",
    scoreColor: "#6b21a8",
    overlayBg: "rgba(240,230,255,0.78)",
    buttonBg: "linear-gradient(135deg, #f472b6, #818cf8)",
    buttonText: "#fff",
    textColor: "#4c1d95",
    subtleTextColor: "rgba(76,29,149,0.5)",
    isDark: false,
    materialRoughness: 0.42,
    materialMetalness: 0.08,
    useClearcoat: false,
    bgMusic: "/sounds/ice.mp3",
  },
  jelly: {
    id: "jelly",
    name: "Jelly",
    emoji: "🍬",
    bgGradient:
      "linear-gradient(135deg, #ffe0f0 0%, #ffd6fa 25%, #d6e8ff 60%, #d6ffe8 100%)",
    blockColor: (hue) => `hsl(${hue}, 90%, 67%)`,
    ambientColor: "#fff0fa",
    ambientIntensity: 1.4,
    dirLightColor: "#fff8ff",
    dirLightIntensity: 1.0,
    rimColor: "#ff80cc",
    rimIntensity: 0.12,
    fogColor: "#f0e8ff",
    fogNear: 30,
    fogFar: 100,
    bloomIntensity: 0.5,
    bloomThreshold: 0.35,
    titleGradient: "linear-gradient(135deg, #ff6b9d, #c084fc, #38bdf8)",
    scoreColor: "#7c3aed",
    overlayBg: "rgba(255,240,252,0.82)",
    buttonBg: "linear-gradient(135deg, #ff6b9d, #c084fc)",
    buttonText: "#fff",
    textColor: "#5b21b6",
    subtleTextColor: "rgba(91,33,182,0.45)",
    isDark: false,
    materialRoughness: 0.02,
    materialMetalness: 0.0,
    useClearcoat: true,
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
    document.documentElement.style.setProperty(
      "--game-bg",
      THEMES[themeId].bgGradient
    );
    document.documentElement.style.setProperty(
      "--score-color",
      THEMES[themeId].scoreColor
    );
    document.documentElement.style.setProperty(
      "--text-color",
      THEMES[themeId].textColor
    );
    document.documentElement.style.setProperty(
      "--subtle-text",
      THEMES[themeId].subtleTextColor
    );
    document.documentElement.style.setProperty(
      "--overlay-bg",
      THEMES[themeId].overlayBg
    );
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
