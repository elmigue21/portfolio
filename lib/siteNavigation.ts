"use client";

import { useEffect } from "react";
import type { NavSection } from "@/lib/migu";
import { playTransition } from "@/lib/pageTransition";

// Lets Migu (the chat agent) scroll the page to a section and a specific item
// in it. Scroll-driven sections register how far into their scroll a given item
// sits (0 = section start, 1 = end); the navigator turns that into a position.

type FocusResolver = (focus?: string) => number;

const resolvers = new Map<NavSection, FocusResolver>();

export function useSectionFocus(section: NavSection, resolver: FocusResolver) {
  useEffect(() => {
    resolvers.set(section, resolver);
    return () => {
      if (resolvers.get(section) === resolver) resolvers.delete(section);
    };
  }, [section, resolver]);
}

// Index of the name that best matches focus text ("hirolabz", "the sideshop"…), or -1.
export function matchIndex(names: string[], focus?: string): number {
  if (!focus) return -1;
  const f = focus.toLowerCase().trim();
  const exact = names.findIndex((n) => n.toLowerCase() === f);
  if (exact !== -1) return exact;
  // Partial matches need a few letters, so "the" doesn't land on "The Sideshop".
  if (f.length < 4) return -1;
  return names.findIndex((n) => {
    const name = n.toLowerCase();
    return name.includes(f) || f.includes(name);
  });
}

// Jumps to a section (and item) behind the Orbit M loading screen, rather than
// scrolling through every section in between.
export function navigateTo(section: NavSection, focus?: string) {
  if (!document.getElementById(section)) return;
  playTransition(`cd ./${section}`, () => {
    const el = document.getElementById(section);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const progress = Math.min(1, Math.max(0, resolvers.get(section)?.(focus) ?? 0));
    const range = Math.max(0, el.offsetHeight - window.innerHeight);
    // "instant", not "auto": auto defers to the page's CSS scroll-behavior, which is smooth.
    window.scrollTo({ top: top + progress * range, behavior: "instant" });
  });
}

export function navigateToTop() {
  playTransition("cd ~", () => window.scrollTo({ top: 0, behavior: "instant" }));
}
