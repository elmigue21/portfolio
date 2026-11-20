import type { IconType } from "react-icons";
import {
  SiExpress,
  SiFirebase,
  SiGit,
  SiGithub,
  SiJavascript,
  SiLaravel,
  SiMongodb,
  SiNextdotjs,
  SiNodedotjs,
  SiReact,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
  SiVuedotjs,
} from "react-icons/si";
import { TbBrandCSharp } from "react-icons/tb";
import { GrMysql } from "react-icons/gr";

// Icon-only brand marks keyed by the `stack` names in constants.
// Brands whose mark is black use --icon-mono: white on dark, navy on light.
// Pale brand colours (yellow, cyan…) get a deeper `light` shade for light mode.
export const techIcons: Record<string, { icon: IconType; color: string; light?: string; label: string }> = {
  nextjs: { icon: SiNextdotjs, color: "var(--icon-mono)", label: "Next.js" },
  nodejs: { icon: SiNodedotjs, color: "#5FA04E", light: "#3f7f32", label: "Node.js" },
  reactjs: { icon: SiReact, color: "#61DAFB", light: "#0e7fa8", label: "React" },
  expressjs: { icon: SiExpress, color: "var(--icon-mono)", label: "Express.js" },
  github: { icon: SiGithub, color: "var(--icon-mono)", label: "GitHub" },
  git: { icon: SiGit, color: "#F05032", label: "Git" },
  typescript: { icon: SiTypescript, color: "#3178C6", label: "TypeScript" },
  tailwind: { icon: SiTailwindcss, color: "#06B6D4", light: "#0891b2", label: "Tailwind CSS" },
  supabase: { icon: SiSupabase, color: "#3FCF8E", light: "#1f8f5a", label: "Supabase" },
  firebase: { icon: SiFirebase, color: "#FFCA28", light: "#d97706", label: "Firebase" },
  mongodb: { icon: SiMongodb, color: "#47A248", light: "#2f7d32", label: "MongoDB" },
  mysql: { icon: GrMysql, color: "#5B9BD5", light: "#2f6fa8", label: "MySQL" },
  laravel: { icon: SiLaravel, color: "#FF2D20", label: "Laravel" },
  csharp: { icon: TbBrandCSharp, color: "#B37BD6", light: "#7e3fa8", label: "C#" },
  vue: { icon: SiVuedotjs, color: "#4FC08D", light: "#2f8a5f", label: "Vue" },
  javascript: { icon: SiJavascript, color: "#F7DF1E", light: "#b98a00", label: "JavaScript" },
};

export default function TechIcon({
  stack,
  size = 24,
  className,
}: {
  stack: string;
  size?: number;
  className?: string;
}) {
  const entry = techIcons[stack];
  if (!entry) return null;
  const Icon = entry.icon;
  return (
    <Icon
      size={size}
      // light-dark() follows the theme, including dark-only scenes (.force-dark).
      color={entry.light ? `light-dark(${entry.light}, ${entry.color})` : entry.color}
      className={className}
      aria-label={entry.label}
      role="img"
    />
  );
}
