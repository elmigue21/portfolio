// The Orbit M with a spinning dot, a terminal line and a loading bar. Used by the
// splash screen and the section-jump transition. Its animations are defined
// inline so they also work before the main stylesheet has loaded.

export const ORBIT_MARK_STYLES = `
  @keyframes splash-orbit { to { transform: rotate(360deg); } }
  @keyframes splash-blink { 50% { opacity: 0; } }
  @keyframes splash-bar { from { transform: translateX(-100%); } to { transform: translateX(250%); } }
  .splash-orbit { transform-origin: 32px 32px; animation: splash-orbit 1.6s linear infinite; }
  .splash-cursor { animation: splash-blink 1s steps(1) infinite; }
  .splash-bar { animation: splash-bar 1.4s ease-in-out infinite; }
  @media (prefers-reduced-motion: reduce) {
    .splash-orbit, .splash-cursor, .splash-bar { animation: none; }
  }
`;

export default function OrbitMark({
  line,
  lineId,
}: {
  line: string;
  // Lets the splash screen swap the line in before React loads.
  lineId?: string;
}) {
  return (
    <>
      <style>{ORBIT_MARK_STYLES}</style>
      <svg width="112" height="112" viewBox="0 0 64 64" aria-hidden>
        <circle cx="32" cy="32" r="30" fill="#0a1433" />
        <circle cx="32" cy="32" r="23" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
        <g className="splash-orbit">
          <circle cx="48.3" cy="15.7" r="5" fill="#38bdf8" />
        </g>
        <polyline
          points="22,41 22,24 32,34 42,24 42,41"
          fill="none"
          stroke="#ffffff"
          strokeWidth="5.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>

      <p className="font-mono text-sm text-sky-400 px-6 text-center">
        &gt;{" "}
        <span id={lineId} suppressHydrationWarning>
          {line}
        </span>
        <span className="splash-cursor">_</span>
      </p>

      <div className="w-40 h-0.5 rounded bg-sky-400/15 overflow-hidden" aria-hidden>
        <div className="splash-bar w-2/5 h-full bg-sky-400" />
      </div>
    </>
  );
}
