/**
 * @module src/modules/ui/ui-theme.js
 *
 * @description
 * Light/dark theme switching. The current theme lives on <html> as
 * `data-theme` and is persisted in localStorage under "capiche-theme".
 * Each HTML page ships a tiny inline script in <head> that restores the
 * stored theme before first paint, so the UI never flashes between themes.
 */

const STORAGE_KEY = "capiche-theme";

/**
 * Reads the persisted theme, defaulting to dark.
 * @returns {"dark" | "light"}
 */
const getStoredTheme = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) || "dark";
  } catch {
    return "dark";
  }
};

/**
 * Applies a theme to the document root and persists the choice.
 * @param {"dark" | "light"} theme
 */
export const applyTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage unavailable (private mode, etc.) — theme still applies.
  }
};

/**
 * Flips between light and dark.
 */
export const toggleTheme = () => {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  applyTheme(current === "light" ? "dark" : "light");
};

/**
 * Applies the persisted theme and wires up a #themeToggle button if present.
 */
export const initTheme = () => {
  applyTheme(getStoredTheme());

  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;

  const syncPressed = () => {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    toggle.setAttribute("aria-pressed", String(isLight));
    toggle.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
  };

  syncPressed();
  toggle.addEventListener("click", () => {
    toggleTheme();
    syncPressed();
  });
};