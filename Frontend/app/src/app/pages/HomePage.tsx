import React, { useState, useRef, useMemo } from "react";
import StatusBar from "../components/StatusBar";
import NavBar from "../components/NavBar";
import { apiService, UploadStatementResponse } from "../services/api";

// ── Types ─────────────────────────────────────────────────────────────────────

interface HomePageProps {
  active: string;
  setCurrentPage: (page: string) => void;
  displayName?: string;
  financialData: UploadStatementResponse | null;
  onFinancialDataChange: (data: UploadStatementResponse | null) => void;
}

interface ManualBill {
  text: string;
  amount: string;
  dueDate: string;
  manual: true;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_COLORS = [
  "#F59E0B",
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#8B5CF6",
  "#F97316",
];

const SAMPLE_DATA: UploadStatementResponse = {
  summary: {
    incomeThisMonth: 45000,
    expenseThisMonth: 18500,
    variableSpentSoFar: 11100,
    fixedBills: 7400,
    plannedSavings: 26500,
    netWorthDelta: 0.589,
    netWorthValue: 145000,
  },
  byCategory: {
    "Food & Dining": 4200,
    Transport: 2100,
    Groceries: 3800,
    Bills: 3500,
    Entertainment: 1900,
    Shopping: 2000,
    Health: 1000,
  },
  upcoming: [
    { text: "Electricity Bill", category: "Utilities", dueDate: "2025-08-28" },
    {
      text: "Credit Card Payment",
      category: "EMI/Loan",
      dueDate: "2025-08-25",
    },
    { text: "Netflix", category: "Subscriptions", dueDate: "2025-08-20" },
  ],
  transactions: { count: 24, items: [] },
  month: "2025-08",
};

const VALID_FILE_TYPES = [".csv", ".xlsx"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPercentage(value: number | null): string {
  if (value === null) return "N/A";
  return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(1)}%`;
}

function getCategoryColor(index: number): string {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function generateMonthOptions(): { value: string; label: string }[] {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return {
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      }),
    };
  });
}

const MONTH_OPTIONS = generateMonthOptions();

// ── Component ─────────────────────────────────────────────────────────────────

const HomePage: React.FC<HomePageProps> = ({
  active,
  setCurrentPage,
  displayName = "there",
  financialData, // ← from props
  onFinancialDataChange, // ← from props
}) => {
  // removed internal financialData useState — now comes from page.tsx
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [manualBills, setManualBills] = useState<ManualBill[]>([]);
  const [showAddBill, setShowAddBill] = useState(false);
  const [newBill, setNewBill] = useState({ text: "", amount: "", dueDate: "" });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const allBills = useMemo(
    () => [...(financialData?.upcoming ?? []), ...manualBills],
    [financialData?.upcoming, manualBills],
  );

  const totalSpend = useMemo(
    () =>
      Object.values(financialData?.byCategory ?? {}).reduce((s, v) => s + v, 0),
    [financialData?.byCategory],
  );

  const netCashFlow = financialData
    ? financialData.summary.incomeThisMonth -
      financialData.summary.expenseThisMonth
    : null;

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.toLowerCase().substring(file.name.lastIndexOf("."));
    if (!VALID_FILE_TYPES.includes(ext)) {
      setError("Please upload a CSV or XLSX file");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiService.uploadStatement(
        file,
        selectedMonth || undefined,
      );
      onFinancialDataChange(response); // ← was setFinancialData
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBill = () => {
    if (!newBill.text || !newBill.dueDate) return;
    setManualBills((prev) => [...prev, { ...newBill, manual: true }]);
    setNewBill({ text: "", amount: "", dueDate: "" });
    setShowAddBill(false);
  };

  const handleDeleteManualBill = (billIndex: number) => {
    setManualBills((prev) => prev.filter((_, i) => i !== billIndex));
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background text-white">
      <StatusBar />

      <div className="px-6 py-6">
        <h1 className="text-2xl font-bold mb-6">
          {getGreeting()}, {displayName}! 👋
        </h1>

        {/* ── Import Statement ──────────────────────────────────────────── */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
          <h3 className="font-medium mb-3">Import Statement</h3>
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <select
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="">Current Month</option>
                {MONTH_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-zinc-500 mt-1">
                CSV or XLSX • filter by month
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? "Uploading..." : "Import CSV/XLSX"}
            </button>

            {/* ← was setFinancialData(SAMPLE_DATA) */}
            <button
              onClick={() => onFinancialDataChange(SAMPLE_DATA)}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
            >
              Try Sample Data
            </button>
          </div>

          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

          {/* ← was setFinancialData(null) */}
          {financialData && (
            <button
              onClick={() => onFinancialDataChange(null)}
              className="text-zinc-400 text-sm mt-2 hover:text-white transition-colors"
            >
              Reset data
            </button>
          )}
        </div>

        {/* ── Net Worth + Cash Flow ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <h3 className="text-zinc-400 text-sm mb-2">Net Worth</h3>
            <div className="text-3xl font-bold mb-1">
              {financialData?.summary.netWorthValue
                ? formatCurrency(financialData.summary.netWorthValue)
                : "N/A"}
            </div>
            <div
              className={`text-sm ${(financialData?.summary.netWorthDelta ?? 0) >= 0 ? "text-green-400" : "text-red-400"}`}
            >
              {financialData?.summary.netWorthDelta != null
                ? `${formatPercentage(financialData.summary.netWorthDelta)} this month`
                : "No data available"}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <h3 className="text-zinc-400 text-sm mb-2">Cash Flow</h3>
            <div className="text-3xl font-bold mb-1">
              {netCashFlow !== null ? formatCurrency(netCashFlow) : "N/A"}
            </div>
            <div
              className={`text-sm ${(netCashFlow ?? 0) >= 0 ? "text-green-400" : "text-red-400"}`}
            >
              {netCashFlow !== null
                ? `${netCashFlow >= 0 ? "left" : "over budget"} this month`
                : "No data available"}
            </div>
          </div>
        </div>

        {/* ── Spending + Upcoming Bills ─────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <h3 className="font-medium mb-4">Spending</h3>
            {financialData &&
            Object.keys(financialData.byCategory).length > 0 ? (
              <>
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg className="w-24 h-24" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="3"
                    />
                    {Object.entries(financialData.byCategory).map(
                      ([category, amount], index) => {
                        const circumference = 2 * Math.PI * 15.9155;
                        const percentage = (amount / totalSpend) * 100;
                        const strokeDasharray = `${(percentage / 100) * circumference}, ${circumference}`;
                        const strokeDashoffset = Object.entries(
                          financialData.byCategory,
                        )
                          .slice(0, index)
                          .reduce(
                            (offset, [, prev]) =>
                              offset - (prev / totalSpend) * circumference,
                            0,
                          );

                        return (
                          <path
                            key={category}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke={getCategoryColor(index)}
                            strokeWidth="3"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                          />
                        );
                      },
                    )}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-sm font-bold">
                      {formatCurrency(financialData.summary.expenseThisMonth)}
                    </div>
                    <div className="text-xs text-zinc-400">spent</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm max-h-32 overflow-y-auto scrollbar-thin">
                  {Object.entries(financialData.byCategory).map(
                    ([category, amount], index) => (
                      <div
                        key={category}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: getCategoryColor(index) }}
                          />
                          <span className="truncate text-xs">{category}</span>
                        </div>
                        <span className="text-zinc-400 text-xs">
                          {formatCurrency(amount)}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8 space-y-1">
                <p className="text-zinc-400 text-sm">No spending data</p>
                <p className="text-zinc-500 text-xs">
                  Upload a statement to see breakdown
                </p>
              </div>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Upcoming Bills</h3>
              <button
                onClick={() => setShowAddBill((s) => !s)}
                className="text-blue-400 text-xs hover:text-blue-300 transition-colors"
              >
                + Add
              </button>
            </div>

            {showAddBill && (
              <div className="mb-3 space-y-2">
                <input
                  type="text"
                  placeholder="Bill name"
                  value={newBill.text}
                  onChange={(e) =>
                    setNewBill({ ...newBill, text: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={newBill.amount}
                  onChange={(e) =>
                    setNewBill({ ...newBill, amount: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                />
                <input
                  type="date"
                  value={newBill.dueDate}
                  onChange={(e) =>
                    setNewBill({ ...newBill, dueDate: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddBill}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg py-2 transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddBill(false)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg py-2 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {allBills.length > 0 ? (
              <div className="space-y-3">
                {allBills.map((bill, index) => {
                  const isManual = "manual" in bill;
                  const manualIndex =
                    index - (financialData?.upcoming.length ?? 0);
                  return (
                    <div
                      key={index}
                      className="border-l-2 border-blue-500 pl-3 flex justify-between items-start"
                    >
                      <div>
                        <p className="text-sm font-medium">{bill.text}</p>
                        {isManual && (bill as ManualBill).amount && (
                          <p className="text-xs text-blue-300">
                            ₹{(bill as ManualBill).amount}
                          </p>
                        )}
                        <p className="text-xs text-zinc-500">
                          Due:{" "}
                          {new Date(bill.dueDate).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      {isManual && (
                        <button
                          onClick={() => handleDeleteManualBill(manualIndex)}
                          className="text-zinc-500 hover:text-red-400 text-xs ml-2 mt-1 transition-colors"
                          aria-label={`Remove ${bill.text}`}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-zinc-400 text-sm">
                No upcoming bills. Tap + Add to create one.
              </p>
            )}
          </div>
        </div>

        {/* ── Monthly Breakdown + Data Status ──────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 mb-20">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <h3 className="font-medium mb-4">Monthly Breakdown</h3>
            {financialData ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Income</span>
                  <span className="text-green-400 font-medium">
                    {formatCurrency(financialData.summary.incomeThisMonth)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Fixed Bills</span>
                  <span className="text-red-400 font-medium">
                    {formatCurrency(financialData.summary.fixedBills)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">
                    Variable Spending
                  </span>
                  <span className="text-yellow-400 font-medium">
                    {formatCurrency(financialData.summary.variableSpentSoFar)}
                  </span>
                </div>
                <div className="border-t border-white/10 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Net Cash Flow</span>
                    <span
                      className={`font-bold ${(netCashFlow ?? 0) >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {netCashFlow !== null
                        ? formatCurrency(netCashFlow)
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-1">
                <p className="text-zinc-400 text-sm">No financial data</p>
                <p className="text-zinc-500 text-xs">
                  Upload a statement to see breakdown
                </p>
              </div>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <h3 className="font-medium mb-2">Data Status 📊</h3>
            {financialData ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full shrink-0" />
                  <span className="text-sm">Statement loaded</span>
                </div>
                <p className="text-sm text-zinc-400">
                  Month: {financialData.month}
                </p>
                <p className="text-sm text-zinc-400">
                  Categories: {Object.keys(financialData.byCategory).length}{" "}
                  detected
                </p>
                <p className="text-sm text-zinc-400">
                  Transactions:{" "}
                  {financialData.transactions.count > 0
                    ? `${financialData.transactions.count} processed`
                    : "None"}
                </p>
              </div>
            ) : (
              <div className="text-center py-8 space-y-1">
                <p className="text-zinc-400 text-sm">Ready to analyze</p>
                <p className="text-zinc-500 text-xs">
                  Upload a bank statement to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <NavBar active={active} setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default HomePage;
