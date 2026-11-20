"use client";

import { useEffect, useRef, useState } from "react";
import { registerTransitionHost, type Transition } from "@/lib/pageTransition";
import OrbitMark from "@/components/OrbitMark";

// The Orbit M loading screen, reused for jumps between sections: fade in,
// jump instantly while covered, give the new section a beat to settle, fade out.
const FADE_IN_MS = 220;
const SETTLE_MS = 380;
const FADE_OUT_MS = 380;

export default function TransitionOverlay() {
  const [visible, setVisible] = useState(false);
  const [label, setLabel] = useState("");
  const running = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    const unregister = registerTransitionHost(({ label, jump }: Transition) => {
      // A second click mid-transition just retargets the jump.
      if (running.current) {
        pending.push(setTimeout(jump, 0));
        return;
      }
      running.current = true;
      setLabel(label);
      setVisible(true);
      pending.push(
        setTimeout(() => {
          jump();
          pending.push(
            setTimeout(() => {
              setVisible(false);
              pending.push(setTimeout(() => (running.current = false), FADE_OUT_MS));
            }, SETTLE_MS)
          );
        }, FADE_IN_MS)
      );
    });
    return () => {
      unregister();
      pending.forEach(clearTimeout);
    };
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-0 z-[190] flex flex-col items-center justify-center gap-6 bg-(--page) transition-opacity ease-out ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{ transitionDuration: `${visible ? FADE_IN_MS : FADE_OUT_MS}ms` }}
    >
      {visible || label ? <OrbitMark line={label} /> : null}
    </div>
  );
}
