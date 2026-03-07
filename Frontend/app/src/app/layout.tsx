import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

// Use a unique CSS var for Next/font (not --font-sans)
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-ui",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Networth AI",
  description: "Personal CFO",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#0B1220" />
      </head>
      <body
        className={`${manrope.variable} font-sans antialiased bg-[#0B1220] text-white min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}