"use client";

import { useEffect, useState } from "react";
import { markPageReady } from "@/lib/pageReady";
import OrbitMark from "@/components/OrbitMark";

// Shown from the very first HTML (before any JavaScript) so a slow connection
// sees the Orbit M instead of a half-built page. It fades out once the code,
// fonts and hero photo are ready. If JavaScript never arrives, the CSS below
// fades it out on its own after a few seconds, so it can't trap anyone.

const FADE_MS = 450;
const MAX_WAIT_MS = 6000;
const HERO_PHOTO = "/images/square.jpg";

// One is picked at random on each visit.
const LINES = [
  "npm install personality... done",
  "compiling charm.ts",
  "git pull origin miguel",
  "resolving merge conflicts with reality",
  "centering the div...",
  "clearing node_modules (this may take a lifetime)",
  "warming up coffee.exe",
];
const LINE_ID = "splash-line";
// Runs inline as the HTML is parsed, before React loads, so even the first
// frame shows a random line. React leaves the swapped text alone.
const PICK_LINE_SCRIPT = `(function(){var l=${JSON.stringify(LINES)};var e=document.getElementById(${JSON.stringify(
  LINE_ID
)});if(e)e.textContent=l[Math.floor(Math.random()*l.length)];})();`;

export default function SplashScreen() {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let finished = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const finish = () => {
      if (finished) return;
      finished = true;
      setLeaving(true);
      markPageReady();
      timers.push(setTimeout(() => setGone(true), FADE_MS));
    };

    const photo = new window.Image();
    photo.src = HERO_PHOTO;
    const photoReady = photo.decode().catch(() => undefined);
    const fontsReady = document.fonts?.ready.catch(() => undefined) ?? Promise.resolve();
    Promise.all([photoReady, fontsReady]).then(finish);
    timers.push(setTimeout(finish, MAX_WAIT_MS));

    return () => timers.forEach(clearTimeout);
  }, []);

  if (gone) return null;

  return (
    <div
      role="status"
      aria-label="Loading Miguel John Caacbay's portfolio"
      className={`splash fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6 bg-(--page) transition-opacity ease-out ${
        leaving ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      {/* Inline so it works before any stylesheet or script has loaded:
          if JavaScript never arrives, this fades the splash out on its own. */}
      <style>{`
        @keyframes splash-failsafe { to { opacity: 0; visibility: hidden; } }
        .splash { animation: splash-failsafe 0.4s ease-out ${MAX_WAIT_MS + 1500}ms forwards; }
      `}</style>
      <OrbitMark line={LINES[0]} lineId={LINE_ID} />
      <script dangerouslySetInnerHTML={{ __html: PICK_LINE_SCRIPT }} />
    </div>
  );
}
