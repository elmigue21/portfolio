"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,

  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { orgs } from "@/constants/constants";
import { matchIndex, useSectionFocus } from "@/lib/siteNavigation";

type Activity = {
  name: string;
  role: string;
  src: string;
  descriptions?: string[];
};

// Distance between doors along the hallway, in px of 3D depth.
const SPACING = 900;
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const activities: Activity[] = orgs;
const DOORS = activities.length;
// Hallway length: one spacing per door, plus room before the end wall.
const LENGTH = (DOORS + 1.5) * SPACING;
// How far the camera walks: stops short of the end wall so the EXIT sign is in view.
const WALK = (DOORS + 0.8) * SPACING;

// Where in this section's scroll you're standing at an activity's door (for
// Migu's navigation). Defaults to the first door.
const focusProgress = (focus?: string) => {
  const found = matchIndex(activities.map((a) => a.name), focus);
  const i = Math.max(0, found);
  return Math.min(1, ((i + 1) * SPACING - SPACING * 0.15) / WALK);
};

const bullets = (a: Activity) => (a.descriptions ?? []).filter((d) => d.trim());

export default function ExtraCurricular() {
  const reduceMotion = useReducedMotionSafe();
  useSectionFocus("extracurricular", focusProgress);
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const camZ = useTransform(scrollYProgress, [0, 1], [0, WALK]);

  // The door beside the camera is the active one.
  useMotionValueEvent(camZ, "change", (z) => {
    let next: number | null = null;
    for (let i = 0; i < DOORS; i++) {
      if (Math.abs(z - (i + 1) * SPACING) < SPACING * 0.45) next = i;
    }
    setActive((prev) => (prev === next ? prev : next));
  });

  if (reduceMotion) {
    return (
      <section id="extracurricular" ref={sectionRef} className="bg-(--page) w-full px-6 py-24 flex flex-col items-center">
        <Heading />
        <div className="mt-10 grid gap-4 w-full max-w-2xl">
          {activities.map((a, i) => (
            <ActivityCard key={i} activity={a} index={i} />
          ))}
        </div>
      </section>
    );
  }

  const activeActivity = active === null ? null : activities[active];

  return (
    <section
      id="extracurricular"
      ref={sectionRef}
      className="relative w-full bg-(--page)"
      style={{ height: `${(DOORS + 1.5) * 100}vh` }}
    >
      {/* Hallway size: half-width, half-height, door size, perspective */}
      <div className="sticky top-0 h-[100svh] overflow-hidden [--hw:150px] [--hh:190px] [--dw:104px] [--dh:200px] [--persp:600px] md:[--hw:340px] md:[--hh:250px] md:[--dw:240px] md:[--dh:340px] md:[--persp:800px]">
        {/* 3D hallway */}
        <div
          className="absolute inset-0"
          style={{ perspective: "var(--persp)", perspectiveOrigin: "50% 45%" }}
        >
          <motion.div
            className="absolute inset-0"
            // will-change keeps the hallway's layers rasterized once while you walk.
            style={{ transformStyle: "preserve-3d", z: camZ, willChange: "transform" }}
          >
            <Hallway />
            {activities.map((a, i) => (
              <Door key={i} activity={a} index={i} camZ={camZ} />
            ))}
            <EndWall />
          </motion.div>
        </div>

        {/* Depth fog toward the far end */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,var(--hall-fog)_0%,transparent_35%)]" />

        <div className="absolute top-24 inset-x-0 flex flex-col items-center pointer-events-none">
          <Heading />
        </div>

        {/* Phones: doors are too small to read, so show the details below */}
        <AnimatePresence mode="wait">
          {activeActivity && (
            <div key={active} className="md:hidden absolute z-20 inset-x-4 bottom-6">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                transition={{ duration: 0.35, ease: EASE_OUT }}
              >
                <ActivityCard activity={activeActivity} index={active!} />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function Heading() {
  return (
    <>
      <p className="font-mono text-sky-400 text-sm">&gt; cd ./activities</p>
      <h2 className="font-lalezar text-white text-3xl sm:text-5xl mt-2 text-center">
        Extra-Curricular Activities
      </h2>
    </>
  );
}

// Walls, floor and ceiling. Each plane is centred on screen, then placed in 3D.
function Hallway() {
  const plane = "absolute left-1/2 top-1/2";
  return (
    <>
      {/* Left wall */}
      <div
        className={`${plane} bg-[linear-gradient(90deg,var(--hall-wall-a)_0%,var(--hall-wall-b)_100%)]`}
        style={{
          width: LENGTH,
          height: "calc(var(--hh) * 2)",
          marginLeft: -LENGTH / 2,
          marginTop: "calc(var(--hh) * -1)",
          transform: `translateX(calc(var(--hw) * -1)) translateZ(${-LENGTH / 2}px) rotateY(90deg)`,
          backgroundImage:
            "repeating-linear-gradient(90deg, var(--hall-line) 0 1px, transparent 1px 180px)",
        }}
      />
      {/* Right wall */}
      <div
        className={`${plane} bg-[linear-gradient(270deg,var(--hall-wall-a)_0%,var(--hall-wall-b)_100%)]`}
        style={{
          width: LENGTH,
          height: "calc(var(--hh) * 2)",
          marginLeft: -LENGTH / 2,
          marginTop: "calc(var(--hh) * -1)",
          transform: `translateX(var(--hw)) translateZ(${-LENGTH / 2}px) rotateY(-90deg)`,
          backgroundImage:
            "repeating-linear-gradient(90deg, var(--hall-line) 0 1px, transparent 1px 180px)",
        }}
      />
      {/* Floor: glossy with a grid */}
      <div
        className={plane}
        style={{
          width: "calc(var(--hw) * 2)",
          height: LENGTH,
          marginLeft: "calc(var(--hw) * -1)",
          marginTop: -LENGTH / 2,
          transform: `translateY(var(--hh)) translateZ(${-LENGTH / 2}px) rotateX(90deg)`,
          background:
            "repeating-linear-gradient(0deg, var(--hall-grid) 0 1px, transparent 1px 120px), repeating-linear-gradient(90deg, var(--hall-grid-soft) 0 1px, transparent 1px 80px), var(--hall-floor)",
        }}
      />
      {/* Ceiling: light strips */}
      <div
        className={plane}
        style={{
          width: "calc(var(--hw) * 2)",
          height: LENGTH,
          marginLeft: "calc(var(--hw) * -1)",
          marginTop: -LENGTH / 2,
          transform: `translateY(calc(var(--hh) * -1)) translateZ(${-LENGTH / 2}px) rotateX(-90deg)`,
          background:
            "repeating-linear-gradient(0deg, transparent 0 260px, var(--hall-light) 260px 300px, transparent 300px 450px), var(--hall-ceiling)",
        }}
      />
    </>
  );
}

function Door({
  activity,
  index,
  camZ,
}: {
  activity: Activity;
  index: number;
  camZ: MotionValue<number>;
}) {
  const depth = (index + 1) * SPACING;
  const left = index % 2 === 0;
  // The door face is small: two points at most, each capped at three lines.
  const items = bullets(activity).slice(0, 2);
  // Hinged on the far edge, the door swings out toward you as you approach, so
  // its inner face (with the activity on it) turns to face the camera.
  const open = useTransform(
    camZ,
    [depth - SPACING * 0.95, depth - SPACING * 0.4],
    [0, left ? 88 : -88],
    { clamp: true }
  );

  return (
    <div
      className="absolute left-1/2 top-1/2"
      style={{
        width: "var(--dw)",
        height: "var(--dh)",
        marginLeft: "calc(var(--dw) / -2)",
        marginTop: "calc(var(--dh) / -2)",
        transformStyle: "preserve-3d",
        transform: left
          ? `translate3d(calc(var(--hw) * -1 + 1px), calc(var(--hh) - var(--dh) / 2), ${-depth}px) rotateY(90deg)`
          : `translate3d(calc(var(--hw) - 1px), calc(var(--hh) - var(--dh) / 2), ${-depth}px) rotateY(-90deg)`,
      }}
    >
      {/* Lit room behind the door */}
      <div className="absolute inset-0 rounded-t-md bg-[radial-gradient(circle_at_50%_40%,#38bdf8_0%,#0369a1_45%,#0a1433_100%)] flex items-center justify-center overflow-hidden">
        <div className="relative w-1/2 aspect-square rounded-full overflow-hidden ring-2 ring-white/70 bg-[#fff]">
          <OrgLogo activity={activity} size="80px" />
        </div>
      </div>
      {/* Frame */}
      <div className="absolute -inset-1.5 rounded-t-lg border-4 border-sky-400/70 shadow-[0_0_24px_rgba(56,189,248,0.6)] pointer-events-none" />
      {/* Door leaf, hinged on the far edge */}
      <motion.div
        className="absolute inset-0"
        style={{
          rotateY: open,
          transformOrigin: left ? "right center" : "left center",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Outside face (closed door) */}
        <div
          className="force-dark absolute inset-0 rounded-t-md bg-[linear-gradient(180deg,#13285e,#0b1838)] border border-sky-400/40 flex flex-col items-center justify-start pt-6 gap-3"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="font-mono text-sky-300 text-xs md:text-sm border border-sky-400/50 rounded px-2 py-0.5">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="w-3/5 h-px bg-sky-400/30" />
          <div className="w-3/5 h-1/3 rounded border border-sky-400/20" />
          <span
            className={`absolute top-1/2 w-2 h-2 rounded-full bg-sky-300 shadow-[0_0_8px_#7dd3fc] ${
              left ? "left-3" : "right-3"
            }`}
          />
        </div>
        {/* Inside face: the activity, facing you once the door is open */}
        <div
          className="absolute inset-0 rounded-t-md bg-[linear-gradient(180deg,var(--door-face-a),var(--door-face-b))] border border-sky-300/60 shadow-[0_0_30px_rgba(56,189,248,0.45)] p-3 md:p-4 flex flex-col gap-2 overflow-hidden"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="relative w-9 h-9 md:w-11 md:h-11 shrink-0 rounded-full overflow-hidden bg-[#fff] ring-2 ring-sky-300/70">
            <OrgLogo activity={activity} size="48px" />
          </div>
          <p className="font-mono text-sky-400 text-[10px] md:text-xs">
            door_{String(index + 1).padStart(2, "0")}
          </p>
          <h3 className="font-lalezar text-white text-sm md:text-base leading-tight">
            {activity.name}
          </h3>
          <p className="text-sky-300 font-semibold text-[11px] md:text-xs leading-snug">{activity.role}</p>
          {items.length > 0 && (
            <ul className="hidden md:block space-y-1.5 text-[11px] leading-snug text-sky-100/80 list-disc pl-4">
              {items.map((d) => (
                <li key={d}>
                  <span className="line-clamp-3">{d}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function EndWall() {
  return (
    <div
      className="absolute left-1/2 top-1/2 flex flex-col items-center justify-center gap-4 bg-(--night) border border-sky-400/20"
      style={{
        width: "calc(var(--hw) * 2)",
        height: "calc(var(--hh) * 2)",
        marginLeft: "calc(var(--hw) * -1)",
        marginTop: "calc(var(--hh) * -1)",
        transform: `translateZ(${-LENGTH}px)`,
      }}
    >
      <span className="font-mono font-bold tracking-widest text-emerald-300 text-2xl md:text-4xl px-4 py-1 rounded border-2 border-emerald-400/70 shadow-[0_0_24px_rgba(52,211,153,0.6)]">
        EXIT →
      </span>
      <span className="font-mono text-sky-100/50 text-xs md:text-sm">more doors coming soon</span>
    </div>
  );
}

function ActivityCard({ activity, index }: { activity: Activity; index: number }) {
  const items = bullets(activity);
  return (
    <div className="rounded-2xl border border-sky-400/40 bg-(--surface)/95 p-5 shadow-[0_0_32px_rgba(14,165,233,0.25)]">
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 shrink-0 rounded-full overflow-hidden bg-[#fff]">
          <OrgLogo activity={activity} size="48px" />
        </div>
        <div>
          <p className="font-mono text-sky-400 text-xs">door_{String(index + 1).padStart(2, "0")}</p>
          <h3 className="font-lalezar text-white text-xl leading-tight">{activity.name}</h3>
        </div>
      </div>
      <p className="mt-3 text-sky-300 font-semibold">{activity.role}</p>
      {items.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm text-sky-100/80 list-disc pl-5">
          {items.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// The org's logo, or its initials when there's no logo yet (e.g. "SQ" for Startup QC).
function OrgLogo({ activity, size }: { activity: Activity; size: string }) {
  if (activity.src) {
    return <Image src={`/images/orgs/${activity.src}`} alt="" fill sizes={size} className="object-cover" />;
  }
  const initials = activity.name
    .split(/[\s—-]+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
  return (
    <span className="absolute inset-0 flex items-center justify-center bg-[#0a1433] font-lalezar text-sky-300 text-[length:calc(var(--logo,48px)*0.4)] leading-none" style={{ ["--logo" as string]: size }}>
      {initials}
    </span>
  );
}
