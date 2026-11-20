"use client";

import { useCallback, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,

  useScroll,
} from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import TechIcon, { techIcons } from "@/components/TechIcon";
import PhysicsPile from "@/components/PhysicsPile";
import { stackCategories } from "@/constants/constants";
import { useSectionFocus } from "@/lib/siteNavigation";

const CATEGORIES = [
  { key: "frontend", label: "Frontend" },
  { key: "backend", label: "Backend" },
] as const;
type CategoryKey = (typeof CATEGORIES)[number]["key"];

const MAX_BLOCKS = Math.max(
  ...CATEGORIES.map((c) => stackCategories[c.key].length)
);
// Scroll progress is bucketed so the section re-renders a few dozen times, not every frame.
const STEPS = 48;
// All blocks have dropped by this point in the section, leaving time to look at the pile.
const STACK_DONE_AT = 0.85;
const SWIPE_THRESHOLD = 60;
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const slide = {
  enter: (direction: number) => ({ x: direction * 200, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction * -200, opacity: 0 }),
};

export default function TechStack() {
  const reduceMotion = useReducedMotionSafe();
  const sectionRef = useRef<HTMLElement>(null);
  const [category, setCategory] = useState<CategoryKey>("frontend");
  const [direction, setDirection] = useState(1);
  const [step, setStep] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.min(STEPS, Math.max(0, Math.floor((v / STACK_DONE_AT) * STEPS)));
    setStep((prev) => (prev === next ? prev : next));
  });

  const stacks: string[] = stackCategories[category];
  const target = Math.min(
    stacks.length,
    Math.floor((step / STEPS) * (stacks.length + 1))
  );

  const switchTo = (next: CategoryKey) => {
    if (next === category) return;
    setDirection(next === "backend" ? 1 : -1);
    setCategory(next);
  };

  // Migu's navigation: show the finished pile, switching to the asked-for group.
  const focusProgress = useCallback((focus?: string) => {
    const f = focus?.toLowerCase() ?? "";
    const next: CategoryKey | null = f.includes("back") ? "backend" : f.includes("front") ? "frontend" : null;
    if (next) {
      setDirection(next === "backend" ? 1 : -1);
      setCategory(next);
    }
    return Math.min(1, STACK_DONE_AT + 0.08);
  }, []);
  useSectionFocus("tech-stack", focusProgress);

  return (
    <section
      id="tech-stack"
      ref={sectionRef}
      className="relative w-full"
      style={{ height: reduceMotion ? "auto" : `${100 + MAX_BLOCKS * 22}vh` }}
    >
      <div className={reduceMotion ? "py-24" : "sticky top-0 h-[100svh] overflow-hidden"}>
        <div className="h-full flex flex-col items-center px-6 pt-28 pb-8">
          <p className="font-mono text-sky-400 text-sm">&gt; ls ./stack</p>
          <h2 className="font-lalezar text-white text-4xl sm:text-6xl mt-2 text-center">
            What I build with
          </h2>

          <div
            role="tablist"
            aria-label="Stack category"
            className="mt-6 flex rounded-full border border-sky-400/30 bg-(--surface)/70 p-1"
          >
            {CATEGORIES.map((c) => {
              const active = c.key === category;
              return (
                <button
                  key={c.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => switchTo(c.key)}
                  className={`relative px-5 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${
                    active ? "text-[#0a1433]" : "text-sky-100/70 hover:text-white"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="stack-tab"
                      className="absolute inset-0 rounded-full bg-sky-500"
                      transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                    />
                  )}
                  <span className="relative">{c.label}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-sky-100/50">Swipe or tap to switch</p>

          {reduceMotion ? (
            <ul className="mt-10 flex flex-wrap justify-center max-w-2xl">
              {stacks.map((stack) => (
                <li
                  key={stack}
                  className="w-28 h-28 bg-(--surface) border border-sky-400/40 flex flex-col items-center justify-center gap-2"
                >
                  <TechIcon stack={stack} className="w-10 h-10" />
                  <span className="text-xs text-sky-100/80">{techIcons[stack]?.label}</span>
                </li>
              ))}
            </ul>
          ) : (
            // Pile area: swipe horizontally to switch, vertical scrolling still works.
            <motion.div
              className="relative flex-1 w-full max-w-2xl mt-4 select-none"
              style={{ touchAction: "pan-y" }}
              onPanEnd={(_, info) => {
                const { x, y } = info.offset;
                if (Math.abs(x) < SWIPE_THRESHOLD || Math.abs(x) < Math.abs(y)) return;
                switchTo(x < 0 ? "backend" : "frontend");
              }}
            >
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={category}
                  custom={direction}
                  variants={slide}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: EASE_OUT }}
                  className="absolute inset-0"
                >
                  <PhysicsPile stacks={stacks} target={target} />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          <div className="mt-5 flex flex-col sm:flex-row items-center gap-2 sm:gap-6 font-mono text-xs text-sky-100/50">
            <span>
              {String(reduceMotion ? stacks.length : target).padStart(2, "0")} /{" "}
              {String(stacks.length).padStart(2, "0")} stacked
            </span>
            <span>
              tools: {stackCategories.tools.map((t) => techIcons[t]?.label).join(" · ")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
