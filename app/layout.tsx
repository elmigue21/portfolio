import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import { Lalezar } from "next/font/google";
// import Head from "next/head";
import "./globals.css";
import { Toaster } from "sonner";
import SplashScreen from "@/components/SplashScreen";
import TransitionOverlay from "@/components/TransitionOverlay";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import {
  PERSON_NAME,
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
  personJsonLd,
} from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s · ${PERSON_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: PERSON_NAME,
  authors: [{ name: PERSON_NAME, url: SITE_URL }],
  creator: PERSON_NAME,
  keywords: [
    PERSON_NAME,
    "Miguel Caacbay",
    "MJ Caacbay",
    "Junior Developer",
    "Full Stack Developer",
    "Mobile Developer",
    "Hirolabz",
    "Adamson University",
    "Computer Science",
    "Philippines",
    "Next.js",
    "React",
    "portfolio",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: "/",
    siteName: PERSON_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_PH",
    firstName: "Miguel John",
    lastName: "Caacbay",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

const lalezar = Lalezar({
  weight: "400", // Lalezar only has one weight
  subsets: ["latin"],
  variable: "--font-lalezar", // we will use this in Tailwind
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: the theme script may add "light" before React loads.
    <html lang="en" className={lalezar.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="w-full">
        <script
          type="application/ld+json"
          // Static data from our own constants; nothing user-supplied.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <SplashScreen />
        <TransitionOverlay />
        {children}
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}
