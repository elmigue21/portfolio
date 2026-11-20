"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { LayoutGrid, Moon, Sun, X } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { contacts } from "@/constants/constants";
import { navigateTo, navigateToTop } from "@/lib/siteNavigation";
import type { NavSection } from "@/lib/migu";
import FloatingSnippets, { type SnippetSpot } from "@/components/FloatingSnippets";

export const navSections: { id: NavSection; label: string }[] = [
  { id: "tech-stack", label: "Tech Stack" },
  { id: "projects", label: "Projects" },
  { id: "work-experience", label: "Work Experience" },
  { id: "extracurricular", label: "Extra-Curricular Activities" },
  { id: "contacts", label: "Links & Contacts" },
];

// A section counts as active once its top passes this line.
const ACTIVE_OFFSET = 140;
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

// Fixed spots for the drifting code snippets in the full-screen menu.
const SNIPPET_SPOTS: SnippetSpot[] = [
  { top: "12%", left: "6%" },
  { top: "22%", left: "62%" },
  { top: "38%", left: "78%" },
  { top: "55%", left: "4%" },
  { top: "68%", left: "58%" },
  { top: "82%", left: "18%" },
  { top: "88%", left: "70%" },
];

const contactIcons: Record<string, typeof FaGithub> = {
  GitHub: FaGithub,
  LinkedIn: FaLinkedin,
};

export default function Navbar() {
  const reduceMotion = useReducedMotionSafe();
  const { theme, toggle: toggleTheme } = useTheme();
  const [active, setActive] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Do the scroll work at most once per frame.
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 40);
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      const present = navSections.filter((s) => document.getElementById(s.id));
      if (atBottom && present.length) {
        setActive(present[present.length - 1].id);
        return;
      }
      let current: string | null = null;
      for (const s of present) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= ACTIVE_OFFSET) {
          current = s.id;
        }
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Lock page scroll, focus the close button and close on Escape while the menu is open.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <div className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-4 pointer-events-none">
        <motion.nav
          className={`pointer-events-auto flex items-center justify-between lg:justify-start gap-1 p-2 w-full max-w-md lg:max-w-none lg:w-auto rounded-full border border-sky-400/30 backdrop-blur-sm shadow-[0_0_32px_rgba(14,165,233,0.22)] transition-colors duration-300 ${
            scrolled ? "bg-(--surface)/90" : "bg-(--surface)/70"
          }`}
          initial={reduceMotion ? false : { y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
        >
          {/* Code-style wordmark, links back to the top */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              navigateToTop();
            }}
            className="flex items-center h-11 px-3 shrink-0 rounded-full font-mono text-sm hover:bg-sky-500/10 transition-colors duration-150"
            aria-label="Back to top"
          >
            <span className="text-sky-400">&lt;</span>
            <span className="text-white font-semibold">MJC</span>
            <span className="text-sky-400">&nbsp;/&gt;</span>
          </a>

          <ul className="hidden lg:flex items-center mx-2">
            {navSections.map((s) => (
              <li key={s.id} className="relative">
                <a
                  href={`#${s.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo(s.id);
                  }}
                  className={`relative z-10 block px-4 py-2 text-sm whitespace-nowrap rounded-full transition-colors duration-200 ${
                    active === s.id ? "text-white" : "text-sky-100/70 hover:text-white"
                  }`}
                >
                  {s.label}
                </a>
                {active === s.id && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-sky-500/20 border border-sky-400/50 shadow-[0_0_16px_rgba(56,189,248,0.35)]"
                    transition={{ type: "spring", duration: 0.45, bounce: 0.15 }}
                  />
                )}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1">
            {/* Light/dark toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              // Same label in both themes (correct even before the page loads);
              // aria-pressed says which one is on.
              aria-label="Light mode"
              aria-pressed={theme === "light"}
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
              className="relative flex items-center justify-center w-11 h-11 rounded-full text-sky-200 hover:text-white hover:bg-sky-500/15 active:scale-[0.95] transition-[background-color,color,transform] duration-150 overflow-hidden"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, rotate: -90, scale: 0.6 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, rotate: 90, scale: 0.6 }}
                  transition={{ duration: 0.2, ease: EASE_OUT }}
                  className="flex"
                >
                  {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
                </motion.span>
              </AnimatePresence>
            </button>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 rounded-full bg-sky-500 text-[#0a1433] font-semibold text-sm px-4 h-11 hover:brightness-110 active:scale-[0.97] transition-[filter,transform] duration-150"
              aria-haspopup="dialog"
              aria-expanded={open}
            >
              <LayoutGrid size={16} />
              Menu
            </button>
          </div>
        </motion.nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="fixed inset-0 z-[100] overflow-y-auto bg-(--deep)/[0.97]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Glow and drifting code snippets */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] rounded-full bg-[radial-gradient(circle,rgba(2,132,199,0.22)_0%,transparent_70%)]" />
            </div>
            <FloatingSnippets spots={SNIPPET_SPOTS} />

            <div className="relative min-h-full flex flex-col px-6 md:px-16 py-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sky-400 text-sm">&gt; ls ./portfolio</span>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center w-11 h-11 rounded-full border border-sky-400/40 text-sky-100 hover:bg-sky-500/15 active:scale-[0.97] transition-[background-color,transform] duration-150"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              <ul className="flex-1 flex flex-col justify-center gap-2 md:gap-4 py-10">
                {navSections.map((s, i) => (
                  <motion.li
                    key={s.id}
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.08 + i * 0.06, ease: EASE_OUT }}
                  >
                    <a
                      href={`#${s.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setOpen(false);
                        navigateTo(s.id);
                      }}
                      className="group flex items-baseline gap-4 md:gap-6"
                    >
                      <span className="font-mono text-sky-400 text-sm md:text-base">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`font-lalezar text-4xl sm:text-6xl md:text-[min(6rem,9vh)] leading-none transition-[color,transform] duration-300 group-hover:translate-x-3 group-hover:text-sky-400 ${
                          active === s.id ? "text-sky-400" : "text-white"
                        }`}
                      >
                        {s.label}
                      </span>
                    </a>
                  </motion.li>
                ))}
              </ul>

              <motion.div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-sky-400/20 pt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.45 }}
              >
                <p className="text-sky-100/60 text-sm">
                  Junior Developer @ Hirolabz · Philippines
                </p>
                <div className="flex gap-3">
                  {contacts.map((c) => {
                    const Icon = contactIcons[c.name];
                    return (
                      <a
                        key={c.name}
                        href={c.link}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={c.name}
                        className="flex items-center justify-center w-11 h-11 rounded-full border border-sky-400/40 text-sky-100 hover:text-white hover:bg-sky-500/15 transition-colors duration-150"
                      >
                        {Icon && <Icon size={20} />}
                      </a>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
