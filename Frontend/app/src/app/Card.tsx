import React from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CardProps {
  // — Props-based usage: pass title/value/subtitle for a standard metric card
  title?: string;
  value?: React.ReactNode;
  subtitle?: React.ReactNode;
  // — Children-based usage: pass children for fully custom card content
  children?: React.ReactNode;
  className?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Generic glassmorphism card container with two usage modes:
 *
 * 1. Props-based — renders a standard metric layout (title, value, subtitle):
 *    <Card title="Income" value="₹10,000" subtitle="+12% this month" />
 *
 * 2. Children-based — renders custom content inside the card shell:
 *    <Card><MyCustomContent /></Card>
 *
 * Props-based mode takes priority if title or value is provided.
 */
export default function Card({
  children,
  className = "",
  title,
  value,
  subtitle,
}: CardProps) {
  // Use props-based layout if either title or value is provided
  const isMetricCard = title !== undefined || value !== undefined;

  return (
    <div
      className={[
        "rounded-2xl border border-white/10",
        "bg-white/[0.05] backdrop-blur-md",
        "shadow-[0_8px_24px_rgba(0,0,0,0.35)]",
        "overflow-hidden",
        "p-4",
        className,
      ].join(" ")}
    >
      {isMetricCard ? (
        // Standard metric card layout
        <div>
          {/* Optional label above the value */}
          {title && <div className="text-sm text-zinc-400">{title}</div>}

          {/* Primary metric value — large and bold */}
          {value !== undefined && (
            <div className="text-[28px] font-bold tracking-[-0.5px] mt-1">
              {value}
            </div>
          )}

          {/* Optional supporting text below the value */}
          {subtitle && (
            <div className="text-[12px] text-zinc-400 mt-1">{subtitle}</div>
          )}
        </div>
      ) : (
        // Custom content mode — render children as-is
        children
      )}
    </div>
  );
}
