"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import ReactMarkdown, { type Components } from "react-markdown";
import { ArrowDownRight, ArrowUpRight, SendHorizontal, X } from "lucide-react";
import {
  MIGU_WELCOME,
  SECTION_LABELS,
  type ChatEvent,
  type NavSection,
} from "@/lib/migu";
import { navigateTo } from "@/lib/siteNavigation";
import { QUICK_ANSWERS, type QuickAnswer } from "@/lib/miguQuickAnswers";
import { contacts } from "@/constants/constants";

type Message =
  | { id: number; role: "user" | "assistant"; text: string; note?: boolean }
  | { id: number; role: "nav"; section: NavSection; focus?: string };

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const MAX_INPUT = 500;
const QUICK_REPLY_DELAY_MS = 500;
// Give up on an answer that takes longer than this in total.
const REQUEST_TIMEOUT_MS = 60_000;
// The "Ask Migu" bubble appears once after this delay, then tucks away.
const BUBBLE_DELAY_MS = 2500;
const BUBBLE_VISIBLE_MS = 7000;

let nextId = 1;

// Guardrail: only Miguel's own profiles become clickable links, so a tricked
// reply can't send visitors somewhere else. Anything else shows as plain text.
const withoutSlash = (url: string) => url.replace(/\/+$/, "");
const ALLOWED_LINKS = new Set(contacts.map((c) => withoutSlash(c.link)));
const isAllowedLink = (href?: string) => !!href && ALLOWED_LINKS.has(withoutSlash(href));

// Links in Migu's replies (e.g. Miguel's GitHub) open in a new tab, with an
// arrow so they read as clickable. react-markdown already strips unsafe URLs.
const MARKDOWN_COMPONENTS: Components = {
  img: () => null,
  a: ({ href, children }) =>
    !isAllowedLink(href) ? (
      <span>{children}</span>
    ) : (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-sky-300 underline underline-offset-2 hover:text-white"
    >
      {children}
      <ArrowUpRight size={13} aria-hidden className="inline-block ml-0.5 align-[-1px]" />
    </a>
  ),
};

// Migu: Miguel's AI agent. A launcher in the bottom-right corner opens a chat
// panel; answers stream in, and Migu can scroll the page to what it's talking about.
export default function ChatScreen() {
  const reduceMotion = useReducedMotionSafe();
  const [open, setOpen] = useState(false);
  const [bubble, setBubble] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);
  const inputRef = useRef<HTMLInputElement>(null);

  // Show the "Ask Migu" bubble once, a moment after the page loads.
  useEffect(() => {
    const show = setTimeout(() => setBubble(true), BUBBLE_DELAY_MS);
    const hide = setTimeout(() => setBubble(false), BUBBLE_DELAY_MS + BUBBLE_VISIBLE_MS);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  // Keep the newest message in view, and focus the input when opening.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, waiting]);
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Escape closes the panel; focus goes back to the launcher when it closes.
  const launcherRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
    if (wasOpen.current) {
      // The launcher re-mounts as the panel closes; focus it once it's there.
      const t = setTimeout(() => launcherRef.current?.focus(), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  // A status or error bubble of its own (never glued onto a partial answer,
  // never sent back to the AI as something Migu said).
  const pushNote = (text: string) =>
    setMessages((prev) => [...prev, { id: nextId++, role: "assistant", text, note: true }]);

  const appendAssistantText = (text: string) =>
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === "assistant") {
        return [...prev.slice(0, -1), { ...last, text: last.text + text }];
      }
      return [...prev, { id: nextId++, role: "assistant", text }];
    });
  // Whether the current answer has produced any text yet.
  const gotText = useRef(false);

  // Starter chips: answered from the site's data, no AI call. A short "typing"
  // pause keeps it feeling like the same Migu.
  const answerQuickly = (q: QuickAnswer) => {
    if (busy) return;
    setBusy(true);
    setWaiting(true);
    setMessages((prev) => [...prev, { id: nextId++, role: "user", text: q.question }]);
    timers.current.push(
      setTimeout(() => {
        setWaiting(false);
        setMessages((prev) => [
          ...prev,
          { id: nextId++, role: "nav", section: q.navigate.section, focus: q.navigate.focus },
          { id: nextId++, role: "assistant", text: q.answer },
        ]);
        navigateTo(q.navigate.section, q.navigate.focus);
        setBusy(false);
      }, QUICK_REPLY_DELAY_MS)
    );
  };

  const send = async (raw: string) => {
    const text = raw.trim().slice(0, MAX_INPUT);
    if (!text || busy) return;
    setInput("");
    setBusy(true);
    setWaiting(true);

    const history = [...messages, { id: nextId++, role: "user" as const, text }];
    setMessages(history);
    gotText.current = false;

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        body: JSON.stringify({
          messages: history
            .filter((m): m is Extract<Message, { text: string }> => m.role !== "nav" && !m.note)
            .map((m) => ({ role: m.role, content: m.text })),
        }),
      });

      if (!res.ok || !res.body) {
        // Rate limits, "busy" and bad input come back as a readable message.
        const message =
          res.status === 429 || res.status === 400 || res.status === 503
            ? await res.text()
            : "Migu is having trouble right now. Please try again in a moment.";
        pushNote(message);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) handleEvent(line);
      }
      if (buffer.trim()) handleEvent(buffer);
      if (!gotText.current) pushNote("Migu didn't catch that. Try asking another way.");
    } catch (err) {
      console.error(err);
      pushNote("Migu lost the connection. Please try again.");
    } finally {
      setWaiting(false);
      setBusy(false);
    }
  };

  const handleEvent = (line: string) => {
    if (!line.trim()) return;
    let event: ChatEvent;
    try {
      event = JSON.parse(line);
    } catch {
      return;
    }
    setWaiting(false);
    if (event.type === "text") {
      gotText.current = true;
      appendAssistantText(event.text);
    } else if (event.type === "navigate") {
      setMessages((prev) => [
        ...prev,
        { id: nextId++, role: "nav", section: event.section, focus: event.focus },
      ]);
      navigateTo(event.section, event.focus);
    }
  };

  const showSuggestions = messages.length === 0 && !busy;

  return (
    <>
      {/* Launcher */}
      <AnimatePresence>
        {!open && (
          <motion.div
            className="fixed bottom-5 right-5 z-[60] flex items-center gap-3"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            onMouseEnter={() => setBubble(true)}
            onMouseLeave={() => setBubble(false)}
          >
            <AnimatePresence>
              {bubble && (
                <motion.button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="relative hidden sm:block rounded-2xl rounded-br-md border border-sky-400/40 bg-(--surface)/95 px-4 py-2.5 text-left shadow-[0_0_24px_rgba(14,165,233,0.25)]"
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 12, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 12, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: EASE_OUT }}
                >
                  <span className="block font-mono text-[11px] text-sky-400">&gt; migu --help</span>
                  <span className="block text-sm text-white font-medium">Ask me anything about Miguel</span>
                </motion.button>
              )}
            </AnimatePresence>

            <button
              type="button"
              ref={launcherRef}
              onClick={() => setOpen(true)}
              aria-label="Chat with Migu, Miguel's AI agent"
              className="relative w-16 h-16 rounded-full ring-2 ring-sky-400/70 shadow-[0_0_28px_rgba(56,189,248,0.45)] hover:scale-105 active:scale-95 transition-transform duration-150"
            >
              <Image src="/images/migu.svg" alt="" fill sizes="64px" unoptimized />
              <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-(--surface)" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.section
            role="dialog"
            aria-label="Chat with Migu"
            className="fixed z-[60] inset-x-3 bottom-3 h-[60svh] sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[380px] sm:h-[min(600px,calc(100svh-7rem))] flex flex-col rounded-2xl border border-sky-400/40 bg-(--panel)/[0.97] shadow-[0_0_40px_rgba(14,165,233,0.3)] overflow-hidden"
            style={{ transformOrigin: "bottom right" }}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 12 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
          >
            {/* Header */}
            <header className="flex items-center gap-3 px-4 py-3 border-b border-sky-400/20 bg-(--surface)">
              <div className="relative w-10 h-10 shrink-0">
                <Image src="/images/migu.svg" alt="" fill sizes="40px" unoptimized />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-(--surface)" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-lalezar text-white text-lg leading-none">Migu</p>
                <p className="text-xs text-sky-100/60 mt-1">Miguel&apos;s AI agent · online</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="flex items-center justify-center w-9 h-9 rounded-full text-sky-100/70 hover:text-white hover:bg-sky-500/15 transition-colors duration-150"
              >
                <X size={18} />
              </button>
            </header>

            {/* Messages */}
            <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3" aria-live="polite" aria-busy={busy}>
              <AssistantBubble text={MIGU_WELCOME} />
              {messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="flex justify-end">
                    <p className="max-w-[80%] rounded-2xl rounded-br-md bg-sky-500 text-[#06102a] text-sm px-3.5 py-2 whitespace-pre-wrap break-words">
                      {m.text}
                    </p>
                  </div>
                ) : m.role === "nav" ? (
                  <div key={m.id} className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => navigateTo(m.section, m.focus)}
                      className="flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 font-mono text-[11px] text-sky-300 hover:text-white hover:bg-sky-500/20 transition-colors duration-150"
                    >
                      <ArrowDownRight size={12} />
                      Showing {SECTION_LABELS[m.section]}
                      {m.focus ? ` · ${m.focus}` : ""}
                    </button>
                  </div>
                ) : (
                  <AssistantBubble key={m.id} text={m.text} />
                )
              )}
              {waiting && <TypingIndicator />}

              {showSuggestions && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {QUICK_ANSWERS.map((q) => (
                    <button
                      key={q.question}
                      type="button"
                      onClick={() => answerQuickly(q)}
                      className="rounded-full border border-sky-400/40 bg-(--surface) px-3 py-1.5 text-xs text-sky-200 hover:text-white hover:bg-sky-500/15 active:scale-[0.97] transition-[background-color,color,transform] duration-150"
                    >
                      {q.question}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <form
              className="flex items-center gap-2 border-t border-sky-400/20 bg-(--surface) px-3 py-3"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={MAX_INPUT}
                placeholder="Ask Migu about Miguel…"
                aria-label="Message Migu"
                className="flex-1 min-w-0 rounded-full border border-sky-400/30 bg-(--deep) px-4 py-2.5 text-sm text-white placeholder:text-sky-100/40 outline-none focus:border-sky-400/70"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="Send"
                className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-sky-500 text-[#06102a] hover:brightness-110 active:scale-95 transition-[filter,transform] duration-150 disabled:opacity-40 disabled:hover:bg-sky-500"
              >
                <SendHorizontal size={18} />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}

function AssistantBubble({ text }: { text: string }) {
  return (
    <div className="flex items-end gap-2">
      <div className="relative w-7 h-7 shrink-0">
        <Image src="/images/migu.svg" alt="" fill sizes="28px" unoptimized />
      </div>
      <div className="max-w-[80%] rounded-2xl rounded-bl-md border border-sky-400/20 bg-(--surface-2) px-3.5 py-2 text-sm text-sky-50 break-words [&_p]:my-0 [&_p+p]:mt-2 [&_strong]:text-white [&_ul]:list-disc [&_ul]:pl-4 [&_a]:text-sky-300 [&_a]:underline">
        <ReactMarkdown components={MARKDOWN_COMPONENTS}>{text}</ReactMarkdown>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2" role="status" aria-label="Migu is typing">
      <div className="relative w-7 h-7 shrink-0">
        <Image src="/images/migu.svg" alt="" fill sizes="28px" unoptimized />
      </div>
      <div className="flex gap-1 rounded-2xl rounded-bl-md border border-sky-400/20 bg-(--surface-2) px-3.5 py-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-sky-300"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}
