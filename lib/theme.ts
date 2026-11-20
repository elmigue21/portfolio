"use client";

import { useEffect, useState } from "react";

// Light/dark theme. Dark is the default for everyone; the site only turns light
// when the visitor picks it with the toggle. The choice lives as a "light"
// class on <html> and in localStorage.

export type Theme = "light" | "dark";
const STORAGE_KEY = "theme";

// Runs in <head> before the page paints, so there's no flash of the wrong theme.
export const THEME_INIT_SCRIPT = `(function(){try{if(localStorage.getItem("${STORAGE_KEY}")==="light")document.documentElement.classList.add("light");}catch(e){}})();`;

const current = (): Theme =>
  document.documentElement.classList.contains("light") ? "light" : "dark";

export function useTheme() {
  // "dark" on the server and first render; corrected right after mount.
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(current());
    const observer = new MutationObserver(() => setTheme(current()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const next: Theme = current() === "light" ? "dark" : "light";
    document.documentElement.classList.toggle("light", next === "light");
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode etc.: the theme still switches, it just isn't remembered.
    }
  };

  return { theme, toggle };
}
