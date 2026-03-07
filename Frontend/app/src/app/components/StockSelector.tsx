import React, { useState, useMemo } from 'react';

interface StockOption {
  value: string;
  label: string;
  sector: string;
  emoji: string;
}

interface StockSelectorProps {
  selectedStock: string;
  onStockChange: (stock: string) => void;
}

const StockSelector: React.FC<StockSelectorProps> = ({ selectedStock, onStockChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const stockOptions: StockOption[] = [
    // Technology Giants
    { value: "AAPL", label: "Apple Inc.", sector: "Technology", emoji: "🍎" },
    { value: "MSFT", label: "Microsoft Corp.", sector: "Technology", emoji: "🪟" },
    { value: "GOOGL", label: "Alphabet Inc.", sector: "Technology", emoji: "🔍" },
    { value: "AMZN", label: "Amazon.com Inc.", sector: "Technology", emoji: "📦" },
    { value: "META", label: "Meta Platforms Inc.", sector: "Technology", emoji: "👥" },
    { value: "TSLA", label: "Tesla Inc.", sector: "Technology", emoji: "🚗" },
    { value: "NVDA", label: "NVIDIA Corp.", sector: "Technology", emoji: "🎮" },
    { value: "NFLX", label: "Netflix Inc.", sector: "Technology", emoji: "🎬" },

    // Financial Services
    { value: "JPM", label: "JPMorgan Chase", sector: "Financial", emoji: "🏦" },
    { value: "BAC", label: "Bank of America", sector: "Financial", emoji: "🏛️" },
    { value: "WFC", label: "Wells Fargo", sector: "Financial", emoji: "🏪" },
    { value: "GS", label: "Goldman Sachs", sector: "Financial", emoji: "💼" },
    { value: "MS", label: "Morgan Stanley", sector: "Financial", emoji: "📊" },
    { value: "C", label: "Citigroup", sector: "Financial", emoji: "🏢" },
    { value: "AXP", label: "American Express", sector: "Financial", emoji: "💳" },
    { value: "V", label: "Visa Inc.", sector: "Financial", emoji: "💳" },
    { value: "MA", label: "Mastercard", sector: "Financial", emoji: "💳" },
    { value: "PYPL", label: "PayPal", sector: "Financial", emoji: "💰" },

    // Healthcare & Pharmaceuticals
    { value: "JNJ", label: "Johnson & Johnson", sector: "Healthcare", emoji: "💊" },
    { value: "PFE", label: "Pfizer Inc.", sector: "Healthcare", emoji: "💉" },
    { value: "UNH", label: "UnitedHealth Group", sector: "Healthcare", emoji: "🏥" },
    { value: "ABBV", label: "AbbVie Inc.", sector: "Healthcare", emoji: "🔬" },
    { value: "MRK", label: "Merck & Co.", sector: "Healthcare", emoji: "🧬" },
    { value: "TMO", label: "Thermo Fisher Scientific", sector: "Healthcare", emoji: "🧪" },
    { value: "ABT", label: "Abbott Laboratories", sector: "Healthcare", emoji: "🩺" },
    { value: "DHR", label: "Danaher Corp.", sector: "Healthcare", emoji: "🔬" },
    { value: "BMY", label: "Bristol Myers Squibb", sector: "Healthcare", emoji: "💊" },
    { value: "AMGN", label: "Amgen Inc.", sector: "Healthcare", emoji: "🧬" },

    // Consumer & Retail
    { value: "WMT", label: "Walmart Inc.", sector: "Retail", emoji: "🛒" },
    { value: "HD", label: "Home Depot", sector: "Retail", emoji: "🔨" },
    { value: "PG", label: "Procter & Gamble", sector: "Consumer", emoji: "🧴" },
    { value: "KO", label: "Coca-Cola", sector: "Consumer", emoji: "🥤" },
    { value: "PEP", label: "PepsiCo", sector: "Consumer", emoji: "🥤" },
    { value: "NKE", label: "Nike Inc.", sector: "Consumer", emoji: "👟" },
    { value: "SBUX", label: "Starbucks", sector: "Consumer", emoji: "☕" },
    { value: "MCD", label: "McDonald's", sector: "Consumer", emoji: "🍔" },
    { value: "DIS", label: "Walt Disney", sector: "Entertainment", emoji: "🏰" },
    { value: "CMCSA", label: "Comcast", sector: "Telecom", emoji: "📺" },

    // Energy & Utilities
    { value: "XOM", label: "Exxon Mobil", sector: "Energy", emoji: "⛽" },
    { value: "CVX", label: "Chevron Corp.", sector: "Energy", emoji: "🛢️" },
    { value: "COP", label: "ConocoPhillips", sector: "Energy", emoji: "⛽" },
    { value: "EOG", label: "EOG Resources", sector: "Energy", emoji: "🛢️" },
    { value: "SLB", label: "Schlumberger", sector: "Energy", emoji: "🔧" },
    { value: "NEE", label: "NextEra Energy", sector: "Utilities", emoji: "⚡" },
    { value: "DUK", label: "Duke Energy", sector: "Utilities", emoji: "💡" },
    { value: "SO", label: "Southern Company", sector: "Utilities", emoji: "⚡" },
    { value: "AEP", label: "American Electric Power", sector: "Utilities", emoji: "🔌" },
    { value: "EXC", label: "Exelon Corp.", sector: "Utilities", emoji: "⚡" },

    // Industrial & Manufacturing
    { value: "BA", label: "Boeing Co.", sector: "Aerospace", emoji: "✈️" },
    { value: "CAT", label: "Caterpillar", sector: "Industrial", emoji: "🚜" },
    { value: "GE", label: "General Electric", sector: "Industrial", emoji: "⚙️" },
    { value: "HON", label: "Honeywell", sector: "Industrial", emoji: "🏭" },
    { value: "MMM", label: "3M Company", sector: "Industrial", emoji: "🔧" },
    { value: "UPS", label: "United Parcel Service", sector: "Logistics", emoji: "📦" },
    { value: "FDX", label: "FedEx Corp.", sector: "Logistics", emoji: "🚚" },
    { value: "LMT", label: "Lockheed Martin", sector: "Defense", emoji: "🛡️" },
    { value: "RTX", label: "Raytheon Technologies", sector: "Defense", emoji: "🛡️" },
    { value: "DE", label: "Deere & Company", sector: "Industrial", emoji: "🚜" },

    // Telecommunications
    { value: "VZ", label: "Verizon Communications", sector: "Telecom", emoji: "📱" },
    { value: "T", label: "AT&T Inc.", sector: "Telecom", emoji: "📞" },
    { value: "TMUS", label: "T-Mobile US", sector: "Telecom", emoji: "📱" },
    { value: "CHTR", label: "Charter Communications", sector: "Telecom", emoji: "📺" },

    // Real Estate
    { value: "AMT", label: "American Tower", sector: "Real Estate", emoji: "📡" },
    { value: "PLD", label: "Prologis", sector: "Real Estate", emoji: "🏢" },
    { value: "CCI", label: "Crown Castle", sector: "Real Estate", emoji: "📡" },
    { value: "EQIX", label: "Equinix", sector: "Real Estate", emoji: "🏢" },
    { value: "PSA", label: "Public Storage", sector: "Real Estate", emoji: "📦" },

    // Cryptocurrency & Blockchain
    { value: "COIN", label: "Coinbase Global", sector: "Crypto", emoji: "₿" },
    { value: "MSTR", label: "MicroStrategy", sector: "Crypto", emoji: "₿" },
    { value: "SQ", label: "Block Inc.", sector: "Crypto", emoji: "₿" },
    { value: "RIOT", label: "Riot Platforms", sector: "Crypto", emoji: "₿" },
    { value: "MARA", label: "Marathon Digital", sector: "Crypto", emoji: "₿" },

    // Emerging Tech
    { value: "PLTR", label: "Palantir Technologies", sector: "Tech", emoji: "🔍" },
    { value: "SNOW", label: "Snowflake Inc.", sector: "Tech", emoji: "❄️" },
    { value: "CRWD", label: "CrowdStrike", sector: "Tech", emoji: "🛡️" },
    { value: "ZM", label: "Zoom Video", sector: "Tech", emoji: "📹" },
    { value: "DOCU", label: "DocuSign", sector: "Tech", emoji: "📝" },
    { value: "SHOP", label: "Shopify", sector: "Tech", emoji: "🛍️" },
    { value: "ROKU", label: "Roku Inc.", sector: "Tech", emoji: "📺" },
    { value: "SPOT", label: "Spotify", sector: "Tech", emoji: "🎵" },

    // Indian Stock Market - Technology & IT
    { value: "TCS", label: "Tata Consultancy Services", sector: "Indian IT", emoji: "🇮🇳" },
    { value: "INFY", label: "Infosys Ltd", sector: "Indian IT", emoji: "🇮🇳" },
    { value: "WIPRO", label: "Wipro Ltd", sector: "Indian IT", emoji: "🇮🇳" },
    { value: "HCLTECH", label: "HCL Technologies", sector: "Indian IT", emoji: "🇮🇳" },
    { value: "TECHM", label: "Tech Mahindra", sector: "Indian IT", emoji: "🇮🇳" },
    { value: "LT", label: "Larsen & Toubro", sector: "Indian Engineering", emoji: "🇮🇳" },
    { value: "BHARTIARTL", label: "Bharti Airtel", sector: "Indian Telecom", emoji: "🇮🇳" },
    { value: "RELIANCE", label: "Reliance Industries", sector: "Indian Conglomerate", emoji: "🇮🇳" },

    // Indian Banking & Financial Services
    { value: "HDFCBANK", label: "HDFC Bank", sector: "Indian Banking", emoji: "🏦" },
    { value: "ICICIBANK", label: "ICICI Bank", sector: "Indian Banking", emoji: "🏦" },
    { value: "SBIN", label: "State Bank of India", sector: "Indian Banking", emoji: "🏦" },
    { value: "KOTAKBANK", label: "Kotak Mahindra Bank", sector: "Indian Banking", emoji: "🏦" },
    { value: "AXISBANK", label: "Axis Bank", sector: "Indian Banking", emoji: "🏦" },
    { value: "BAJFINANCE", label: "Bajaj Finance", sector: "Indian Finance", emoji: "💰" },
    { value: "HDFC", label: "HDFC Ltd", sector: "Indian Finance", emoji: "🏠" },
    { value: "BAJAJFINSV", label: "Bajaj Finserv", sector: "Indian Finance", emoji: "💰" },

    // Indian Automobile
    { value: "MARUTI", label: "Maruti Suzuki", sector: "Indian Auto", emoji: "🚗" },
    { value: "TATAMOTORS", label: "Tata Motors", sector: "Indian Auto", emoji: "🚗" },
    { value: "M&M", label: "Mahindra & Mahindra", sector: "Indian Auto", emoji: "🚜" },
    { value: "BAJAJ-AUTO", label: "Bajaj Auto", sector: "Indian Auto", emoji: "🏍️" },
    { value: "HEROMOTOCO", label: "Hero MotoCorp", sector: "Indian Auto", emoji: "🏍️" },
    { value: "EICHERMOT", label: "Eicher Motors", sector: "Indian Auto", emoji: "🚛" },

    // Indian Pharmaceuticals & Healthcare
    { value: "SUNPHARMA", label: "Sun Pharmaceutical", sector: "Indian Pharma", emoji: "💊" },
    { value: "DRREDDY", label: "Dr. Reddy's Laboratories", sector: "Indian Pharma", emoji: "💊" },
    { value: "CIPLA", label: "Cipla Ltd", sector: "Indian Pharma", emoji: "💊" },
    { value: "DIVISLAB", label: "Divi's Laboratories", sector: "Indian Pharma", emoji: "🧪" },
    { value: "BIOCON", label: "Biocon Ltd", sector: "Indian Pharma", emoji: "🧬" },
    { value: "LUPIN", label: "Lupin Ltd", sector: "Indian Pharma", emoji: "💊" },

    // Indian FMCG & Consumer
    { value: "HINDUNILVR", label: "Hindustan Unilever", sector: "Indian FMCG", emoji: "🧴" },
    { value: "ITC", label: "ITC Ltd", sector: "Indian FMCG", emoji: "🚬" },
    { value: "NESTLEIND", label: "Nestle India", sector: "Indian FMCG", emoji: "🍫" },
    { value: "DABUR", label: "Dabur India", sector: "Indian FMCG", emoji: "🧴" },
    { value: "BRITANNIA", label: "Britannia Industries", sector: "Indian FMCG", emoji: "🍪" },
    { value: "GODREJCP", label: "Godrej Consumer", sector: "Indian FMCG", emoji: "🧴" },

    // Indian Energy & Utilities
    { value: "ONGC", label: "Oil & Natural Gas Corp", sector: "Indian Energy", emoji: "⛽" },
    { value: "IOC", label: "Indian Oil Corporation", sector: "Indian Energy", emoji: "⛽" },
    { value: "BPCL", label: "Bharat Petroleum", sector: "Indian Energy", emoji: "⛽" },
    { value: "HPCL", label: "Hindustan Petroleum", sector: "Indian Energy", emoji: "⛽" },
    { value: "NTPC", label: "NTPC Ltd", sector: "Indian Power", emoji: "⚡" },
    { value: "POWERGRID", label: "Power Grid Corp", sector: "Indian Power", emoji: "⚡" },

    // Indian Metals & Mining
    { value: "TATASTEEL", label: "Tata Steel", sector: "Indian Metals", emoji: "🏭" },
    { value: "JSWSTEEL", label: "JSW Steel", sector: "Indian Metals", emoji: "🏭" },
    { value: "SAIL", label: "Steel Authority of India", sector: "Indian Metals", emoji: "🏭" },
    { value: "HINDALCO", label: "Hindalco Industries", sector: "Indian Metals", emoji: "🏭" },
    { value: "VEDL", label: "Vedanta Ltd", sector: "Indian Mining", emoji: "⛏️" },

    // Indian Real Estate & Infrastructure
    { value: "DLF", label: "DLF Ltd", sector: "Indian Real Estate", emoji: "🏢" },
    { value: "GODREJPROP", label: "Godrej Properties", sector: "Indian Real Estate", emoji: "🏢" },
    { value: "SUNTV", label: "Sun TV Network", sector: "Indian Media", emoji: "📺" },
    { value: "ZEEL", label: "Zee Entertainment", sector: "Indian Media", emoji: "📺" },

    // Indian E-commerce & New Age
    { value: "ZOMATO", label: "Zomato Ltd", sector: "Indian E-commerce", emoji: "🍕" },
    { value: "PAYTM", label: "Paytm (One97)", sector: "Indian Fintech", emoji: "📱" },
    { value: "NYKA", label: "Nykaa", sector: "Indian E-commerce", emoji: "💄" },
    { value: "POLICYBZR", label: "Policybazaar", sector: "Indian Fintech", emoji: "📱" },
  ];

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return stockOptions;
    return stockOptions.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.sector.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const selectedOption = stockOptions.find(option => option.value === selectedStock);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm w-full max-w-xs flex items-center justify-between hover:bg-gray-600 transition-colors"
      >
        <span className="flex items-center">
          {selectedOption && (
            <>
              <span className="mr-2">{selectedOption.emoji}</span>
              <span>{selectedOption.label} ({selectedOption.value})</span>
            </>
          )}
        </span>
        <span className="ml-2">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search stocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onStockChange(option.value);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex items-center ${
                  selectedStock === option.value ? 'bg-gray-700' : ''
                }`}
              >
                <span className="mr-3">{option.emoji}</span>
                <div className="flex-1">
                  <div className="text-white">{option.label}</div>
                  <div className="text-gray-400 text-xs">{option.value} • {option.sector}</div>
                </div>
              </button>
            ))}
          </div>
          
          {filteredOptions.length === 0 && (
            <div className="px-4 py-2 text-gray-400 text-sm">No stocks found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default StockSelector;
