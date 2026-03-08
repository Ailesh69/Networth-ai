"use client";

import React from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface GoalsProps {
  goalName?: string; // Name of the savings goal (e.g. "Europe Trip")
  progress?: number; // Progress percentage (0–100)
  helperText?: string; // Motivational tip shown below the bar
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Displays a single savings goal with a progress bar and helper tip.
 * Progress value is clamped between 0 and 100 regardless of input.
 * Designed to sit inside a Card component (no inner padding/shadow needed).
 */
export default function Goals({
  goalName = "Europe Trip",
  progress = 0,
  helperText = "Set a goal to get started!",
}: GoalsProps) {
  // Clamp progress to valid range (0–100) and round to nearest integer
  const percent = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <div className="space-y-2">
      {/* Section label */}
      <h3 className="text-sm text-zinc-300">Goal Progress ⌛</h3>

      {/* Goal name */}
      <p className="text-[14px] font-medium">{goalName}</p>

      {/* Percentage label — shown above the bar */}
      <div className="text-[18px] font-semibold text-green-400 mb-1">
        {percent}%
      </div>

      {/* Accessible progress bar */}
      <div
        className="w-full h-3 rounded-full bg-zinc-700/50 overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={`${goalName} progress: ${percent}%`}
      >
        {/* Filled portion — animates smoothly when percent changes */}
        <div
          className="h-full rounded-full bg-green-500 transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Motivational helper tip */}
      <p className="text-[12px] text-white">{helperText}</p>
    </div>
  );
}
