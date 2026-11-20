"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,

  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { jobs } from "@/constants/constants";
import { matchIndex, useSectionFocus } from "@/lib/siteNavigation";

type Job = {
  name: string;
  role: string;
  start?: string;
  end?: string;
  descriptions?: string[];
};

// Oldest job on the lowest floor, so riding up the building follows the career.
const careerJobs: Job[] = [...jobs].reverse();
const N = careerJobs.length;

const BUILDING_W = 300;
const FLOOR_H = 56;
const ROOF_H = 48;
const LOBBY_H = 70;
const FLOORS = Math.max(6, N * 2 + 1);
const BUILDING_H = ROOF_H + FLOORS * FLOOR_H + LOBBY_H;

// Which floor (0 = lowest) each job sits on, spread up the building.
const jobFloor = (i: number) => Math.round(((i + 1) * FLOORS) / (N + 1)) - 1;
// A floor's centre, relative to the building's centre (negative = above centre).
const floorCenterY = (floor: number) =>
  ROOF_H + (FLOORS - 1 - floor) * FLOOR_H + FLOOR_H / 2 - BUILDING_H / 2;

// Scroll timeline: zoom in to the first floor, then hold and ride up floor by floor.
const ZOOM_END = 0.2;
const SEGMENT = (1 - ZOOM_END) / N;
const holdStart = (i: number) => ZOOM_END + i * SEGMENT + (i === 0 ? 0 : SEGMENT * 0.3);
const holdEnd = (i: number) => ZOOM_END + (i + 1) * SEGMENT;

// Where in this section's scroll a job's floor is shown (for Migu's navigation).
// Defaults to the current job.
const focusProgress = (focus?: string) => {
  if (N === 0) return 0;
  const found = matchIndex(careerJobs.map((j) => j.name), focus);
  const i = found === -1 ? N - 1 : found;
  return holdStart(i) + (holdEnd(i) - holdStart(i)) * 0.4;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const formatMonth = (v: string) => {
  const [y, m] = v.split("-");
  return `${MONTHS[Number(m) - 1]} ${y}`;
};
const formatDates = (start?: string, end?: string) => {
  if (start && end) return `${formatMonth(start)} – ${formatMonth(end)}`;
  if (start) return `${formatMonth(start)} – Present`;
  if (end) return `Until ${formatMonth(end)}`;
  return "";
};
const bullets = (j: Job) => (j.descriptions ?? []).filter((d) => d.trim());

export default function WorkExperience() {
  const reduceMotion = useReducedMotionSafe();
  useSectionFocus("work-experience", focusProgress);
  const sectionRef = useRef<HTMLElement>(null);
  const [zoom, setZoom] = useState(4);
  const [floorLabel, setFloorLabel] = useState<number | null>(null);

  // Zoom so a floor spans the screen width.
  useEffect(() => {
    const update = () => setZoom(Math.max(2.5, (window.innerWidth / BUILDING_W) * 1.05));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Camera keyframes: overview → first job floor → each next floor.
  const times = [0, ZOOM_END];
  const scales = [1, zoom];
  const focus = [0, floorCenterY(jobFloor(0))];
  for (let i = 1; i < N; i++) {
    times.push(holdStart(i) - SEGMENT * 0.3, holdStart(i));
    scales.push(zoom, zoom);
    focus.push(floorCenterY(jobFloor(i - 1)), floorCenterY(jobFloor(i)));
  }
  times.push(1);
  scales.push(zoom);
  focus.push(floorCenterY(jobFloor(N - 1)));

  const scale = useTransform(scrollYProgress, times, scales);
  const focusY = useTransform(scrollYProgress, times, focus);
  // Keep the focused floor at the centre of the screen while scaling.
  const y = useTransform(() => -scale.get() * focusY.get());
  const skylineScale = useTransform(scale, [1, zoom], [1, 1.6]);
  const headingOpacity = useTransform(scrollYProgress, [0, ZOOM_END * 0.6], [1, 0]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    let next: number | null = null;
    for (let i = 0; i < N; i++) {
      if (v >= holdStart(i) - 0.02 && v <= holdEnd(i)) next = i;
    }
    setFloorLabel((prev) => (prev === next ? prev : next));
  });

  // No jobs listed: nothing to show (and the floor maths would divide by zero).
  if (N === 0) return null;

  if (reduceMotion) {
    return (
      <section id="work-experience" ref={sectionRef} className="w-full px-6 py-24 flex flex-col items-center">
        <Heading />
        <div className="mt-10 grid gap-4 w-full max-w-2xl">
          {[...careerJobs].reverse().map((j, i) => (
            <JobPanel key={i} job={j} floor={jobFloor(N - 1 - i)} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      id="work-experience"
      ref={sectionRef}
      className="relative w-full"
      style={{ height: `${(N + 1.4) * 100}vh` }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-[linear-gradient(180deg,var(--sky-top)_0%,var(--sky-mid)_70%,var(--sky-bottom)_100%)]">
        {/* Background skyline */}
        <motion.div
          className="absolute inset-x-0 bottom-0 h-1/2 flex items-end justify-between px-2 opacity-60"
          style={{ scale: skylineScale, transformOrigin: "50% 100%" }}
        >
          {[55, 80, 40, 95, 0, 70, 50, 85].map((h, i) =>
            h === 0 ? (
              <div key={i} className="w-[30%]" />
            ) : (
              <div
                key={i}
                className="w-[8%] bg-(--night) border-t border-sky-400/10"
                style={{
                  height: `${h}%`,
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent 0 14px, rgba(125,211,252,0.08) 14px 18px)",
                }}
              />
            )
          )}
        </motion.div>

        {/* The building */}
        <motion.div
          className="absolute left-1/2 top-1/2"
          style={{
            width: BUILDING_W,
            height: BUILDING_H,
            marginLeft: -BUILDING_W / 2,
            marginTop: -BUILDING_H / 2,
            scale,
            y,
          }}
        >
          <Building />
        </motion.div>

        <motion.div
          className="absolute top-24 inset-x-0 flex flex-col items-center pointer-events-none"
          style={{ opacity: headingOpacity }}
        >
          <Heading />
          <p className="mt-2 text-sm text-sky-100/50">Scroll to ride up</p>
        </motion.div>

        {/* What's on each floor, shown once you've zoomed in */}
        {careerJobs.map((job, i) => (
          <FloorView key={i} job={job} index={i} progress={scrollYProgress} />
        ))}

        {/* Elevator floor indicator */}
        {floorLabel !== null && (
          <div className="absolute right-4 md:right-10 top-24 md:top-1/2 md:-translate-y-1/2 z-20 flex flex-col items-center gap-1 font-mono">
            <span className="text-sky-400 text-xs">FLOOR</span>
            <span className="text-white text-2xl md:text-4xl font-bold tabular-nums rounded-lg border border-sky-400/40 bg-(--surface)/80 px-3 py-1 shadow-[0_0_20px_rgba(56,189,248,0.35)]">
              {String(jobFloor(floorLabel) + 1).padStart(2, "0")}
            </span>
            <span className="text-sky-300 text-sm">▲</span>
          </div>
        )}
      </div>
    </section>
  );
}

function Heading() {
  return (
    <>
      <p className="font-mono text-sky-400 text-sm">&gt; cd ./work</p>
      <h2 className="font-lalezar text-white text-4xl sm:text-6xl mt-2 text-center">
        Work Experience
      </h2>
    </>
  );
}

function Building() {
  const jobAt = new Map(careerJobs.map((j, i) => [jobFloor(i), j]));
  return (
    <div className="w-full h-full flex flex-col">
      {/* Roof with antenna */}
      <div className="relative flex justify-center items-end" style={{ height: ROOF_H }}>
        <div className="absolute bottom-0 w-[92%] h-3 bg-[#13285e] border-t border-sky-400/40" />
        <div className="absolute bottom-3 w-0.5 h-8 bg-sky-400/60" />
        <div className="absolute bottom-11 w-2 h-2 rounded-full bg-red-400 shadow-[0_0_10px_#f87171] animate-pulse" />
      </div>
      {/* Floors, top to bottom */}
      {Array.from({ length: FLOORS }, (_, k) => {
        const floor = FLOORS - 1 - k;
        const job = jobAt.get(floor);
        return (
          <div
            key={floor}
            className="relative bg-[#0b1838] border-x-4 border-[#13285e] border-b border-b-sky-400/15"
            style={{ height: FLOOR_H }}
          >
            <div
              className="absolute inset-x-3 inset-y-2 rounded-sm"
              style={{
                // Lit floors are brighter instead of glowing: a box-shadow here
                // would be repainted at every step of the zoom.
                backgroundImage: job
                  ? "repeating-linear-gradient(90deg, rgba(186,230,253,0.95) 0 22px, transparent 22px 30px)"
                  : "repeating-linear-gradient(90deg, rgba(125,211,252,0.14) 0 22px, transparent 22px 30px)",
                backgroundColor: job ? "rgba(56,189,248,0.25)" : undefined,
              }}
            />
            {job && (
              <span className="absolute -left-1 top-1/2 -translate-y-1/2 -translate-x-full pr-2 font-mono text-[10px] text-sky-300 whitespace-nowrap">
                {job.name}
              </span>
            )}
          </div>
        );
      })}
      {/* Lobby */}
      <div
        className="relative bg-[#0b1838] border-x-4 border-[#13285e] flex justify-center items-end"
        style={{ height: LOBBY_H }}
      >
        <div className="w-16 h-12 rounded-t-md bg-[linear-gradient(180deg,#38bdf8,#0369a1)] opacity-70" />
      </div>
      <div className="h-1 -mx-10 bg-sky-400/40" />
    </div>
  );
}

function FloorView({
  job,
  index,
  progress,
}: {
  job: Job;
  index: number;
  progress: MotionValue<number>;
}) {
  const start = holdStart(index);
  const end = holdEnd(index);
  // Short holds (many jobs) need shorter fades, or the input range stops increasing.
  const fade = Math.min(0.035, (end - start) / 3);
  const opacity = useTransform(
    progress,
    [start - 0.01, start + fade, end - fade, end],
    [0, 1, 1, index === N - 1 ? 1 : 0]
  );
  const y = useTransform(progress, [start - 0.01, start + fade], [24, 0]);
  return (
    <motion.div
      className="absolute inset-0 z-10 flex items-center justify-center px-4 pointer-events-none"
      style={{ opacity }}
    >
      <motion.div style={{ y }} className="w-full max-w-2xl pointer-events-auto">
        <JobPanel job={job} floor={jobFloor(index)} />
      </motion.div>
    </motion.div>
  );
}

// Looks like looking in through the floor's window into the office.
function JobPanel({ job, floor }: { job: Job; floor: number }) {
  const items = bullets(job);
  const current = !job.end;
  return (
    <div className="relative rounded-2xl border-4 border-(--surface-3) bg-(--surface) shadow-[0_0_40px_rgba(56,189,248,0.35)] overflow-hidden">
      {/* Window mullions */}
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0_calc(25%-2px),var(--mullion)_calc(25%-2px)_25%)]" />
      <div className="relative p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <span className="text-sky-400">FL {String(floor + 1).padStart(2, "0")}</span>
          <span className="text-sky-100/50">{formatDates(job.start, job.end)}</span>
          {current && (
            <span className="rounded-full bg-emerald-400/15 border border-emerald-400/50 text-emerald-300 px-2 py-0.5">
              currently here
            </span>
          )}
        </div>
        <h3 className="font-lalezar text-white text-3xl md:text-5xl mt-3 leading-none">{job.name}</h3>
        <p className="text-sky-300 font-semibold text-base md:text-lg mt-2">{job.role}</p>
        {items.length > 0 && (
          <ul className="mt-4 space-y-1.5 text-sm md:text-base text-sky-100/80 list-disc pl-5">
            {items.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
