"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,

  useScroll,
} from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import TechIcon, { techIcons } from "@/components/TechIcon";
import { projects } from "@/constants/constants";
import { activeIndexFromProgress, formatCounter, projectBullets } from "@/lib/projects3d";
import { matchIndex, useSectionFocus } from "@/lib/siteNavigation";
import { useTheme } from "@/lib/theme";

const ProjectsScene = dynamic(() => import("./ProjectsScene"), { ssr: false });

type Project = {
  name: string;
  src: string;
  srcAlt: string;
  techStacks: string[];
  descriptions?: string[];
};

const list: Project[] = projects;

// Where in this section's scroll a project is at the front of the ring (for
// Migu's navigation). Defaults to the first project.
const focusProgress = (focus?: string) => {
  const i = Math.max(0, matchIndex(list.map((p) => p.name), focus));
  return list.length > 1 ? i / (list.length - 1) : 0;
};
const EASE_OUT = [0.23, 1, 0.32, 1] as const;
// Project data uses a few names that differ from the icon keys.
const STACK_ALIASES: Record<string, string> = { tailwindcss: "tailwind" };
const stackKeys = (p: Project) =>
  p.techStacks.map((s) => STACK_ALIASES[s] ?? s).filter((s) => techIcons[s]);

function canUseWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function ProjectsShowcase() {
  const reduceMotion = useReducedMotionSafe();
  useSectionFocus("projects", focusProgress);
  const { theme } = useTheme();
  const sectionRef = useRef<HTMLElement>(null);
  const [mode, setMode] = useState<"loading" | "3d" | "fallback">("loading");
  const [compact, setCompact] = useState(false);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [mounted3d, setMounted3d] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    setCompact(window.matchMedia("(max-width: 768px)").matches);
    setMode(!reduceMotion && canUseWebGL() ? "3d" : "fallback");
  }, [reduceMotion]);

  // Preload the 3D scene once the page has settled, so it's ready (libraries,
  // logos, font, compiled shaders) before the visitor scrolls here. It draws no
  // frames until the section is on screen.
  useEffect(() => {
    if (mode !== "3d") return;
    const load = () => setMounted3d(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(load, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(load, 1500);
    return () => clearTimeout(t);
  }, [mode]);

  // Render frames only while the section is on screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (mode !== "3d" || !el) return;
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
      if (entry.isIntersecting) setMounted3d(true);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [mode]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = activeIndexFromProgress(v, list.length);
    setActive((prev) => (prev === next ? prev : next));
  });

  if (mode === "fallback") {
    return (
      <section id="projects" className="w-full px-6 py-24 flex flex-col items-center">
        <Heading />
        <div className="mt-10 grid gap-4 w-full max-w-3xl md:grid-cols-2">
          {list.map((p, i) => (
            <div key={p.name} className="rounded-2xl border border-sky-400/30 bg-(--surface)/80 p-5">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 shrink-0 rounded-full overflow-hidden bg-[#fff]">
                  <Image src={`/images/projects${p.src}`} alt={p.srcAlt} fill sizes="48px" className="object-contain" />
                </div>
                <h3 className="font-lalezar text-white text-xl">{p.name}</h3>
              </div>
              <Details project={p} index={i} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  const project = list[active];

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative w-full"
      style={{ height: `${(list.length + 1) * 100}vh` }}
    >
      {/* Every project as text, for screen readers and search engines; the
          visual ring shows one at a time. */}
      <ul className="sr-only">
        {list.map((p) => (
          <li key={p.name}>
            <h3>{p.name}</h3>
            <ul>
              {projectBullets(p).map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-(--page) flex flex-col md:block">
        <div className="relative h-[55svh] md:absolute md:inset-0 md:h-auto">
          {mode === "3d" && mounted3d && (
            // Fades in once ready; the crystals then assemble (see ProjectsScene).
            <div
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                sceneReady ? "opacity-100" : "opacity-0"
              }`}
            >
              <ProjectsScene
                projects={list}
                progress={scrollYProgress}
                activeIndex={active}
                compact={compact}
                inView={inView}
                onReady={() => setSceneReady(true)}
                light={theme === "light"}
              />
            </div>
          )}
        </div>

        <div className="absolute top-24 inset-x-0 flex flex-col items-center pointer-events-none">
          <Heading />
        </div>

        <span className="absolute right-6 md:right-10 top-24 md:top-28 font-mono text-sky-300 text-sm md:text-base">
          {formatCounter(active, list.length)}
        </span>

        {/* Active project's details, as real text */}
        <div className="relative md:absolute md:left-10 md:bottom-10 px-4 md:px-0 w-full md:w-[26rem] flex-1 flex items-start md:block">
          <AnimatePresence mode="wait">
            <motion.div
              key={project.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
              className="w-full rounded-2xl border border-sky-400/40 bg-(--surface)/95 p-5 shadow-[0_0_32px_rgba(14,165,233,0.25)]"
            >
              <h3 className="font-lalezar text-white text-3xl leading-none">{project.name}</h3>
              <Details project={project} index={active} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function Heading() {
  return (
    <>
      <p className="font-mono text-sky-400 text-sm">&gt; ls ./projects</p>
      <h2 className="font-lalezar text-white text-4xl sm:text-6xl mt-2 text-center">Projects</h2>
    </>
  );
}

function Details({ project, index }: { project: Project; index: number }) {
  const items = projectBullets(project).slice(0, 4);
  return (
    <>
      {items.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-sky-100/80 list-disc pl-5">
          {items.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex flex-wrap gap-2" aria-label={`Project ${index + 1} tech stack`}>
        {stackKeys(project).map((s) => (
          <span
            key={s}
            title={techIcons[s].label}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-(--night) border border-sky-400/30"
          >
            <TechIcon stack={s} className="w-5 h-5" />
          </span>
        ))}
      </div>
    </>
  );
}
