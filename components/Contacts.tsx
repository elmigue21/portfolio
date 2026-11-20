"use client";

import { useEffect, useRef, useState } from "react";
import FloatingSnippets, { type SnippetSpot, useInView } from "@/components/FloatingSnippets";
import { contacts } from "@/constants/constants";
import { navigateTo } from "@/lib/siteNavigation";
import { SECTION_LABELS, type NavSection } from "@/lib/migu";

type Line =
  | { kind: "cmd"; text: string }
  | { kind: "out"; text: string }
  | { kind: "err"; text: string }
  | { kind: "link"; text: string; href: string };

const SNIPPET_SPOTS: SnippetSpot[] = [
  { top: "12%", left: "4%" },
  { top: "18%", left: "70%", desktopOnly: true },
  { top: "82%", left: "6%", dim: true },
  { top: "88%", left: "62%", dim: true, desktopOnly: true },
];

const PROMPT = "miguel@portfolio:~$";
const LINE_DELAY_MS = 45;
const CHIPS = ["help", "whoami", "github", "linkedin", "sudo hire miguel"];

const linkFor = (name: string) => contacts.find((c) => c.name === name)?.link ?? "";
const handle = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

const SECTIONS: Record<string, NavSection> = {
  stack: "tech-stack",
  projects: "projects",
  work: "work-experience",
  education: "education",
  activities: "extracurricular",
};

const HELP: Line[] = [
  { kind: "out", text: "Available commands:" },
  { kind: "out", text: "  whoami      who I am" },
  { kind: "out", text: "  github      open my GitHub" },
  { kind: "out", text: "  linkedin    open my LinkedIn" },
  { kind: "out", text: "  ls          list the sections of this site" },
  { kind: "out", text: "  projects    jump to my projects (also: stack, work, education, activities)" },
  { kind: "out", text: "  clear       clear the screen" },
];

const WELCOME: Line[] = [
  { kind: "out", text: "Welcome to Miguel's terminal." },
  { kind: "out", text: "Type a command, or tap one below. Try 'help'." },
];

// Runs a command. Returns the lines to print; side effects (opening links,
// scrolling) happen here too.
function run(input: string): Line[] | "clear" {
  const cmd = input.trim().toLowerCase().replace(/\s+/g, " ");
  if (!cmd) return [];

  const open = (name: string): Line[] => {
    const url = linkFor(name);
    window.open(url, "_blank", "noopener,noreferrer");
    return [
      { kind: "out", text: `Opening ${name}…` },
      { kind: "link", text: handle(url), href: url },
    ];
  };

  if (cmd === "help") return HELP;
  if (cmd === "clear") return "clear";
  if (cmd === "whoami")
    return [
      { kind: "out", text: "Miguel John Caacbay" },
      { kind: "out", text: "Junior Developer @ Hirolabz, since June 2026" },
      { kind: "out", text: "BS Computer Science (Data Science), Adamson University" },
      { kind: "out", text: "Startup QC Silver Awardee with Verdalyx Technologies" },
      { kind: "out", text: "Full stack and mobile. Based in the Philippines." },
    ];
  if (cmd === "github") return open("GitHub");
  if (cmd === "linkedin") return open("LinkedIn");
  if (cmd === "ls")
    return [{ kind: "out", text: "stack/  projects/  work/  education/  activities/  contact.sh" }];
  if (["contact.sh", "./contact.sh", "sh contact.sh", "bash contact.sh", "cat contact.sh"].includes(cmd))
    return [
      { kind: "out", text: "Reach Miguel here:" },
      ...contacts.map((c): Line => ({ kind: "link", text: `${c.name}: ${handle(c.link)}`, href: c.link })),
    ];
  if (SECTIONS[cmd] || cmd.startsWith("cd ")) {
    const target = SECTIONS[cmd] ?? SECTIONS[cmd.slice(3).replace(/^\.\//, "").replace(/\/$/, "")];
    if (!target) return [{ kind: "err", text: `cd: no such directory: ${cmd.slice(3)}` }];
    navigateTo(target);
    return [{ kind: "out", text: `Taking you to ${SECTION_LABELS[target]}…` }];
  }
  if (cmd === "sudo hire miguel") {
    const result = open("LinkedIn");
    return [{ kind: "out", text: "[sudo] permission granted. Great call." }, ...result];
  }
  if (cmd.startsWith("sudo"))
    return [{ kind: "err", text: "Nice try. The only sudo here is 'sudo hire miguel'." }];
  if (cmd === "coffee")
    return [{ kind: "out", text: "Brewing… const coffee = Infinity; // refills never run out" }];
  if (cmd === "exit") return [{ kind: "out", text: "There's no exit. Only the next project." }];
  if (cmd === "date") return [{ kind: "out", text: new Date().toString() }];
  return [{ kind: "err", text: `command not found: ${cmd}. Try 'help'.` }];
}

export default function Contacts() {
  const sectionRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const visible = useInView(sectionRef);
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [booted, setBooted] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  // When the last queued line will print, so commands never interleave.
  const printCursor = useRef(0);

  // Print lines one at a time, after anything already queued, so output feels typed.
  const print = (next: Line[]) => {
    const now = Date.now();
    next.forEach((line) => {
      const at = Math.max(printCursor.current, now) + LINE_DELAY_MS;
      printCursor.current = at;
      timers.current.push(setTimeout(() => setLines((l) => [...l, line]), at - now));
    });
  };

  // Boot the terminal the first time it scrolls into view.
  useEffect(() => {
    if (!visible || booted) return;
    setBooted(true);
    print(WELCOME);
  }, [visible, booted]);

  // Read timers.current at unmount time: `clear` replaces the array.
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Keep the newest output in view.
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const submit = (raw: string) => {
    const text = raw.trim();
    setInput("");
    setHistoryIndex(-1);
    if (text) setHistory((h) => [...h, text]);
    const result = run(text);
    if (result === "clear") {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      printCursor.current = 0;
      setLines([]);
      return;
    }
    print([{ kind: "cmd", text }, ...result]);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit(input);
    } else if (e.key === "ArrowUp" && history.length) {
      e.preventDefault();
      const i = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(i);
      setInput(history[i]);
    } else if (e.key === "ArrowDown" && historyIndex !== -1) {
      e.preventDefault();
      const i = historyIndex + 1;
      if (i >= history.length) {
        setHistoryIndex(-1);
        setInput("");
      } else {
        setHistoryIndex(i);
        setInput(history[i]);
      }
    }
  };

  return (
    <section
      id="contacts"
      ref={sectionRef}
      className="relative w-full min-h-[100svh] flex flex-col items-center justify-center px-4 sm:px-6 pt-28 pb-10 overflow-hidden"
    >
      <FloatingSnippets spots={SNIPPET_SPOTS} className="text-sky-300/20" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full bg-[radial-gradient(circle,rgba(2,132,199,0.18)_0%,transparent_70%)]" />

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
        <p className="font-mono text-sky-400 text-sm">&gt; ./contact.sh</p>
        <h2 className="font-lalezar text-white text-5xl sm:text-6xl mt-2 text-center leading-none">
          Let&apos;s talk
        </h2>

        {/* Terminal window */}
        <div
          className="force-dark mt-8 w-full rounded-xl border border-sky-400/40 bg-(--deep) shadow-[0_0_40px_rgba(14,165,233,0.25)] overflow-hidden"
          onClick={() => inputRef.current?.focus()}
        >
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-sky-400/20 bg-(--surface)">
            <span className="w-3 h-3 rounded-full bg-red-400/80" />
            <span className="w-3 h-3 rounded-full bg-amber-300/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
            <span className="flex-1 text-center font-mono text-xs text-sky-100/50 pr-10">
              miguel@portfolio: ~
            </span>
          </div>

          <div
            ref={bodyRef}
            className="h-72 sm:h-80 overflow-y-auto px-4 py-3 font-mono text-[13px] sm:text-sm leading-relaxed"
            aria-live="polite"
          >
            {lines.map((line, i) => (
              <TerminalLine key={i} line={line} />
            ))}
            <label className="flex items-center gap-2 text-sky-100">
              <span className="text-emerald-300 shrink-0">{PROMPT}</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                className="flex-1 min-w-0 bg-transparent outline-none caret-sky-300 text-sky-100"
                aria-label="Terminal command"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
              />
            </label>
          </div>
        </div>

        {/* Tap-to-run commands */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {CHIPS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => submit(c)}
              className="font-mono text-xs sm:text-sm rounded-full border border-sky-400/40 bg-(--surface)/90 text-sky-200 px-3 py-1.5 hover:bg-sky-500/15 hover:text-white active:scale-[0.97] transition-[background-color,color,transform] duration-150"
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <footer className="relative z-10 mt-auto pt-16 font-mono text-xs text-sky-100/40 text-center">
        © {new Date().getFullYear()} Miguel John Caacbay · built with Next.js
      </footer>
    </section>
  );
}

function TerminalLine({ line }: { line: Line }) {
  if (line.kind === "cmd")
    return (
      <p className="text-sky-100 whitespace-pre-wrap break-words">
        <span className="text-emerald-300">{PROMPT}</span> {line.text}
      </p>
    );
  if (line.kind === "err")
    return <p className="text-red-300 whitespace-pre-wrap break-words">{line.text}</p>;
  if (line.kind === "link")
    return (
      <p>
        <a
          href={line.href}
          target="_blank"
          rel="noreferrer"
          className="text-sky-300 underline underline-offset-2 hover:text-white break-all"
        >
          {line.text}
        </a>
      </p>
    );
  return <p className="text-sky-100/80 whitespace-pre-wrap break-words">{line.text}</p>;
}
