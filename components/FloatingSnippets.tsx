"use client";

import { useEffect, useRef, useState } from "react";
import { aboutSnippets } from "@/constants/constants";

export type SnippetSpot = {
  top: string;
  left: string;
  // Hide this one on phones to keep small screens uncluttered.
  desktopOnly?: boolean;
  // Smaller and fainter, so it reads as farther back.
  dim?: boolean;
};

// Scattered "about me" code fragments that drift slowly in the background.
// The drift is a CSS animation (see .animate-drift in globals.css), paused
// while the snippets are off screen.
export default function FloatingSnippets({
  spots,
  className = "text-sky-300/20",
}: {
  spots: SnippetSpot[];
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {spots.map((spot, i) => (
        <pre
          key={i}
          className={`absolute font-mono whitespace-pre animate-drift ${className} ${
            spot.dim ? "opacity-50 text-[11px] md:text-xs" : "text-xs md:text-sm"
          } ${spot.desktopOnly ? "hidden md:block" : ""}`}
          style={{
            top: spot.top,
            left: spot.left,
            animationDuration: `${6 + i}s`,
            animationPlayState: visible ? "running" : "paused",
          }}
        >
          {aboutSnippets[i % aboutSnippets.length]}
        </pre>
      ))}
    </div>
  );
}

// True while the element is on screen.
export function useInView(ref: React.RefObject<Element | null>) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return visible;
}
