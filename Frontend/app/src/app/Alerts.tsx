"use client";

import React from 'react';

type Item = { text: string; category?: string; dueDate?: string };

function colorForCategory(cat?: string) {
  const k = (cat || "").toLowerCase();
  if (k.includes("rent")) return "#ef4444";
  if (k.includes("emi")) return "#a855f7";
  if (k.includes("util")) return "#f59e0b";
  if (k.includes("subscr")) return "#22c55e";
  if (k.includes("insur")) return "#38bdf8";
  return "#3b82f6";
}

export default function Alerts({ items = [] as Item[] }) {
  const list = items.map(i => ({
    ...i,
    dateLabel: i.dueDate ? new Date(i.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""
  }));

  return (
    <div className="space-y-3">
      <h3 className="text-[14px] text-zinc-300 leading-tight">
        <span className="whitespace-nowrap">Upcoming Bills</span>
        <br />
        <span>&amp; Alerts</span>
      </h3>

      {list.length === 0 ? (
        <div className="text-[12px] text-zinc-400">No upcoming bills for the rest of the month.</div>
      ) : (
        <div className="flex flex-col divide-y divide-white/10">
          {list.map((a, idx) => (
            <div key={idx} className="py-2.5">
              <div className="flex items-start gap-3">
                <span className="h-2.5 w-2.5 rounded-full mt-1" style={{ backgroundColor: colorForCategory(a.category) }} />
                <div className="flex-1">
                  <p className="text-[15px] leading-snug">{a.text}</p>
                  {a.dateLabel && <p className="text-[12px] text-zinc-400 mt-0.5">{a.dateLabel}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}