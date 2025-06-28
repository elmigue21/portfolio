import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import { Lalezar } from "next/font/google";
// import Head from "next/head";
import "./globals.css";


export const metadata: Metadata = {
  title: "PORTFOLIO - Miguel John Caacbay",
  description: "Portfolio",
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
    <html lang="en" className={lalezar.variable}>
      <body>{children}</body>
    </html>
  );
}
