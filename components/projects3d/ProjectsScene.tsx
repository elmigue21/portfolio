"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
// Aliased: drei's Image is a 3D textured plane, not an <img>.
import { Billboard, Image as TexturePlane, Text } from "@react-three/drei";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import { aboutSnippets } from "@/constants/constants";
import { layoutSnippets, ringPosition, ringRotationFor } from "@/lib/projects3d";

export type SceneProject = { name: string; src: string };

// Scene colors per theme (the crystals stay the same blue in both).
const SCENE = {
  dark: { background: "#070b1f", snippet: "#7dd3fc", ambient: 0.55 },
  light: { background: "#eef6ff", snippet: "#0369a1", ambient: 0.9 },
} as const;
const CRYSTAL = new THREE.Color("#3b82f6");
const EMISSIVE = new THREE.Color("#1d4ed8");

export default function ProjectsScene({
  projects,
  progress,
  activeIndex,
  compact,
  inView,
  light = false,
  onReady,
}: {
  projects: SceneProject[];
  progress: MotionValue<number>;
  activeIndex: number;
  compact: boolean;
  // Only render frames while the section is on screen.
  inView: boolean;
  // Light theme colors.
  light?: boolean;
  // Called once logos and font have loaded and shaders are compiled.
  onReady?: () => void;
}) {
  const colors = light ? SCENE.light : SCENE.dark;
  return (
    <Canvas
      frameloop={inView ? "always" : "never"}
      dpr={compact ? 1 : [1, 1.5]}
      camera={{ position: [0, 1, 10.5], fov: 45 }}
      gl={{ antialias: !compact, powerPreference: "high-performance", stencil: false }}
    >
      <color attach="background" args={[colors.background]} />
      <fog attach="fog" args={[colors.background, 7, 20]} />
      <ambientLight intensity={colors.ambient} />
      <directionalLight position={[4, 6, 5]} intensity={1.4} />
      <pointLight position={[0, 0, 4]} intensity={18} color="#38bdf8" distance={12} />
      <Suspense fallback={null}>
        <Ring projects={projects} progress={progress} activeIndex={activeIndex} compact={compact} />
        <CodeSnippets compact={compact} color={colors.snippet} />
        <Warmup onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}

// Runs once everything above it has loaded: compiles the shaders now, while
// the section is still off screen, so the first visible frame doesn't stutter.
function Warmup({ onReady }: { onReady?: () => void }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    gl.compile(scene, camera);
    onReady?.();
    // Only on first load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

function Ring({
  projects,
  progress,
  activeIndex,
  compact,
}: {
  projects: SceneProject[];
  progress: MotionValue<number>;
  activeIndex: number;
  compact: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  // Seconds of entrance played so far. It only advances while frames run (on
  // screen), and unlike the 3D clock it never resets, so the entrance plays once.
  const introTime = useRef(0);
  const n = projects.length;
  const radius = compact ? 3 : 4.2;

  // Turn with the scroll, easing toward the target so it settles on each
  // project. During the entrance the ring also sweeps around into place.
  useFrame((_, delta) => {
    if (!group.current) return;
    introTime.current = Math.min(introTime.current + Math.min(delta, 0.1), 60);
    const sweep = easeOutCubic(clamp01(introTime.current / RING_SWEEP_S));
    const target = ringRotationFor(progress.get() * (n - 1), n) + (1 - sweep) * Math.PI * 0.8;
    group.current.rotation.y =
      sweep < 1 ? target : THREE.MathUtils.damp(group.current.rotation.y, target, 4, delta);
  });

  return (
    <group ref={group} position={[0, 0.3, 0]}>
      {projects.map((p, i) => (
        <Crystal
          key={p.name}
          index={i}
          introTime={introTime}
          position={ringPosition(i, n, radius)}
          logoUrl={`/images/projects${p.src}`}
          active={i === activeIndex}
        />
      ))}
    </group>
  );
}

// Entrance timing: each crystal rises and pops in, one after another.
const CRYSTAL_INTRO_S = 0.9;
const CRYSTAL_STAGGER_S = 0.09;
const RING_SWEEP_S = 1.6;
const CRYSTAL_OPACITY = 0.45;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
// Slight overshoot, so each crystal "lands".
const easeOutBack = (x: number) => {
  const c1 = 1.4;
  return 1 + (c1 + 1) * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

function Crystal({
  index,
  introTime,
  position,
  logoUrl,
  active,
}: {
  index: number;
  introTime: React.RefObject<number>;
  position: [number, number, number];
  logoUrl: string;
  active: boolean;
}) {
  const shell = useRef<THREE.Mesh>(null);
  const holder = useRef<THREE.Group>(null);
  const material = useRef<THREE.MeshStandardMaterial>(null);
  // Size from being active or not, before the entrance pop is applied.
  const baseScale = useRef(0.65);

  useFrame((_, delta) => {
    const intro = clamp01((introTime.current - index * CRYSTAL_STAGGER_S) / CRYSTAL_INTRO_S);

    if (shell.current) shell.current.rotation.y += delta * 0.3;
    if (holder.current) {
      baseScale.current = THREE.MathUtils.damp(baseScale.current, active ? 1.15 : 0.65, 6, delta);
      holder.current.scale.setScalar(baseScale.current * Math.max(0, easeOutBack(intro)));
      holder.current.position.y = position[1] - (1 - easeOutCubic(intro)) * 2.5;
    }
    if (material.current) {
      material.current.opacity = CRYSTAL_OPACITY * intro;
      material.current.emissiveIntensity = THREE.MathUtils.damp(
        material.current.emissiveIntensity,
        active ? 1.1 : 0.25,
        6,
        delta
      );
    }
  });

  return (
    <group ref={holder} position={position} scale={0}>
      <Billboard>
        <TexturePlane url={logoUrl} transparent scale={0.95} />
      </Billboard>
      <mesh ref={shell}>
        <icosahedronGeometry args={[1, 0]} />
        {/* Standard (not physical) material: same faceted glass look, far cheaper per pixel */}
        <meshStandardMaterial
          ref={material}
          color={CRYSTAL}
          emissive={EMISSIVE}
          emissiveIntensity={0.25}
          roughness={0.2}
          metalness={0.1}
          transparent
          opacity={0}
          depthWrite={false}
          flatShading
        />
      </mesh>
    </group>
  );
}

// "About me" code fragments scattered around the ring as background.
function CodeSnippets({ compact, color }: { compact: boolean; color: string }) {
  const placements = useMemo(
    () => layoutSnippets(compact ? 6 : 12, 7),
    [compact]
  );
  return (
    <>
      {placements.map((p, i) => (
        <Drifting key={i} speed={p.speed}>
          <Billboard position={p.position}>
            <Text
              font="/fonts/JetBrainsMono-Regular.woff"
              fontSize={p.scale}
              color={color}
              fillOpacity={p.opacity}
              anchorX="center"
              anchorY="middle"
            >
              {aboutSnippets[i % aboutSnippets.length]}
            </Text>
          </Billboard>
        </Drifting>
      ))}
    </>
  );
}

function Drifting({ speed, children }: { speed: number; children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * speed;
  });
  return <group ref={group}>{children}</group>;
}
