import { useSyncExternalStore } from "react";

/**
 * useThemeColors — Returns resolved CSS custom property values for D3 charts.
 * Reacts to data-theme attribute changes on <html> via MutationObserver.
 */

function getSnapshot() {
  return document.documentElement.getAttribute("data-theme") || "dark";
}

function subscribe(callback) {
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.attributeName === "data-theme") {
        callback();
        break;
      }
    }
  });
  observer.observe(document.documentElement, { attributes: true });
  return () => observer.disconnect();
}

export function useThemeColors() {
  const theme = useSyncExternalStore(subscribe, getSnapshot);

  const style = getComputedStyle(document.documentElement);
  const get = (prop) => style.getPropertyValue(prop).trim();

  return {
    theme,
    textPrimary: get("--text-primary"),
    textSecondary: get("--text-secondary"),
    textMuted: get("--text-muted"),
    borderSubtle: get("--border-subtle"),
    surfaceBase: get("--surface-base"),
  };
}
