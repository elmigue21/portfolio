import { techIcons } from "@/components/TechIcon";
import { contacts, jobs, stackCategories } from "@/constants/constants";
import type { NavSection } from "@/lib/migu";

// Answers for Migu's starter chips, built from the site's own data so they
// cost no AI tokens and stay in sync with the content. Typed questions still
// go to the AI.

export type QuickAnswer = {
  question: string;
  answer: string;
  navigate: { section: NavSection; focus?: string };
};

const labels = (keys: string[]) => keys.map((k) => techIcons[k]?.label ?? k).join(", ");
const current = jobs.find((j) => !j.end) ?? jobs[0];
const previous = jobs.find((j) => j !== current);
const link = (name: string) => {
  const c = contacts.find((x) => x.name === name);
  return c ? `[${name}](${c.link})` : name;
};

export const QUICK_ANSWERS: QuickAnswer[] = [
  {
    question: "Where does Miguel work?",
    answer:
      `Miguel is a **${current.role} at ${current.name}**.` +
      (previous ? ` Before that, he was a ${previous.role} at ${previous.name}.` : ""),
    navigate: { section: "work-experience", focus: current.name },
  },
  {
    question: "Show me his projects",
    answer: "Here they are! Keep scrolling to spin the ring and see each project up close.",
    navigate: { section: "projects" },
  },
  {
    question: "What's his tech stack?",
    answer:
      `**Frontend:** ${labels(stackCategories.frontend)}.\n\n` +
      `**Backend:** ${labels(stackCategories.backend)}.`,
    navigate: { section: "tech-stack" },
  },
  {
    question: "How can I contact him?",
    answer: `You can reach Miguel on ${link("GitHub")} or ${link("LinkedIn")}, or try the terminal below.`,
    navigate: { section: "contacts" },
  },
];
