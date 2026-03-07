// app/data/UploadStat.tsx
"use client";

import React, { useRef, useState, useEffect } from "react";
import Card from "../Card";

type Summary = {
  incomeThisMonth: number;
  expenseThisMonth: number;
  variableSpentSoFar: number;
  fixedBills: number;
  plannedSavings: number;
  netWorthDelta: number | null;
  netWorthValue?: number | null;
};

type Upcoming = { text: string; category: string; dueDate: string };

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function UploadCard({
  onLoaded,
  onCategories,
  onUpcoming,
}: {
  onLoaded: (s: Summary) => void;
  onCategories?: (c: Record<string, number>) => void;
  onUpcoming?: (u: Upcoming[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [month, setMonth] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedMonth") || currentMonth();
    }
    return currentMonth();
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedMonth", month);
    }
  }, [month]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setLoading(true);
    setErr(null);

    try {
      const form = new FormData();
      form.append("file", file);

      const host =
        typeof window !== "undefined" ? window.location.hostname : "127.0.0.1";
      const qs = month ? `?month=${encodeURIComponent(month)}` : "";
      const res = await fetch(`http://${host}:8000/upload-statement${qs}`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();

      onLoaded(json.summary);
      onCategories?.(json.byCategory || {});
      onUpcoming?.(json.upcoming || []);
    } catch (e: any) {
      setErr(e.message || "Upload failed");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  // decide smaller font if filename is long
  const fileNameClass =
    (fileName?.length ?? 0) > 22 ? "text-[10px]" : "text-[11px]";

  return (
    <Card className="h-[96px] flex items-center justify-between">
      {/* min-w-0 lets the left side shrink so truncate can work */}
      <div className="min-w-0">
        <div className="text-sm text-zinc-300">Import Statement</div>
        <div className="text-[12px] text-zinc-400">CSV or XLSX • filter by month</div>

        {fileName && !loading && !err && (
          <div
            className={`${fileNameClass} text-zinc-500 mt-1 truncate max-w-[10rem] sm:max-w-[14rem]`}
            title={fileName} // show full name on long-press/hover
          >
            {fileName}
          </div>
        )}
        {loading && <div className="text-[11px] text-zinc-400 mt-1">Importing…</div>}
        {err && <div className="text-[11px] text-rose-400 mt-1">{err}</div>}
      </div>

      {/* shrink-0 keeps the controls fixed width and prevents being pushed out */}
      <div className="flex items-center gap-3 shrink-0">
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="text-sm bg-white/10 border border-white/15 rounded-md px-3 py-2
                     text-zinc-100 outline-none"
        />

        <div>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFile}
            className="hidden"
          />
          <button
            onClick={() => inputRef.current?.click()}
            className="px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-sm
                       hover:bg-white/15 active:scale-[.98]"
          >
            {loading ? "Importing…" : "Import CSV/XLSX"}
          </button>
        </div>
      </div>
    </Card>
  );
}