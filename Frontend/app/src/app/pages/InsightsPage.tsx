import React, { useState, useEffect } from "react";
import StatusBar from "../components/StatusBar";
import NavBar from "../components/NavBar";
import StockChart from "../components/StockChart";
import StockSelector from "../components/StockSelector";
import { apiService, UploadStatementResponse } from "../services/api";

interface InsightsPageProps {
  active: string;
  setCurrentPage: (page: string) => void;
}

const InsightsPage: React.FC<InsightsPageProps> = ({ active, setCurrentPage }) => {
  const [financialData, setFinancialData] = useState<UploadStatementResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<string>("AAPL");

  useEffect(() => {
    // Try to get data from localStorage or make API call
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // For now, we'll use the mock data from the API
        const data = await apiService.getSummary();
        setFinancialData(data);
      } catch (error) {
        console.error('Failed to load financial data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load financial data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryColor = (index: number) => {
    const colors = ['#F59E0B', '#3B82F6', '#EF4444', '#10B981', '#8B5CF6', '#F97316'];
    return colors[index % colors.length];
  };

  const calculateSavingsRate = () => {
    if (!financialData) return 0;
    const income = financialData.summary.incomeThisMonth;
    const expenses = financialData.summary.expenseThisMonth;
    return income > 0 ? ((income - expenses) / income) * 100 : 0;
  };

  const getTopCategories = () => {
    if (!financialData) return [];
    return Object.entries(financialData.byCategory)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  // AI recommendations will be added later when AI model is ready

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <StatusBar />
      <div className="px-6 py-6">
        <h1 className="text-2xl font-bold mb-6">Financial Insights</h1>
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-400">Loading insights...</div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-400 text-sm mb-2">Error loading data</div>
            <div className="text-gray-500 text-xs">{error}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-6 mb-20">
            <div className="bg-gray-800 rounded-2xl p-4">
              <h3 className="text-white font-medium mb-4">This Month's Summary</h3>
              {financialData ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Income</span>
                    <span className="text-green-400 font-semibold">+{formatCurrency(financialData.summary.incomeThisMonth)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Expenses</span>
                    <span className="text-red-400 font-semibold">-{formatCurrency(financialData.summary.expenseThisMonth)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Savings Rate</span>
                    <span className="text-blue-400 font-semibold">{calculateSavingsRate().toFixed(1)}%</span>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-sm">No data available. Upload a statement to see insights.</div>
              )}
            </div>
            
            <div className="bg-gray-800 rounded-2xl p-4">
              <h3 className="text-white font-medium mb-4">Spending Trends</h3>
              {financialData && getTopCategories().length > 0 ? (
                <div className="space-y-4">
                  {getTopCategories().map(([category, amount], index) => {
                    const total = Object.values(financialData.byCategory).reduce((sum, val) => sum + val, 0);
                    const percentage = (amount / total) * 100;
                    return (
                      <div key={category}>
                        <div className="flex justify-between text-sm mb-2">
                          <span>{category}</span>
                          <span>{formatCurrency(amount)}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full" 
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: getCategoryColor(index)
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-gray-400 text-sm">No spending data available.</div>
              )}
            </div>
            
            <div className="bg-gray-800 rounded-2xl p-4">
              <h3 className="text-white font-medium mb-4">AI Recommendations</h3>
              <div className="text-center py-8">
                <div className="text-gray-400 text-sm">AI recommendations coming soon!</div>
                <div className="text-gray-500 text-xs mt-1">We're working on an AI model to provide personalized financial insights.</div>
              </div>
            </div>
            
            {/* Stock Market Chart */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">Market Analysis</h3>
                <StockSelector 
                  selectedStock={selectedStock}
                  onStockChange={setSelectedStock}
                />
              </div>
              <StockChart symbol={selectedStock} days={30} />
            </div>
          </div>
        )}
      </div>
      <NavBar active={active} setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default InsightsPage;



