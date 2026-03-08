"use client";

import React from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Item {
  text: string;
  category?: string;
  dueDate?: string;
}

interface AlertsProps {
  items?: Item[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

// Maps category keywords to their indicator dot colors
const CATEGORY_COLORS: Record<string, string> = {
  rent: "#ef4444", // Red
  emi: "#a855f7", // Purple
  util: "#f59e0b", // Amber
  subscr: "#22c55e", // Green
  insur: "#38bdf8", // Sky blue
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns a color hex code based on the bill category keyword.
 * Falls back to blue if no category matches.
 */
function getColorForCategory(category?: string): string {
  const normalized = (category || "").toLowerCase();

  for (const [keyword, color] of Object.entries(CATEGORY_COLORS)) {
    if (normalized.includes(keyword)) return color;
  }

  return "#3b82f6"; // Default blue
}

/**
 * Formats an ISO date string into a short readable label (e.g. "Aug 28").
 * Returns an empty string if no date is provided.
 */
function formatDueDate(dueDate?: string): string {
  if (!dueDate) return "";
  return new Date(dueDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Displays a list of upcoming bills and alerts with color-coded category indicators.
 * Shows a fallback message when no bills are present.
 */
export default function Alerts({ items = [] }: AlertsProps) {
  return (
    <div className="space-y-3">
      {/* Section heading */}
      <h3 className="text-[14px] text-zinc-300 leading-tight">
        <span className="whitespace-nowrap">Upcoming Bills</span>
        <br />
        <span>&amp; Alerts</span>
      </h3>

      {items.length === 0 ? (
        // Empty state
        <p className="text-[12px] text-zinc-400">
          No upcoming bills for the rest of the month.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-white/10">
          {items.map((item, idx) => (
            <div key={idx} className="py-2.5">
              <div className="flex items-start gap-3">
                {/* Color dot indicating bill category */}
                <span
                  className="h-2.5 w-2.5 rounded-full mt-1 shrink-0"
                  style={{
                    backgroundColor: getColorForCategory(item.category),
                  }}
                />

                <div className="flex-1">
                  {/* Bill name */}
                  <p className="text-[15px] leading-snug">{item.text}</p>

                  {/* Due date label, only shown if date exists */}
                  {formatDueDate(item.dueDate) && (
                    <p className="text-[12px] text-zinc-400 mt-0.5">
                      {formatDueDate(item.dueDate)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
