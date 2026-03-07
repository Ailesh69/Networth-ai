"use client";

import React from 'react';

export default function Goals() {
  const progress = 68; // % progress
  const percent = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    // No inner bg/shadow/padding — Card provides the styling
    <div className="space-y-2">
      <h3 className="text-sm text-zinc-300">Goal Progress ⌛</h3>

      <p className="text-[14px] font-medium">Europe Trip</p>

      {/* Percentage label aligned left, right above the bar */}
      <div className="text-[18px] font-semibold text-green-400 mb-1">
        {percent}%
      </div>

      {/* Progress bar */}
      <div
        className="w-full h-3 rounded-full bg-zinc-700/50 overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div
          className="h-full rounded-full bg-green-500 transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Helper line in neutral white */}
      <p className="text-[12px] text-white">
        Add $50 this week to stay on track
      </p>
    </div>
  );
}