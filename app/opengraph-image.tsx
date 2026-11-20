import { ImageResponse } from "next/og";
import { PERSON_NAME } from "@/lib/site";

// Preview card shown when the site is shared (LinkedIn, Facebook, Messenger, X)
// and used as the person image in search results.
export const alt = `${PERSON_NAME} — Junior Developer portfolio`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 90px",
          background: "radial-gradient(circle at 78% 50%, #0c2a5e 0%, #070b1f 60%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 700 }}>
          <div style={{ fontSize: 30, color: "#38bdf8", fontFamily: "monospace" }}>&gt; whoami</div>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05, marginTop: 18 }}>
            Miguel John Caacbay
          </div>
          <div style={{ fontSize: 40, color: "#38bdf8", fontWeight: 700, marginTop: 22 }}>
            Junior Developer @ Hirolabz
          </div>
          <div style={{ fontSize: 28, color: "#bae6fd", marginTop: 26, opacity: 0.85 }}>
            Full stack and mobile · Computer Science, Adamson University · Philippines
          </div>
        </div>
        {/* Orbit M mark (same as the favicon) */}
        <svg width="300" height="300" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="30" fill="#0a1433" />
          <circle cx="32" cy="32" r="23" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
          <circle cx="48.3" cy="15.7" r="5" fill="#38bdf8" />
          <polyline
            points="22,41 22,24 32,34 42,24 42,41"
            fill="none"
            stroke="#ffffff"
            strokeWidth="5.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    size
  );
}
