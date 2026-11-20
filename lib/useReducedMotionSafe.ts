"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

// framer's useReducedMotion is null on the server but true/false on the first
// browser render, so components that branch on it render differently on each
// side and React 19 throws a hydration error. This returns false (full motion)
// for the first render, matching the server, then the real preference.
export function useReducedMotionSafe(): boolean {
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? !!prefersReduced : false;
}
