// app/Card.tsx (or wherever your Card lives)
import React from "react";

type Props = {
  // props-based usage
  title?: string;
  value?: React.ReactNode;
  subtitle?: React.ReactNode;
  // or children-based usage
  children?: React.ReactNode;
  className?: string;
};

export default function Card({ children, className = "", title, value, subtitle }: Props) {
  return (
    <div
      className={[
        "rounded-2xl border border-white/10",
        "bg-white/[0.05] backdrop-blur-md",
        "shadow-[0_8px_24px_rgba(0,0,0,0.35)]",
        "p-4",
        "overflow-hidden",            // <- add this
        className,
      ].join(" ")}
    >
      {title !== undefined || value !== undefined ? (
        <div>
          {title && <div className="text-sm text-zinc-400">{title}</div>}
          {value !== undefined && (
            <div className="text-[28px] font-bold tracking-[-0.5px] mt-1">{value}</div>
          )}
          {subtitle && <div className="text-[12px] text-zinc-400 mt-1">{subtitle}</div>}
        </div>
      ) : (
        children
      )}
    </div>
  );
}