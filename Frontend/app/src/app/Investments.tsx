"use client";

import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  type ChartOptions,
} from "chart.js";

// Register only the Chart.js components we actually use
// This keeps the bundle size smaller than registering everything
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
);

// ── Types ─────────────────────────────────────────────────────────────────────

interface InvestmentProps {
  labels?: string[]; // X-axis labels (e.g. ["Jan", "Feb", ...])
  values?: number[]; // Portfolio values matching each label
  total?: number; // Current total portfolio value to display
  delta?: number; // Percentage change as decimal (e.g. 0.024 = +2.4%)
  currencySymbol?: string; // Currency prefix (default: ₹)
}

// ── Constants ─────────────────────────────────────────────────────────────────

// Shared chart line styling
const LINE_COLOR = "#36a2eb";
const LINE_FILL_COLOR = "rgba(54, 162, 235, 0.15)";

// Chart axis/tick configuration — static, no need to recompute per render
const CHART_OPTIONS: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false, // Allows Tailwind height classes to control chart size
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
  },
  scales: {
    x: {
      ticks: {
        color: "#94a3b8", // slate-400
        maxRotation: 0,
        minRotation: 0,
        font: { size: 10 },
      },
      grid: { display: false },
    },
    y: {
      display: false, // Hide Y axis — values shown in the summary below
      grid: { display: false },
    },
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Displays a mini investment portfolio chart with total value and % change.
 * Designed to sit inside a Card component (no inner padding/shadow needed).
 * Falls back to sample data when no props are provided.
 */
export default function Investment({
  labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  values = [5000, 5200, 5100, 5500, 5670, 5800],
  total = 5670,
  delta = 0.024,
  currencySymbol = "₹",
}: InvestmentProps) {
  // Build chart dataset from props
  const chartData = {
    labels,
    datasets: [
      {
        label: "Portfolio Value",
        data: values,
        borderColor: LINE_COLOR,
        backgroundColor: LINE_FILL_COLOR,
        tension: 0.1,
        borderWidth: 2,
        pointRadius: 0, // Hide individual data points for a cleaner sparkline look
        fill: false,
      },
    ],
  };

  // Positive delta = green, negative = red
  const deltaColor = delta >= 0 ? "text-emerald-400" : "text-rose-400";
  const deltaLabel = `${delta >= 0 ? "+" : ""}${(delta * 100).toFixed(1)}%`;

  return (
    <div className="space-y-2">
      {/* Section label */}
      <h3 className="text-sm text-zinc-300">Investment Portfolio</h3>

      {/* Sparkline chart */}
      <div className="w-full h-24">
        <Line data={chartData} options={CHART_OPTIONS} />
      </div>

      {/* Total value and percentage change on the same row */}
      <div className="flex items-baseline justify-between">
        <div className="text-[18px] font-semibold">
          {currencySymbol}
          {total.toLocaleString()}
        </div>
        <div className={`text-[13px] ${deltaColor}`}>{deltaLabel}</div>
      </div>
    </div>
  );
}
