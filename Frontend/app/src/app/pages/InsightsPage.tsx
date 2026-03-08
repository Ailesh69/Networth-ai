import React, { useState } from "react";
import StatusBar from "../components/StatusBar";
import NavBar from "../components/NavBar";
import StockChart from "../components/StockChart";
import StockSelector from "../components/StockSelector";
import { UploadStatementResponse } from "../services/api";

// ── Types ─────────────────────────────────────────────────────────────────────

interface InsightsPageProps {
  active: string;
  setCurrentPage: (page: string) => void;
  financialData: UploadStatementResponse | null;
}

// ── Constants ─────────────────────────────────────────────────────────────────

// Colors used for spending category progress bars
const CATEGORY_COLORS = [
  "#F59E0B", // Amber
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#10B981", // Emerald
  "#8B5CF6", // Purple
  "#F97316", // Orange
];

// Maximum number of spending categories to show in the trends section
const MAX_CATEGORIES = 5;

// Default stock shown in the market chart on first load
const DEFAULT_STOCK = "AAPL";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Formats a number as Indian Rupee currency string.
 * e.g. 10000 → "₹10,000"
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Returns a color from CATEGORY_COLORS by index (wraps around if needed).
 */
function getCategoryColor(index: number): string {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Insights page — shows monthly financial summary, spending trends,
 * AI recommendations placeholder, and a live stock market chart.
 * financialData is passed from page.tsx so it stays in sync with HomePage.
 */
const InsightsPage: React.FC<InsightsPageProps> = ({
  active,
  setCurrentPage,
  financialData,
}) => {
  const [selectedStock, setSelectedStock] = useState<string>(DEFAULT_STOCK);

  // ── Derived Data ────────────────────────────────────────────────────────────

  /**
   * Savings rate as a percentage of income.
   * Returns 0 if no data or income is zero.
   */
  const savingsRate = (() => {
    if (!financialData) return 0;
    const { incomeThisMonth, expenseThisMonth } = financialData.summary;
    return incomeThisMonth > 0
      ? ((incomeThisMonth - expenseThisMonth) / incomeThisMonth) * 100
      : 0;
  })();

  // Top N categories sorted by spend amount, with percentage of total pre-calculated
  const topCategories = (() => {
    if (!financialData) return [];
    const total = Object.values(financialData.byCategory).reduce(
      (sum, v) => sum + v,
      0,
    );
    return Object.entries(financialData.byCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, MAX_CATEGORIES)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      }));
  })();

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background text-white">
      <StatusBar />

      <div className="px-6 py-6">
        <h1 className="text-2xl font-bold mb-6">Financial Insights</h1>

        <div className="space-y-6 mb-20">
          {/* ── Monthly Summary ─────────────────────────────────────────── */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <h3 className="font-medium mb-4">This Month&apos;s Summary</h3>
            {financialData ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Income</span>
                  <span className="text-green-400 font-semibold">
                    +{formatCurrency(financialData.summary.incomeThisMonth)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Expenses</span>
                  <span className="text-red-400 font-semibold">
                    -{formatCurrency(financialData.summary.expenseThisMonth)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Savings Rate</span>
                  <span className="text-blue-400 font-semibold">
                    {savingsRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-zinc-400 text-sm">
                No data available. Upload a statement on the Home page to see
                insights.
              </p>
            )}
          </div>

          {/* ── Spending Trends ─────────────────────────────────────────── */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <h3 className="font-medium mb-4">Spending Trends</h3>
            {topCategories.length > 0 ? (
              <div className="space-y-4">
                {topCategories.map(
                  ({ category, amount, percentage }, index) => (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{category}</span>
                        <span className="text-zinc-400">
                          {formatCurrency(amount)}
                        </span>
                      </div>
                      {/* Progress bar width and color based on share of total spend */}
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: getCategoryColor(index),
                          }}
                        />
                      </div>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <p className="text-zinc-400 text-sm">
                No spending data available.
              </p>
            )}
          </div>

          {/* ── AI Recommendations (Coming Soon) ────────────────────────── */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <h3 className="font-medium mb-4">AI Recommendations</h3>
            <div className="text-center py-8 space-y-1">
              <p className="text-zinc-400 text-sm">
                AI recommendations coming soon!
              </p>
              <p className="text-zinc-500 text-xs">
                Personalized insights based on your spending patterns.
              </p>
            </div>
          </div>

          {/* ── Stock Market Chart ───────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Market Analysis</h3>
              <StockSelector
                selectedStock={selectedStock}
                onStockChange={setSelectedStock}
              />
            </div>
            <StockChart symbol={selectedStock} days={30} />
          </div>
        </div>
      </div>

      <NavBar active={active} setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default InsightsPage;
