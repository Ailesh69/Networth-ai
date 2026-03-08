"use client";

import React from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  type ChartOptions,
} from "chart.js";

// Register only the Chart.js elements needed for a doughnut chart
ChartJS.register(ArcElement, Tooltip);

// ── Constants ─────────────────────────────────────────────────────────────────

// Maximum number of spending categories to display in the chart
const MAX_SEGMENTS = 3;

// Color palette for chart segments — add more colors if MAX_SEGMENTS increases
const PALETTE = ["#ffce56", "#36a2eb", "#ff6384", "#a78bfa", "#34d399"];

// Fallback segments shown when no real category data is available
const DEFAULT_SEGMENTS = [
  { name: "Travel", value: 800, color: "#ffce56" }, // Yellow
  { name: "Grocery", value: 450, color: "#36a2eb" }, // Blue
  { name: "Education", value: 200, color: "#ff6384" }, // Red
];

// Static chart config — defined outside component to avoid recreating on every render
const CHART_OPTIONS: ChartOptions<"doughnut"> = {
  responsive: true,
  cutout: "70%", // Creates the hollow center for the total label
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }, // Custom legend rendered below the chart
  },
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface SpendingProps {
  categories?: Record<string, number>; // Category name → amount spent
  currencySymbol?: string; // Currency prefix (default: ₹)
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Displays a doughnut chart of the top spending categories.
 * Shows the total spent in the center of the chart.
 * Falls back to demo data when no categories are provided.
 * Designed to sit inside a Card component (no inner padding/shadow needed).
 */
export default function Spending({
  categories = {},
  currencySymbol = "₹",
}: SpendingProps) {
  // Pick the top N categories by spend amount
  const topEntries = Object.entries(categories)
    .sort(([, a], [, b]) => b - a)
    .slice(0, MAX_SEGMENTS);

  // Build chart segments from real data, or fall back to defaults
  const segments =
    topEntries.length > 0
      ? topEntries.map(([name, value], i) => ({
          name,
          value: Math.max(0, Number(value) || 0), // Clamp negatives and NaN to 0
          color: PALETTE[i % PALETTE.length],
        }))
      : DEFAULT_SEGMENTS;

  // Total spend shown in the center of the donut
  const totalSpent = segments.reduce((sum, s) => sum + s.value, 0);

  // Build Chart.js data object from segments
  const chartData = {
    labels: segments.map((s) => s.name),
    datasets: [
      {
        data: segments.map((s) => s.value),
        backgroundColor: segments.map((s) => s.color),
        hoverBackgroundColor: segments.map((s) => s.color),
        borderWidth: 0, // Remove white ring between segments
      },
    ],
  };

  return (
    <div className="space-y-2">
      {/* Section label */}
      <h3 className="text-sm text-zinc-300">Spending</h3>

      {/* Doughnut chart with total spend label centered inside */}
      <div className="relative w-full h-36">
        <Doughnut data={chartData} options={CHART_OPTIONS} />

        {/* Centered overlay — shows total spent inside the donut hole */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-lg font-semibold">
            {currencySymbol}
            {Math.round(totalSpent).toLocaleString()}
          </p>
          <p className="text-[11px] text-zinc-400 -mt-0.5">spent</p>
        </div>
      </div>

      {/* Custom legend — one dot + label per category */}
      <div className="flex items-center justify-center gap-4 flex-wrap text-[11px] text-zinc-400">
        {segments.map((s) => (
          <div key={s.name} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <span>{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
