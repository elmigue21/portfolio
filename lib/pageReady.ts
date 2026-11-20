"use client";

import { useSyncExternalStore } from "react";

// "The splash screen has gone": set once per page load by SplashScreen, read
// by entrance animations so they play in view rather than behind the splash.

let ready = false;
const listeners = new Set<() => void>();

export function markPageReady() {
  if (ready) return;
  ready = true;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function usePageReady(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => ready,
    () => false
  );
}
