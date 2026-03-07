// src/Investment.tsx
"use client";

import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const data = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Portfolio Value",
      data: [5000, 5200, 5100, 5500, 5670, 5800],
      borderColor: "#36a2eb",
      backgroundColor: "rgba(54,162,235,0.15)",
      tension: 0.1,
      borderWidth: 2,
      pointRadius: 0,
      fill: false,
    },
  ],
};

const options: any = {
  responsive: true,
  maintainAspectRatio: false, // respect Tailwind height
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
      display: false,
      grid: { display: false },
    },
  },
};

export default function Investment() {
  const total = 5670;
  const delta = 0.024; // +2.4%

  return (
    // No bg/rounded/shadow/padding here — Card provides the styling
    <div className="space-y-2">
      <h3 className="text-sm text-zinc-300">Investment Portfolio</h3>

      <div className="w-full h-24">
        <Line data={data} options={options} />
      </div>

      {/* Amount and delta on the same line */}
      <div className="flex items-baseline justify-between">
        <div className="text-[18px] font-semibold">${total.toLocaleString()}</div>
        <div className={`text-[13px] ${delta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
          {delta >= 0 ? "+" : ""}
          {(delta * 100).toFixed(1)}%
        </div>
      </div>
    </div>
  );
}