const techStacks = [
  {
    stack: "nextjs",
    extension: "png",
    tooltip: "Next.js",
    alt: "Next.js logo",
  },
  {
    stack: "nodejs",
    extension: "png",
    tooltip: "Node.js",
    alt: "Node.js logo",
  },
  { stack: "reactjs", extension: "png", tooltip: "React", alt: "React logo" },
  {
    stack: "expressjs",
    extension: "png",
    tooltip: "Express.js",
    alt: "Express.js logo",
  },
  { stack: "github", extension: "jpg", tooltip: "GitHub", alt: "GitHub logo" },
  { stack: "git", extension: "png", tooltip: "Git", alt: "Git logo" },
  {
    stack: "typescript",
    extension: "jpg",
    tooltip: "TypeScript",
    alt: "TypeScript logo",
  },
  {
    stack: "tailwind",
    extension: "jpg",
    tooltip: "Tailwind CSS",
    alt: "Tailwind CSS logo",
  },
  {
    stack: "supabase",
    extension: "jpg",
    tooltip: "Supabase",
    alt: "Supabase logo",
  },
  {
    stack: "firebase",
    extension: "png",
    tooltip: "Firebase",
    alt: "Firebase logo",
  },
  {
    stack: "mongodb",
    extension: "png",
    tooltip: "MongoDB",
    alt: "MongoDB logo",
  },
  { stack: "mysql", extension: "png", tooltip: "MySQL", alt: "MySQL logo" },
  { stack: "csharp", extension: "png", tooltip: "C#", alt: "C# logo" },
  { stack: "vue", extension: "jpg", tooltip: "Vue", alt: "Vue logo" },
  { stack: "javascript", extension: "jpg", tooltip: "Javascript", alt: "JS logo" },
];

export function getStackExtension(stacks: string[]) {
  return techStacks.filter((stackObj) =>
    stacks.some(
      (input) => input.trim().toLowerCase() === stackObj.stack.toLowerCase()
    )
  );
}

