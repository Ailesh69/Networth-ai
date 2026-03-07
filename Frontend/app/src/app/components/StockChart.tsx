import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { apiService, StockHistoryResponse } from '../services/api';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface StockChartProps {
  symbol?: string;
  days?: number;
}

const StockChart: React.FC<StockChartProps> = ({ symbol = 'AAPL', days = 30 }) => {
  const [stockData, setStockData] = useState<StockHistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStockData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiService.getStockHistory(symbol, days);
        // Validate the response data
        if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
          setStockData(data);
        } else {
          setError('No stock data available for the selected symbol');
          setStockData(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stock data');
        setStockData(null);
        console.error('Error fetching stock data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, [symbol, days]);

  const formatCurrency = (amount: number) => {
    // Check if it's an Indian stock (based on symbol patterns)
    const isIndianStock = symbol.includes('TCS') || symbol.includes('INFY') || symbol.includes('WIPRO') || 
                         symbol.includes('HCL') || symbol.includes('TECHM') || symbol.includes('LT') ||
                         symbol.includes('BHARTI') || symbol.includes('RELIANCE') || symbol.includes('HDFC') ||
                         symbol.includes('ICICI') || symbol.includes('SBIN') || symbol.includes('KOTAK') ||
                         symbol.includes('AXIS') || symbol.includes('BAJAJ') || symbol.includes('MARUTI') ||
                         symbol.includes('TATA') || symbol.includes('M&M') || symbol.includes('HERO') ||
                         symbol.includes('EICHER') || symbol.includes('SUN') || symbol.includes('DRREDDY') ||
                         symbol.includes('CIPLA') || symbol.includes('DIVIS') || symbol.includes('BIOCON') ||
                         symbol.includes('LUPIN') || symbol.includes('HINDUNILVR') || symbol.includes('ITC') ||
                         symbol.includes('NESTLE') || symbol.includes('DABUR') || symbol.includes('BRITANNIA') ||
                         symbol.includes('GODREJ') || symbol.includes('ONGC') || symbol.includes('IOC') ||
                         symbol.includes('BPCL') || symbol.includes('HPCL') || symbol.includes('NTPC') ||
                         symbol.includes('POWERGRID') || symbol.includes('JSW') || symbol.includes('SAIL') ||
                         symbol.includes('HINDALCO') || symbol.includes('VEDL') || symbol.includes('DLF') ||
                         symbol.includes('SUNTV') || symbol.includes('ZEEL') || symbol.includes('ZOMATO') ||
                         symbol.includes('PAYTM') || symbol.includes('NYKA') || symbol.includes('POLICYBZR');
    
    if (isIndianStock) {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-2xl p-4">
        <h3 className="text-white font-medium mb-4">Stock Market Chart</h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading stock data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-2xl p-4">
        <h3 className="text-white font-medium mb-4">Stock Market Chart</h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-400 text-sm mb-2">Error loading chart</div>
            <div className="text-gray-500 text-xs">{error}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!stockData || !stockData.data || !stockData.data.length) {
    return (
      <div className="bg-gray-800 rounded-2xl p-4">
        <h3 className="text-white font-medium mb-4">Stock Market Chart</h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400 text-sm">No stock data available</div>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = {
    labels: stockData.data.map(point => {
      const date = new Date(point.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: `${stockData.symbol} Price`,
        data: stockData.data.map(point => point.close),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#3B82F6',
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#9CA3AF',
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: '#374151',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const dataPoint = stockData.data[context.dataIndex];
            return [
              `Open: ${formatCurrency(dataPoint.open)}`,
              `High: ${formatCurrency(dataPoint.high)}`,
              `Low: ${formatCurrency(dataPoint.low)}`,
              `Close: ${formatCurrency(dataPoint.close)}`,
              `Volume: ${dataPoint.volume.toLocaleString()}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: '#374151',
          drawBorder: false,
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 10,
          },
        },
      },
      y: {
        grid: {
          color: '#374151',
          drawBorder: false,
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 10,
          },
          callback: function(value: any) {
            return formatCurrency(value);
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  const currentPrice = stockData.data[stockData.data.length - 1]?.close || 0;
  const previousPrice = stockData.data[stockData.data.length - 2]?.close || 0;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = previousPrice > 0 ? (priceChange / previousPrice) * 100 : 0;

  return (
    <div className="bg-gray-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">Stock Market Chart</h3>
        <div className="text-right">
          <div className="text-white font-semibold">{formatCurrency(currentPrice)}</div>
          <div className={`text-sm ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {priceChange >= 0 ? '+' : ''}{formatCurrency(priceChange)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
          </div>
        </div>
      </div>
      
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
      
      <div className="mt-4 text-xs text-gray-400">
        {stockData.symbol} • Last {days} days • Demo data (Polygon.io integration ready)
      </div>
    </div>
  );
};

export default StockChart;
