import { contacts, stackCategories } from "@/constants/constants";
import { techIcons } from "@/components/TechIcon";

// The site's public address, used for canonical URLs, the sitemap and share
// cards. Set NEXT_PUBLIC_SITE_URL if you use a custom domain; otherwise Vercel's
// production URL is used automatically.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/+$/, "");

export const PERSON_NAME = "Miguel John Caacbay";

export const SITE_TITLE = `${PERSON_NAME} — Junior Developer | Portfolio`;

export const SITE_DESCRIPTION =
  "Miguel John Caacbay is a Junior Developer at Hirolabz and a Computer Science student at Adamson University in the Philippines, building web and mobile apps with Next.js, React and Node.js.";

const sameAs = contacts.map((c) => c.link);

const skills = [...stackCategories.frontend, ...stackCategories.backend]
  .map((s) => techIcons[s]?.label)
  .filter(Boolean);

// Structured data so search engines understand who this site is about.
export const personJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: PERSON_NAME,
      alternateName: ["Miguel Caacbay", "MJ Caacbay"],
      url: SITE_URL,
      image: `${SITE_URL}/opengraph-image`,
      jobTitle: "Junior Developer",
      worksFor: { "@type": "Organization", name: "Hirolabz" },
      alumniOf: { "@type": "CollegeOrUniversity", name: "Adamson University" },
      address: { "@type": "PostalAddress", addressCountry: "PH" },
      knowsAbout: skills,
      award: "Silver Awardee, Startup QC Student Competition Squad 3 (2026)",
      sameAs,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: PERSON_NAME,
      about: { "@id": `${SITE_URL}/#person` },
    },
  ],
};
