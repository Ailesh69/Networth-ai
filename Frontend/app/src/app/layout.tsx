import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

// ── Font Setup ────────────────────────────────────────────────────────────────

// Using --font-ui instead of --font-sans to avoid conflicts with
// Tailwind's built-in --font-sans variable. globals.css maps
// --font-ui → --font-sans so Tailwind's `font-sans` utility still works.
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-ui",
  weight: ["400", "500", "600", "700", "800"],
});

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Networth AI",
  description: "Personal CFO",
};

// ── Root Layout ───────────────────────────────────────────────────────────────

/**
 * Root layout wraps every page in the app.
 * Sets the global font, background, and base meta tags.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* Ensure proper scaling on mobile and respect notch/safe areas */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        {/* Browser chrome color on mobile (matches --background in globals.css) */}
        <meta name="theme-color" content="#060B16" />
      </head>
      <body
        className={`${manrope.variable} font-sans antialiased bg-background text-white min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
