import { Toaster } from "@/components/ui/sonner";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { Lexend, Fira_Code } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SpeedInsights } from '@vercel/speed-insights/next';
import {Analytics} from '@vercel/analytics/next'

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-sans",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "OpenGPT",
  description: "Open Source ChatGPT alternative",
  openGraph: {
    title: "OpenGPT",
    description: "Open Source ChatGPT alternative",
    url: "https://opengpt-thaletto.vercel.app",
    siteName: "OpenGPT",
    images: [
      {
        url: "https://raw.githubusercontent.com/thaletto/thaletto/refs/heads/main/public/projects/opengpt.jpeg",
        width: 1200,
        height: 630,
        alt: "OpenGPT - Open Source ChatGPT alternative",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenGPT",
    description: "Open Source ChatGPT alternative",
    images: ["https://raw.githubusercontent.com/thaletto/thaletto/refs/heads/main/public/projects/opengpt.jpeg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${lexend.variable} ${firaCode.variable} font-sans`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Toaster />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
