"use client";

import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

// fallback (your original segments)
const defaultSegments = [
  { name: "Travel", value: 800, color: "#ffce56" },     // yellow
  { name: "Grocery", value: 450, color: "#36a2eb" },    // blue
  { name: "Education", value: 200, color: "#ff6384" },  // red
];

// extra colors if more categories are used later
const palette = ["#ffce56", "#36a2eb", "#ff6384", "#a78bfa", "#34d399"];

// accept categories as a prop
type SpendingProps = {
  categories?: Record<string, number>;
};

export default function Spending({ categories = {} }: SpendingProps) {
  // Build segments from categories (top 3), or use defaults
  const topEntries = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const segments =
    topEntries.length > 0
      ? topEntries.map(([name, value], i) => ({
          name,
          value: Math.max(0, Number(value) || 0),
          color: palette[i % palette.length],
        }))
      : defaultSegments;

  const data = {
    labels: segments.map((s) => s.name),
    datasets: [
      {
        data: segments.map((s) => s.value),
        backgroundColor: segments.map((s) => s.color),
        hoverBackgroundColor: segments.map((s) => s.color),
        borderWidth: 0, // no white ring
      },
    ],
  };

  const options: any = {
    responsive: true,
    cutout: "70%",
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // we render our own legend below
    },
  };

  const totalSpent = segments.reduce((sum, s) => sum + s.value, 0);

  return (
    // No bg/rounded/shadow/padding here — Card provides the styling
    <div className="space-y-2">
      <h3 className="text-sm text-zinc-300">Spending</h3>

      {/* Donut chart with centered label */}
      <div className="relative w-full h-36">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-lg font-semibold">
            ${Math.round(totalSpent || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-zinc-400 -mt-0.5">spent</p>
        </div>
      </div>

      {/* Custom legend below the chart */}
      <div className="flex items-center justify-center gap-4 flex-wrap text-[11px] text-zinc-400">
        {segments.map((s) => (
          <div key={s.name} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span>{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}