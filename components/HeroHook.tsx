"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import TechIcon from "@/components/TechIcon";
import FloatingSnippets, { type SnippetSpot, useInView } from "@/components/FloatingSnippets";
import { usePageReady } from "@/lib/pageReady";
import { navigateTo } from "@/lib/siteNavigation";
import { projects, jobs } from "@/constants/constants";

const COMMAND = "> whoami";
const ROLES = [
  "Junior Developer @ Hirolabz",
  "Full Stack Developer",
  "Mobile Developer",
  "Data Science Student",
];
const ORBIT_STACKS = [
  "nextjs",
  "reactjs",
  "nodejs",
  "typescript",
  "tailwind",
  "supabase",
  "mongodb",
  "firebase",
];
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

// Orb entrance: each starts this far out along its own direction (off-screen)
// and springs into orbit while the ring spins into place.
const ORB_START_PX = 1100;
const ORB_DELAY_S = 0.2;
const ORB_STAGGER_S = 0.06;
const ORB_SPIN_S = 1.4;

// Background code fragments, kept to the edges so they frame the content.
const SNIPPET_SPOTS: SnippetSpot[] = [
  { top: "11%", left: "3%" },
  { top: "11%", left: "40%", desktopOnly: true },
  { top: "18%", left: "58%", desktopOnly: true },
  { top: "84%", left: "40%", desktopOnly: true },
  { top: "92%", left: "6%" },
  { top: "78%", left: "72%", desktopOnly: true },
  { top: "18%", left: "16%", dim: true, desktopOnly: true },
  { top: "24%", left: "80%", dim: true, desktopOnly: true },
  { top: "40%", left: "46%", dim: true, desktopOnly: true },
  { top: "60%", left: "2%", dim: true, desktopOnly: true },
  { top: "88%", left: "62%", dim: true, desktopOnly: true },
  { top: "95%", left: "28%", dim: true },
  { top: "70%", left: "44%", dim: true, desktopOnly: true },
  { top: "34%", left: "1%", dim: true, desktopOnly: true },
  { top: "50%", left: "86%", dim: true, desktopOnly: true },
  { top: "6%", left: "70%", dim: true, desktopOnly: true },
  { top: "62%", left: "3%", dim: true },
  { top: "4%", left: "52%", dim: true },
];

export default function HeroHook() {
  const reduceMotion = useReducedMotionSafe();
  // Entrances start once the splash screen has faded, so they're seen.
  const pageReady = usePageReady();
  const sectionRef = useRef<HTMLElement>(null);
  // Loops stop once the hero is scrolled out of view.
  const visible = useInView(sectionRef);
  const loopState = visible ? "running" : "paused";
  const [typed, setTyped] = useState(0);
  const [roleIndex, setRoleIndex] = useState(0);
  const doneTyping = typed >= COMMAND.length;

  // Type the command quickly; skip straight to the end for reduced motion.
  useEffect(() => {
    if (reduceMotion) {
      setTyped(COMMAND.length);
      return;
    }
    if (doneTyping || !pageReady) return;
    const t = setTimeout(() => setTyped((n) => n + 1), 70);
    return () => clearTimeout(t);
  }, [typed, doneTyping, reduceMotion, pageReady]);

  // Revolve through the role lines.
  useEffect(() => {
    if (!visible) return;
    const t = setInterval(
      () => setRoleIndex((i) => (i + 1) % ROLES.length),
      2600
    );
    return () => clearInterval(t);
  }, [visible]);

  const stats = [
    `${projects.length} projects`,
    `${jobs.length} companies`,
    "Startup QC Silver Awardee",
  ];

  return (
    <section ref={sectionRef} className="relative w-full min-h-[100svh] flex flex-col-reverse md:flex-row items-center justify-center gap-10 md:gap-16 px-6 pt-28 pb-20">
      <FloatingSnippets spots={SNIPPET_SPOTS} className="text-sky-300/25" />

      {/* Text side */}
      <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left max-w-xl">
        <p className="font-mono text-sky-400 text-sm sm:text-base h-6">
          {COMMAND.slice(0, typed)}
          {!doneTyping && (
            <motion.span
              className="inline-block w-[0.6ch]"
              animate={{ opacity: [0, 1] }}
              transition={{ duration: 0.4, repeat: Infinity, repeatType: "reverse" }}
            >
              _
            </motion.span>
          )}
        </p>

        <motion.h1
          className="font-lalezar text-white text-4xl sm:text-6xl 2xl:text-8xl leading-none mt-3"
          initial={{ opacity: 0, y: 16 }}
          animate={doneTyping ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: EASE_OUT }}
        >
          MIGUEL JOHN
          <br />
          CAACBAY
        </motion.h1>

        <div className="h-10 sm:h-12 mt-3 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.h2
              key={ROLES[roleIndex]}
              className="font-lalezar text-sky-400 text-2xl sm:text-4xl"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -24 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
            >
              {ROLES[roleIndex]}
            </motion.h2>
          </AnimatePresence>
        </div>

        <motion.div
          className="flex flex-col items-center md:items-start"
          initial={{ opacity: 0, y: 16 }}
          animate={doneTyping ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15, ease: EASE_OUT }}
        >
          <p className="text-slate-300 text-base sm:text-lg mt-4">
            I build web and mobile apps people actually use.
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
            <a
              href="#projects"
              onClick={(e) => {
                e.preventDefault();
                navigateTo("projects");
              }}
              className="rounded-full bg-sky-500 text-[#0a1433] font-semibold px-6 py-3 hover:brightness-110 active:scale-[0.97] transition-[filter,transform] duration-150"
            >
              See my projects
            </a>
            <a
              href="#contacts"
              onClick={(e) => {
                e.preventDefault();
                navigateTo("contacts");
              }}
              className="rounded-full border border-sky-500 text-sky-300 font-semibold px-6 py-3 hover:bg-sky-500/10 active:scale-[0.97] transition-[background-color,transform] duration-150"
            >
              Get in touch
            </a>
          </div>

          <ul className="flex flex-wrap justify-center md:justify-start gap-x-3 gap-y-1 mt-6 text-sm text-slate-400">
            {stats.map((s, i) => (
              <li key={s} className="flex items-center gap-3">
                {i > 0 && <span aria-hidden>·</span>}
                {s}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Avatar with revolving tech ring */}
      <div className="relative z-10 w-[min(18rem,calc(100vw-3rem))] aspect-square sm:w-80 md:w-[26rem] shrink-0">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.32)_0%,transparent_65%)]" />
        <div className="absolute inset-[6%] rounded-full border border-dashed border-sky-500/40" />

        <Avatar className="absolute inset-[20%] flex items-center justify-center">
          <AvatarImage
            src="/images/square.jpg"
            className="rounded-full ring-4 ring-sky-500/60"
          />
          <AvatarFallback className="w-full h-full p-0 flex items-center justify-center">
            <Skeleton className="w-full h-full rounded-full bg-(--surface-3) animate-pulse" />
          </AvatarFallback>
        </Avatar>

        {/* Entrance: the whole orbit spins quickly into place while each orb
            flies in from off-screen, so they spiral around the photo. */}
        <motion.div
          className="absolute inset-[6%]"
          initial={reduceMotion ? false : { rotate: -220 }}
          animate={pageReady || reduceMotion ? { rotate: 0 } : undefined}
          transition={{ duration: ORB_SPIN_S, ease: EASE_OUT, delay: ORB_DELAY_S }}
        >
          <div className="absolute inset-0 animate-orbit" style={{ animationPlayState: loopState }}>
            {ORBIT_STACKS.map((stack, i) => {
              const angle = (i / ORBIT_STACKS.length) * Math.PI * 2;
              return (
                <div
                  key={stack}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${50 + 50 * Math.cos(angle)}%`,
                    top: `${50 + 50 * Math.sin(angle)}%`,
                  }}
                >
                  <motion.div
                    initial={
                      reduceMotion
                        ? false
                        : {
                            x: Math.cos(angle) * ORB_START_PX,
                            y: Math.sin(angle) * ORB_START_PX,
                            scale: 1.6,
                            opacity: 0,
                          }
                    }
                    animate={pageReady || reduceMotion ? { x: 0, y: 0, scale: 1, opacity: 1 } : undefined}
                    transition={{
                      type: "spring",
                      stiffness: 140,
                      damping: 17,
                      delay: ORB_DELAY_S + i * ORB_STAGGER_S,
                      opacity: { duration: 0.25, delay: ORB_DELAY_S + i * ORB_STAGGER_S },
                    }}
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-[4.5rem] md:h-[4.5rem] rounded-full bg-slate-900 border-2 border-sky-500 shadow-[0_0_18px_rgba(14,165,233,0.55)] flex items-center justify-center animate-orbit-reverse" style={{ animationPlayState: loopState }}>
                      <TechIcon
                        stack={stack}
                        className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9"
                      />
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <a
        href="#tech-stack"
        onClick={(e) => {
          e.preventDefault();
          navigateTo("tech-stack");
        }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center text-slate-400 hover:text-sky-300 text-xs transition-colors duration-150"
        aria-label="Scroll to tech stack"
      >
        Scroll
        <motion.span
          animate={reduceMotion || !visible ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={20} />
        </motion.span>
      </a>
    </section>
  );
}
