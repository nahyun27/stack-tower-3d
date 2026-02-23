"use client";

import { useTheme, ThemeId, THEMES } from "./ThemeContext";

const THEME_ORDER: ThemeId[] = ["classic", "neon", "pastel", "jelly"];

/**
 * Small floating panel (top-left) with 4 theme buttons.
 * Active theme is highlighted; others dim.
 */
export default function ThemeSwitcher() {
  const { themeId, setTheme } = useTheme();

  return (
    <div className="theme-switcher">
      {THEME_ORDER.map((id) => {
        const t = THEMES[id];
        const isActive = id === themeId;
        return (
          <button
            key={id}
            className={`theme-btn ${isActive ? "active" : ""}`}
            onClick={() => setTheme(id)}
            title={t.name}
            aria-label={`Switch to ${t.name} theme`}
          >
            <span className="theme-emoji">{t.emoji}</span>
            <span className="theme-name">{t.name}</span>
          </button>
        );
      })}
    </div>
  );
}
