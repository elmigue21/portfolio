"use client";

import { useEffect, useRef } from "react";
import Matter from "matter-js";
import TechIcon, { techIcons } from "@/components/TechIcon";

// Where each block is dropped from, in block-widths from the centre, so they heap up.
const SPAWN_OFFSETS = [0, -1.05, 1.05, -0.5, 0.55, -1.6, 1.6, 0.1, -0.9, 0.9];
const SPAWN_GAP_MS = 140;
const REMOVE_GAP_MS = 70;
// Relative speed (px per step) above which a collision counts as an impact.
const IMPACT_SPEED = 4;
const SHAKE_COOLDOWN_MS = 140;
const STEP_MS = 1000 / 60;

// Block size from the pile area: by width, but small enough that about three
// rows fit its height, so short phones don't cut off the top of the pile.
function blockSizeFor(width: number, height: number) {
  const byWidth = width < 400 ? 84 : width < 640 ? 100 : 120;
  const byHeight = Math.floor(height / 3.2);
  return Math.max(56, Math.min(byWidth, byHeight || byWidth));
}

type PileState = {
  engine: Matter.Engine;
  walls: Matter.Body[];
  bodies: Matter.Body[];
  width: number;
  height: number;
  size: number;
  // Each block's own size (blocks keep theirs if the pile resizes).
  sizes: number[];
  target: number;
  timer: ReturnType<typeof setTimeout> | null;
  lastShake: number;
};

// A real 2D physics pile: each tech block is a rigid body that falls, collides,
// bounces and settles. `target` is how many blocks should be in the pile.
export default function PhysicsPile({
  stacks,
  target,
}: {
  stacks: string[];
  target: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shakeRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const stateRef = useRef<PileState | null>(null);
  const reconcileRef = useRef<() => void>(() => {});

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const engine = Matter.Engine.create({ enableSleeping: true });
    engine.gravity.y = 1.2;

    const state: PileState = {
      engine,
      walls: [],
      bodies: [],
      width: container.clientWidth,
      height: container.clientHeight,
      size: blockSizeFor(container.clientWidth, container.clientHeight),
      target: 0,
      timer: null,
      lastShake: 0,
      sizes: [],
    };
    stateRef.current = state;

    const buildWalls = () => {
      Matter.Composite.remove(engine.world, state.walls);
      const { width: w, height: h } = state;
      state.walls = [
        Matter.Bodies.rectangle(w / 2, h + 50, w * 3, 100, { isStatic: true, friction: 0.9 }),
        Matter.Bodies.rectangle(-50, h / 2 - h, 100, h * 4, { isStatic: true }),
        Matter.Bodies.rectangle(w + 50, h / 2 - h, 100, h * 4, { isStatic: true }),
      ];
      Matter.Composite.add(engine.world, state.walls);
    };
    buildWalls();

    const addBlock = (i: number) => {
      const el = blockRefs.current[i];
      if (!el) return;
      const { size, width } = state;
      const offset = SPAWN_OFFSETS[i % SPAWN_OFFSETS.length] * size * 0.95;
      const x = Math.min(width - size / 2 - 4, Math.max(size / 2 + 4, width / 2 + offset));
      const body = Matter.Bodies.rectangle(x, -size * 0.6, size, size, {
        chamfer: { radius: size * 0.14 },
        restitution: 0.32,
        friction: 0.55,
        frictionStatic: 0.9,
        frictionAir: 0.012,
        density: 0.002,
        angle: (i % 2 ? 1 : -1) * 0.18,
      });
      Matter.Body.setVelocity(body, { x: 0, y: 4 });
      Matter.Body.setAngularVelocity(body, (i % 2 ? -1 : 1) * 0.03);
      state.bodies.push(body);
      state.sizes[state.bodies.length - 1] = size;
      Matter.Composite.add(engine.world, body);
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.opacity = "1";
    };

    const removeTopBlock = () => {
      const i = state.bodies.length - 1;
      const body = state.bodies.pop();
      if (!body) return;
      Matter.Composite.remove(engine.world, body);
      // Wake the pile so blocks resting on the removed one fall.
      state.bodies.forEach((b) => Matter.Sleeping.set(b, false));
      const el = blockRefs.current[i];
      if (el) el.style.opacity = "0";
    };

    // Add or remove one block at a time until the pile matches the target.
    const reconcile = () => {
      if (state.timer) return;
      const count = state.bodies.length;
      if (count < state.target) {
        addBlock(count);
        state.timer = setTimeout(() => {
          state.timer = null;
          reconcile();
        }, SPAWN_GAP_MS);
      } else if (count > state.target) {
        removeTopBlock();
        state.timer = setTimeout(() => {
          state.timer = null;
          reconcile();
        }, REMOVE_GAP_MS);
      }
    };
    reconcileRef.current = reconcile;

    // Impacts: shake the pile and puff dust where blocks hit.
    const onCollision = (event: Matter.IEventCollision<Matter.Engine>) => {
      for (const pair of event.pairs) {
        const speed = Matter.Vector.magnitude(
          Matter.Vector.sub(pair.bodyA.velocity, pair.bodyB.velocity)
        );
        if (speed < IMPACT_SPEED) continue;
        const point = pair.collision.supports[0];
        if (point) puffDust(point.x, point.y, speed);
        shake(speed);
      }
    };
    Matter.Events.on(engine, "collisionStart", onCollision);

    const shake = (speed: number) => {
      const now = performance.now();
      if (now - state.lastShake < SHAKE_COOLDOWN_MS || !shakeRef.current) return;
      state.lastShake = now;
      const a = Math.min(6, speed * 0.6);
      shakeRef.current.animate(
        [
          { transform: "translate(0, 0)" },
          { transform: `translate(${-a * 0.4}px, ${a}px)` },
          { transform: `translate(${a * 0.4}px, ${-a * 0.4}px)` },
          { transform: `translate(${-a * 0.2}px, ${a * 0.2}px)` },
          { transform: "translate(0, 0)" },
        ],
        { duration: 300, easing: "ease-out" }
      );
    };

    const puffDust = (x: number, y: number, speed: number) => {
      const dust = document.createElement("span");
      const w = Math.min(90, 30 + speed * 6);
      dust.className =
        "pointer-events-none absolute rounded-full bg-sky-300/50 blur-[3px]";
      Object.assign(dust.style, {
        left: `${x - w / 2}px`,
        top: `${y - 4}px`,
        width: `${w}px`,
        height: "8px",
      });
      container.appendChild(dust);
      dust
        .animate(
          [
            { transform: "scaleX(0.3)", opacity: 0.9 },
            { transform: "scaleX(1.8)", opacity: 0 },
          ],
          { duration: 420, easing: "ease-out" }
        )
        .finished.then(() => dust.remove(), () => dust.remove());
    };

    // Fixed-step simulation loop, paused while the section is off-screen.
    let frame = 0;
    let running = false;
    let last = 0;
    let acc = 0;
    const tick = (now: number) => {
      acc += Math.min(100, now - last);
      last = now;
      while (acc >= STEP_MS) {
        Matter.Engine.update(engine, STEP_MS);
        acc -= STEP_MS;
      }

      state.bodies.forEach((body, i) => {
        const el = blockRefs.current[i];
        if (!el) return;
        const half = (state.sizes[i] ?? state.size) / 2;
        el.style.transform = `translate3d(${body.position.x - half}px, ${
          body.position.y - half
        }px, 0) rotate(${body.angle}rad)`;
      });
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      acc = 0;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    const visibility = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) start();
      else stop();
    });
    visibility.observe(container);

    const resize = new ResizeObserver(() => {
      state.width = container.clientWidth;
      state.height = container.clientHeight;
      state.size = blockSizeFor(state.width, state.height);
      // Pull blocks back inside the new bounds before the walls go up, so a
      // shrink (e.g. rotating a phone) doesn't spawn walls inside them.
      for (const b of state.bodies) {
        const half = (b.bounds.max.x - b.bounds.min.x) / 2;
        const x = Math.min(state.width - half, Math.max(half, b.position.x));
        const y = Math.min(state.height - half, b.position.y);
        if (x !== b.position.x || y !== b.position.y) {
          Matter.Body.setPosition(b, { x, y });
          Matter.Body.setVelocity(b, { x: 0, y: 0 });
        }
      }
      buildWalls();
      state.bodies.forEach((b) => Matter.Sleeping.set(b, false));
    });
    resize.observe(container);

    return () => {
      stop();
      visibility.disconnect();
      resize.disconnect();
      if (state.timer) clearTimeout(state.timer);
      Matter.Events.off(engine, "collisionStart", onCollision);
      Matter.World.clear(engine.world, false);
      Matter.Engine.clear(engine);
      stateRef.current = null;
    };
  }, []);

  // Scroll position decides how many blocks should be in the pile.
  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;
    state.target = Math.min(target, stacks.length);
    reconcileRef.current();
  }, [target, stacks.length]);

  return (
    <div ref={shakeRef} className="absolute inset-0">
      <div ref={containerRef} className="absolute inset-0 overflow-hidden">
        {stacks.map((stack, i) => (
          <div
            key={stack}
            ref={(el) => {
              blockRefs.current[i] = el;
            }}
            className="absolute top-0 left-0 rounded-2xl bg-(--surface) border border-sky-400/40 shadow-[0_0_20px_rgba(14,165,233,0.25)] flex flex-col items-center justify-center gap-2 opacity-0 transition-opacity duration-200 will-change-transform"
            style={{ transform: "translate3d(-200px, -200px, 0)" }}
          >
            <TechIcon stack={stack} className="w-9 h-9 md:w-11 md:h-11" />
            <span className="text-xs md:text-sm text-sky-100/80">
              {techIcons[stack]?.label ?? stack}
            </span>
          </div>
        ))}
      </div>
      {/* Ground line, at the physics floor */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />
    </div>
  );
}
