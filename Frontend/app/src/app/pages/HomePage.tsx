import React, { useState, useRef } from "react";
import StatusBar from "../components/StatusBar";
import NavBar from "../components/NavBar";
import { apiService, UploadStatementResponse } from "../services/api";

interface HomePageProps {
  active: string;
  setCurrentPage: (page: string) => void;
}

interface ManualBill {
  text: string;
  amount: string;
  dueDate: string;
  manual: true;
}

const HomePage: React.FC<HomePageProps> = ({ active, setCurrentPage }) => {
  const [financialData, setFinancialData] =
    useState<UploadStatementResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [manualBills, setManualBills] = useState<ManualBill[]>([]);
  const [showAddBill, setShowAddBill] = useState(false);
  const [newBill, setNewBill] = useState({ text: "", amount: "", dueDate: "" });

  const handleAddBill = () => {
    if (!newBill.text || !newBill.dueDate) return;
    setManualBills([...manualBills, { ...newBill, manual: true }]);
    setNewBill({ text: "", amount: "", dueDate: "" });
    setShowAddBill(false);
  };
  const loadSampleData = () => {
    setFinancialData({
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
        {
          text: "Electricity Bill",
          category: "Utilities",
          dueDate: "2025-08-28",
        },
        {
          text: "Credit Card Payment",
          category: "EMI/Loan",
          dueDate: "2025-08-25",
        },
        { text: "Netflix", category: "Subscriptions", dueDate: "2025-08-20" },
      ],
      transactions: { count: 24, items: [] },
      month: "2025-08",
    });
  };

  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1,
      );
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthStr = `${year}-${month.toString().padStart(2, "0")}`;
      const displayStr = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
      options.push({ value: monthStr, label: displayStr });
    }
    return options;
  };

  const monthOptions = generateMonthOptions();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const validTypes = [".csv", ".xlsx"];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));
    if (!validTypes.includes(fileExtension)) {
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
      setFinancialData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setLoading(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number | null) => {
    if (value === null) return "N/A";
    const sign = value >= 0 ? "+" : "";
    return `${sign}${(value * 100).toFixed(1)}%`;
  };

  const getCategoryColor = (index: number) => {
    const colors = [
      "#F59E0B",
      "#3B82F6",
      "#EF4444",
      "#10B981",
      "#8B5CF6",
      "#F97316",
    ];
    return colors[index % colors.length];
  };

  const allBills = [...(financialData?.upcoming || []), ...manualBills];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <StatusBar />
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Good Morning! Ailesh 👋</h1>
        </div>

        {/* File Upload Section */}
        <div className="bg-gray-800 rounded-2xl p-4 mb-6">
          <h3 className="text-white font-medium mb-3">Import Statement</h3>
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <select
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="">Current Month</option>
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                CSV or XLSX • filter by month
              </p>
            </div>
            <button
              onClick={handleImportClick}
              disabled={loading}
              className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? "Uploading..." : "Import CSV/XLSX"}
            </button>
            <button
              onClick={loadSampleData}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
            >
              Try Sample Data
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileUpload}
            className="hidden"
          />
          {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
          {financialData && (
            <button
              onClick={() => setFinancialData(null)}
              className="text-gray-400 text-sm mt-2 hover:text-white transition-colors"
            >
              Reset data
            </button>
          )}
        </div>

        {/* Net Worth + Cash Flow */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800 rounded-2xl p-4">
            <h3 className="text-gray-400 text-sm mb-2">Net Worth</h3>
            <div className="text-3xl font-bold mb-1">
              {financialData?.summary.netWorthValue
                ? formatCurrency(financialData.summary.netWorthValue)
                : "N/A"}
            </div>
            <div
              className={`text-sm ${financialData?.summary.netWorthDelta && financialData.summary.netWorthDelta >= 0 ? "text-green-400" : "text-red-400"}`}
            >
              {financialData?.summary.netWorthDelta
                ? `${formatPercentage(financialData.summary.netWorthDelta)} this month`
                : "No data available"}
            </div>
          </div>
          <div className="bg-gray-800 rounded-2xl p-4">
            <h3 className="text-gray-400 text-sm mb-2">Cash Flow</h3>
            <div className="text-3xl font-bold mb-1">
              {financialData
                ? formatCurrency(
                    financialData.summary.incomeThisMonth -
                      financialData.summary.expenseThisMonth,
                  )
                : "N/A"}
            </div>
            <div className="text-green-400 text-sm">
              {financialData
                ? `${financialData.summary.incomeThisMonth - financialData.summary.expenseThisMonth >= 0 ? "left" : "over budget"} for this month`
                : "No data available"}
            </div>
          </div>
        </div>

        {/* Spending + Upcoming Bills */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800 rounded-2xl p-4">
            <h3 className="text-white font-medium mb-4">Spending</h3>
            {financialData &&
            Object.keys(financialData.byCategory).length > 0 ? (
              <>
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg className="w-24 h-24" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#374151"
                      strokeWidth="3"
                    />
                    {Object.entries(financialData.byCategory).map(
                      ([category, amount], index) => {
                        const total = Object.values(
                          financialData.byCategory,
                        ).reduce((sum, val) => sum + val, 0);
                        const percentage = (amount / total) * 100;
                        const circumference = 2 * Math.PI * 15.9155;
                        const strokeDasharray = `${(percentage / 100) * circumference}, ${circumference}`;
                        const strokeDashoffset = Object.entries(
                          financialData.byCategory,
                        )
                          .slice(0, index)
                          .reduce((offset, [, prevAmount]) => {
                            return (
                              offset - (prevAmount / total) * circumference
                            );
                          }, 0);
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
                    <div className="text-xl font-bold">
                      {formatCurrency(financialData.summary.expenseThisMonth)}
                    </div>
                    <div className="text-xs text-gray-400">spent</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm max-h-32 overflow-y-auto">
                  {Object.entries(financialData.byCategory).map(
                    ([category, amount], index) => (
                      <div
                        key={category}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: getCategoryColor(index) }}
                          ></div>
                          <span className="truncate">{category}</span>
                        </div>
                        <span className="text-gray-400">
                          {formatCurrency(amount)}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-sm">
                  No spending data available
                </div>
                <div className="text-gray-500 text-xs mt-1">
                  Upload a statement to see your spending breakdown
                </div>
              </div>
            )}
          </div>

          {/* Upcoming Bills Card */}
          <div className="bg-gray-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Upcoming Bills</h3>
              <button
                onClick={() => setShowAddBill(!showAddBill)}
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
                  className="w-full bg-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={newBill.amount}
                  onChange={(e) =>
                    setNewBill({ ...newBill, amount: e.target.value })
                  }
                  className="w-full bg-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none"
                />
                <input
                  type="date"
                  value={newBill.dueDate}
                  onChange={(e) =>
                    setNewBill({ ...newBill, dueDate: e.target.value })
                  }
                  className="w-full bg-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none"
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
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg py-2 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {allBills.length > 0 ? (
              <div className="space-y-3">
                {allBills.map((bill, index) => (
                  <div
                    key={index}
                    className="border-l-2 border-blue-500 pl-3 flex justify-between items-start"
                  >
                    <div>
                      <div className="text-sm font-medium">{bill.text}</div>
                      {"amount" in bill && bill.amount && (
                        <div className="text-xs text-blue-300">
                          ₹{(bill as ManualBill).amount}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        Due: {new Date(bill.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                    {"manual" in bill && (
                      <button
                        onClick={() =>
                          setManualBills(
                            manualBills.filter(
                              (_, i) =>
                                i !==
                                index - (financialData?.upcoming.length || 0),
                            ),
                          )
                        }
                        className="text-gray-500 hover:text-red-400 text-xs ml-2 mt-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">
                No upcoming bills. Tap + Add to create one.
              </p>
            )}
          </div>
        </div>

        {/* Monthly Breakdown + Data Status */}
        <div className="grid grid-cols-2 gap-4 mb-20">
          <div className="bg-gray-800 rounded-2xl p-4">
            <h3 className="text-white font-medium mb-4">Monthly Breakdown</h3>
            {financialData ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Income</span>
                  <span className="text-green-400 font-medium">
                    {formatCurrency(financialData.summary.incomeThisMonth)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Fixed Bills</span>
                  <span className="text-red-400 font-medium">
                    {formatCurrency(financialData.summary.fixedBills)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">
                    Variable Spending
                  </span>
                  <span className="text-yellow-400 font-medium">
                    {formatCurrency(financialData.summary.variableSpentSoFar)}
                  </span>
                </div>
                <div className="border-t border-gray-700 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">
                      Net Cash Flow
                    </span>
                    <span
                      className={`font-bold ${financialData.summary.incomeThisMonth - financialData.summary.expenseThisMonth >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {formatCurrency(
                        financialData.summary.incomeThisMonth -
                          financialData.summary.expenseThisMonth,
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-sm">
                  No financial data available
                </div>
                <div className="text-gray-500 text-xs mt-1">
                  Upload a statement to see your monthly breakdown
                </div>
              </div>
            )}
          </div>
          <div className="bg-gray-800 rounded-2xl p-4">
            <h3 className="text-white font-medium mb-2">Data Status 📊</h3>
            {financialData ? (
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm">
                    Statement uploaded successfully
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  Month: {financialData.month}
                </div>
                <div className="text-sm text-gray-400">
                  Categories: {Object.keys(financialData.byCategory).length}{" "}
                  detected
                </div>
                <div className="text-sm text-gray-400">
                  Transactions:{" "}
                  {Object.values(financialData.byCategory).reduce(
                    (sum, val) => sum + val,
                    0,
                  ) > 0
                    ? "Processed"
                    : "No transactions"}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-sm">
                  Ready to analyze your finances
                </div>
                <div className="text-gray-500 text-xs mt-1">
                  Upload a bank statement to get started
                </div>
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
