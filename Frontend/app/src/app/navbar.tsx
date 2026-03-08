"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, TrendingUp, Settings } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType; // Lucide icon component
}

// ── Constants ─────────────────────────────────────────────────────────────────

// Add or remove nav items here — icon, label, and route in one place
const NAV_ITEMS: NavItem[] = [
  { name: "Home", href: "/", icon: Home },
  { name: "Chat", href: "/chat", icon: MessageCircle },
  { name: "Insights", href: "/insights", icon: TrendingUp },
  { name: "Settings", href: "/settings", icon: Settings },
];

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Fixed bottom navigation bar.
 * Highlights the active route based on the current pathname.
 * Uses Next.js Link for client-side navigation.
 */
export default function Navbar() {
  // Get current route to determine which nav item is active
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full border-t border-white/10 bg-[#0A0F1E]/90 backdrop-blur-md text-white">
      <div className="flex justify-around items-center px-2 py-3">
        {NAV_ITEMS.map(({ name, href, icon: Icon }) => {
          // Mark item as active if current path matches its href
          const isActive = pathname === href;

          return (
            <Link
              key={name}
              href={href}
              className={`flex flex-col items-center gap-1 text-xs transition-colors duration-150 ${
                isActive
                  ? "text-white" // Active: full white
                  : "text-zinc-500 hover:text-zinc-300" // Inactive: muted
              }`}
            >
              {/* Nav icon — slightly larger when active */}
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              {/* Nav label */}
              <span className={isActive ? "font-semibold" : "font-normal"}>
                {name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
