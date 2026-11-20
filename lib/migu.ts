// Migu: Miguel's AI agent. Shared by the chat API (server) and chat panel (client).

// Sections Migu can take the visitor to. Ids match the section elements on the page.
export const NAV_SECTIONS = [
  "tech-stack",
  "projects",
  "work-experience",
  "extracurricular",
  "contacts",
] as const;
export type NavSection = (typeof NAV_SECTIONS)[number];

export const SECTION_LABELS: Record<NavSection, string> = {
  "tech-stack": "Tech Stack",
  projects: "Projects",
  "work-experience": "Work Experience",
  extracurricular: "Extra-Curricular Activities",
  contacts: "Links & Contacts",
};

export const isNavSection = (s: unknown): s is NavSection =>
  typeof s === "string" && (NAV_SECTIONS as readonly string[]).includes(s);

// Events streamed from /api/ask to the chat panel, one JSON object per line.
export type ChatEvent =
  | { type: "text"; text: string }
  | { type: "navigate"; section: NavSection; focus?: string };

export const MIGU_WELCOME =
  "Hi, I'm **Migu**, Miguel's AI agent. Ask me anything about his work, projects or skills, and I can take you straight to the right part of the page.";
