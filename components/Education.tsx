"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Check } from "lucide-react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { useSectionFocus } from "@/lib/siteNavigation";
import { education } from "@/constants/constants";

// Scroll timeline (0–1 across the section): the card swings down on its
// lanyard, holds so the front can be read, then flips to show the coursework.
const SWING_END = 0.3;
const FLIP_START = 0.45;
const FLIP_END = 0.75;

// Where in this section's scroll to land for Migu's navigation: the back of the
// card for coursework questions, otherwise the settled front.
const focusProgress = (focus?: string) =>
  focus && /course|class|subject/i.test(focus) ? 0.85 : SWING_END;

// Portrait ID card (CR80 ratio), sized to fit under the heading on short screens.
const CARD_SIZE =
  "w-[min(18rem,calc(100vw-3rem),calc((100svh-15rem)*0.63))] aspect-[54/85.6]";

const BARCODE =
  "repeating-linear-gradient(90deg, currentColor 0 2px, transparent 2px 4px, currentColor 4px 5px, transparent 5px 8px, currentColor 8px 11px, transparent 11px 13px)";

export default function Education() {
  const reduceMotion = useReducedMotionSafe();
  useSectionFocus("education", focusProgress);
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const y = useTransform(scrollYProgress, [0, SWING_END], ["-110%", "0%"]);
  const swing = useTransform(scrollYProgress, [0, SWING_END * 0.7, SWING_END], [-14, 4, 0]);
  const rotateY = useTransform(scrollYProgress, [FLIP_START, FLIP_END], [0, 180]);
  const sheen = useTransform(scrollYProgress, [0, 1], ["120%", "-20%"]);

  if (reduceMotion) {
    return (
      <section id="education" ref={sectionRef} className="bg-(--page) w-full px-6 py-24 flex flex-col items-center">
        <Heading />
        <div className="mt-10 flex flex-wrap justify-center gap-6">
          <div className={`relative ${CARD_SIZE}`}>
            <Front />
          </div>
          <div className={`relative ${CARD_SIZE}`}>
            <Back />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="education" ref={sectionRef} className="relative w-full bg-(--page)" style={{ height: "260vh" }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Above the card so the lanyard passes behind the heading */}
        <div className="absolute z-10 top-24 inset-x-0 flex flex-col items-center pointer-events-none">
          <Heading />
          <p className="mt-2 text-sm text-sky-100/50">Scroll to flip</p>
        </div>

        <div className="absolute inset-0 flex items-center justify-center pt-44 pb-8">
          {/* Swings from the top of the card, where the lanyard clips on */}
          <motion.div className="relative" style={{ y, rotate: swing, transformOrigin: "50% 0%" }}>
            <Lanyard />
            <div style={{ perspective: 1200 }}>
              <motion.div
                className={`relative ${CARD_SIZE}`}
                style={{ rotateY, transformStyle: "preserve-3d" }}
              >
                <Face>
                  <Front />
                  <Sheen x={sheen} />
                </Face>
                <Face back>
                  <Back />
                  <Sheen x={sheen} />
                </Face>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Heading() {
  return (
    <>
      <p className="font-mono text-sky-400 text-sm">&gt; cat ./student-id</p>
      <h2 className="font-lalezar text-white text-4xl sm:text-6xl mt-2 text-center">Education</h2>
    </>
  );
}

// One side of the flipping card.
function Face({ back = false, children }: { back?: boolean; children: React.ReactNode }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: back ? "rotateY(180deg)" : undefined,
      }}
    >
      {children}
    </div>
  );
}

// Strap from the top of the screen down to a clip on the card.
function Lanyard() {
  return (
    <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 flex flex-col items-center" aria-hidden>
      <div className="w-5 h-[100svh] bg-sky-500 bg-[repeating-linear-gradient(180deg,transparent_0_18px,rgba(10,20,51,0.25)_18px_20px)]" />
      <div className="w-8 h-5 -mt-px rounded-b-md border-2 border-sky-300 bg-(--surface-3)" />
    </div>
  );
}

// Holographic glint that slides across the card as you scroll.
function Sheen({ x }: { x: MotionValue<string> }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(115deg,transparent_40%,rgba(255,255,255,0.16)_50%,transparent_60%)] bg-size-[250%_100%]"
      style={{ backgroundPositionX: x }}
    />
  );
}

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col rounded-2xl border border-sky-400/40 bg-(--surface) shadow-[0_0_40px_rgba(56,189,248,0.3)] overflow-hidden">
      {children}
    </div>
  );
}

function Front() {
  return (
    <CardShell>
      <div className="relative bg-sky-500 text-[#0a1433] px-4 pt-5 pb-3 text-center">
        {/* Slot for the lanyard clip */}
        <span className="absolute top-1.5 left-1/2 -translate-x-1/2 w-10 h-1.5 rounded-full bg-(--page)" />
        <p className="font-lalezar text-xl sm:text-2xl leading-none">{education.school.toUpperCase()}</p>
        <p className="font-mono text-[10px] sm:text-xs tracking-[0.2em] mt-1">STUDENT ID</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4 py-3 text-center">
        <div className="relative w-[42%] aspect-square rounded-xl overflow-hidden ring-2 ring-sky-400/60">
          <Image src="/images/square.jpg" alt="Miguel John Caacbay" fill sizes="128px" className="object-cover" />
        </div>
        <div>
          <p className="font-lalezar text-white text-xl sm:text-2xl leading-none">MIGUEL JOHN CAACBAY</p>
          <p className="text-sky-300 font-semibold text-sm sm:text-base mt-1.5">{education.degree}</p>
          <p className="text-sky-100/70 text-xs sm:text-sm">{education.track} track</p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-sky-100/60">
            {education.start} – {education.end}
          </span>
          <span className="rounded-full bg-emerald-400/15 border border-emerald-400/50 text-emerald-300 px-2 py-0.5">
            enrolled
          </span>
        </div>
      </div>

      <div className="px-5 pb-4">
        <div className="h-8 text-sky-100/70" style={{ backgroundImage: BARCODE }} aria-hidden />
      </div>
    </CardShell>
  );
}

function Back() {
  return (
    <CardShell>
      {/* Magnetic stripe */}
      <div className="force-dark mt-6 h-10 bg-[#020617] border-y border-sky-400/20" aria-hidden />

      <div className="flex-1 flex flex-col px-5 py-5">
        <p className="font-mono text-sky-400 text-xs sm:text-sm">&gt; cat coursework.txt</p>
        <ul className="mt-3 space-y-2.5">
          {education.coursework.map((c) => (
            <li key={c} className="flex items-start gap-2 text-sm sm:text-base text-sky-100/90">
              <Check size={18} className="mt-0.5 shrink-0 text-emerald-300" />
              {c}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-4 border-t border-sky-400/20 font-mono text-xs space-y-1">
          <p className="text-sky-100/70">
            Expected graduation · <span className="text-white">{education.end}</span>
          </p>
          <p className="text-sky-100/50">If found, please run ./contact.sh</p>
        </div>
      </div>
    </CardShell>
  );
}
