// Pure helpers for the 3D projects ring (no React, no three.js).

export function activeIndexFromProgress(progress: number, count: number): number {
  if (count <= 1) return 0;
  const p = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0;
  return Math.round(p * (count - 1));
}

// Index 0 sits at the front of the ring (toward the camera, +z).
export function ringPosition(index: number, count: number, radius: number): [number, number, number] {
  const angle = (index * Math.PI * 2) / Math.max(1, count);
  return [Math.sin(angle) * radius, 0, Math.cos(angle) * radius];
}

// Ring rotation that brings a (possibly fractional) index to the front.
export function ringRotationFor(index: number, count: number): number {
  if (count <= 1) return 0;
  return (-index * Math.PI * 2) / count;
}

export function formatCounter(index: number, count: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(index + 1)} / ${pad(count)}`;
}

export function projectBullets(project: { descriptions?: string[] }): string[] {
  return (project.descriptions ?? []).filter((d) => d && d.trim());
}

export type SnippetPlacement = {
  position: [number, number, number];
  scale: number;
  opacity: number;
  speed: number;
};

// Small deterministic PRNG so the snippet layout is the same on every visit.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Scatter snippets on a shell around the ring; farther ones are smaller and fainter.
export function layoutSnippets(
  count: number,
  seed: number,
  { minRadius = 5, maxRadius = 11 }: { minRadius?: number; maxRadius?: number } = {}
): SnippetPlacement[] {
  const rand = mulberry32(seed);
  const raw = Array.from({ length: count }, () => {
    // Only the back and sides of the shell, never between the camera and the ring.
    const theta = Math.PI * (0.4 + rand() * 1.2);
    const r = minRadius + rand() * (maxRadius - minRadius);
    const y = (rand() * 2 - 1) * 3.5;
    return {
      position: [Math.sin(theta) * r, y, Math.cos(theta) * r] as [number, number, number],
      speed: 0.02 + rand() * 0.04,
    };
  });
  const zs = raw.map((p) => p.position[2]);
  const zMin = Math.min(...zs);
  const zMax = Math.max(...zs);
  return raw.map((p) => {
    const nearness = zMax === zMin ? 1 : (p.position[2] - zMin) / (zMax - zMin);
    return {
      ...p,
      opacity: 0.15 + nearness * 0.45,
      scale: 0.18 + nearness * 0.17,
    };
  });
}
