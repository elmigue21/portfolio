"use client";

// Jumps to another part of the page behind a short Orbit M loading screen,
// instead of a long fast scroll through every section in between.
// <TransitionOverlay /> (mounted once in the layout) plays the animation.

export type Transition = { label: string; jump: () => void };

let host: ((t: Transition) => void) | null = null;

export function registerTransitionHost(play: (t: Transition) => void) {
  host = play;
  return () => {
    if (host === play) host = null;
  };
}

// `label` is the terminal-style line shown, e.g. "cd ./projects".
export function playTransition(label: string, jump: () => void) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!host || reduceMotion) {
    jump();
    return;
  }
  host({ label, jump });
}
