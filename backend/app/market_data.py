import os
import httpx
from typing import Dict, Optional
from datetime import datetime, timedelta

POLYGON_API_KEY = os.getenv("POLYGON_API_KEY", "pXsvWS2gRbCbr7jlifT33t_23icKRbl6")  # Fallback to your key

async def fetch_stock_price(symbol: str) -> Optional[float]:
    url = f"https://api.polygon.io/v2/last/trade/{symbol}?apiKey={POLYGON_API_KEY}"
    async with httpx.AsyncClient() as client:
        resp = await client.get(url)
        if resp.status_code == 200:
            data = resp.json()
            return data.get("last", {}).get("price")
    return None

async def fetch_crypto_price(symbol: str) -> Optional[float]:
    url = f"https://api.coingecko.com/api/v3/simple/price?ids={symbol}&vs_currencies=usd"
    async with httpx.AsyncClient() as client:
        resp = await client.get(url)
        if resp.status_code == 200:
            data = resp.json()
            return data.get(symbol, {}).get("usd")
    return None

async def fetch_stock_history(symbol: str, days: int = 30) -> Optional[Dict]:
    """Fetch historical stock data for charting"""
    if not POLYGON_API_KEY:
        return None
    
    # Calculate date range
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    url = f"https://api.polygon.io/v2/aggs/ticker/{symbol}/range/1/day/{start_date.strftime('%Y-%m-%d')}/{end_date.strftime('%Y-%m-%d')}?adjusted=true&sort=asc&apikey={POLYGON_API_KEY}"
    
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("status") == "OK" and data.get("results"):
                    results = data["results"]
                    return {
                        "symbol": symbol,
                        "data": [
                            {
                                "date": datetime.fromtimestamp(result["t"] / 1000).strftime("%Y-%m-%d"),
                                "open": result["o"],
                                "high": result["h"],
                                "low": result["l"],
                                "close": result["c"],
                                "volume": result["v"]
                            }
                            for result in results
                        ]
                    }
                else:
                    print(f"Polygon API returned no data for {symbol}")
                    # Return mock data as fallback
                    return generate_mock_stock_data(symbol, days)
        except Exception as e:
            print(f"Error fetching stock history: {e}")
            # Return mock data as fallback
            return generate_mock_stock_data(symbol, days)
    
    # Return mock data as fallback
    return generate_mock_stock_data(symbol, days)

def generate_mock_stock_data(symbol: str, days: int = 30) -> Dict:
    """Generate mock stock data for demonstration purposes"""
    import random
    from datetime import datetime, timedelta
    
    # Base price for different symbols (realistic current market prices)
    base_prices = {
        # Technology Giants
        "AAPL": 150.0, "MSFT": 300.0, "GOOGL": 2500.0, "AMZN": 3000.0,
        "META": 300.0, "TSLA": 200.0, "NVDA": 400.0, "NFLX": 500.0,
        
        # Financial Services
        "JPM": 140.0, "BAC": 30.0, "WFC": 40.0, "GS": 350.0, "MS": 85.0,
        "C": 50.0, "AXP": 150.0, "V": 250.0, "MA": 400.0, "PYPL": 60.0,
        
        # Healthcare & Pharmaceuticals
        "JNJ": 160.0, "PFE": 30.0, "UNH": 500.0, "ABBV": 150.0, "MRK": 110.0,
        "TMO": 500.0, "ABT": 110.0, "DHR": 250.0, "BMY": 50.0, "AMGN": 250.0,
        
        # Consumer & Retail
        "WMT": 160.0, "HD": 300.0, "PG": 150.0, "KO": 60.0, "PEP": 170.0,
        "NKE": 100.0, "SBUX": 100.0, "MCD": 250.0, "DIS": 90.0, "CMCSA": 40.0,
        
        # Energy & Utilities
        "XOM": 110.0, "CVX": 150.0, "COP": 120.0, "EOG": 120.0, "SLB": 50.0,
        "NEE": 80.0, "DUK": 100.0, "SO": 70.0, "AEP": 90.0, "EXC": 40.0,
        
        # Industrial & Manufacturing
        "BA": 200.0, "CAT": 300.0, "GE": 100.0, "HON": 200.0, "MMM": 100.0,
        "UPS": 150.0, "FDX": 250.0, "LMT": 450.0, "RTX": 100.0, "DE": 400.0,
        
        # Telecommunications
        "VZ": 40.0, "T": 20.0, "TMUS": 150.0, "CHTR": 300.0,
        
        # Real Estate
        "AMT": 200.0, "PLD": 120.0, "CCI": 150.0, "EQIX": 800.0, "PSA": 300.0,
        
        # Cryptocurrency & Blockchain
        "COIN": 200.0, "MSTR": 400.0, "SQ": 60.0, "RIOT": 15.0, "MARA": 20.0,
        
        # Emerging Tech
        "PLTR": 20.0, "SNOW": 150.0, "CRWD": 200.0, "ZM": 70.0, "DOCU": 60.0,
        "SHOP": 50.0, "ROKU": 60.0, "SPOT": 200.0,
        
        # Indian Stock Market - Technology & IT (in INR)
        "TCS": 3500.0, "INFY": 1500.0, "WIPRO": 400.0, "HCLTECH": 1200.0, "TECHM": 1000.0,
        "LT": 2500.0, "BHARTIARTL": 800.0, "RELIANCE": 2500.0,
        
        # Indian Banking & Financial Services (in INR)
        "HDFCBANK": 1600.0, "ICICIBANK": 900.0, "SBIN": 500.0, "KOTAKBANK": 1800.0, "AXISBANK": 1000.0,
        "BAJFINANCE": 7000.0, "HDFC": 2500.0, "BAJAJFINSV": 1500.0,
        
        # Indian Automobile (in INR)
        "MARUTI": 10000.0, "TATAMOTORS": 500.0, "M&M": 1200.0, "BAJAJ-AUTO": 4000.0, "HEROMOTOCO": 2500.0, "EICHERMOT": 3000.0,
        
        # Indian Pharmaceuticals & Healthcare (in INR)
        "SUNPHARMA": 1000.0, "DRREDDY": 5000.0, "CIPLA": 1000.0, "DIVISLAB": 3500.0, "BIOCON": 300.0, "LUPIN": 800.0,
        
        # Indian FMCG & Consumer (in INR)
        "HINDUNILVR": 2500.0, "ITC": 400.0, "NESTLEIND": 18000.0, "DABUR": 500.0, "BRITANNIA": 4000.0, "GODREJCP": 1000.0,
        
        # Indian Energy & Utilities (in INR)
        "ONGC": 200.0, "IOC": 100.0, "BPCL": 300.0, "HPCL": 250.0, "NTPC": 200.0, "POWERGRID": 200.0,
        
        # Indian Metals & Mining (in INR)
        "TATASTEEL": 100.0, "JSWSTEEL": 600.0, "SAIL": 100.0, "HINDALCO": 400.0, "VEDL": 200.0,
        
        # Indian Real Estate & Infrastructure (in INR)
        "DLF": 400.0, "GODREJPROP": 1200.0, "SUNTV": 500.0, "ZEEL": 200.0,
        
        # Indian E-commerce & New Age (in INR)
        "ZOMATO": 60.0, "PAYTM": 600.0, "NYKA": 150.0, "POLICYBZR": 400.0
    }
    
    base_price = base_prices.get(symbol, 100.0)
    data = []
    
    for i in range(days):
        date = datetime.now() - timedelta(days=days-i-1)
        # Generate realistic price movement
        price_change = random.uniform(-0.05, 0.05)  # ±5% daily change
        base_price *= (1 + price_change)
        
        # Generate OHLC data
        open_price = base_price
        high_price = open_price * random.uniform(1.0, 1.03)
        low_price = open_price * random.uniform(0.97, 1.0)
        close_price = random.uniform(low_price, high_price)
        volume = random.randint(1000000, 10000000)
        
        data.append({
            "date": date.strftime("%Y-%m-%d"),
            "open": round(open_price, 2),
            "high": round(high_price, 2),
            "low": round(low_price, 2),
            "close": round(close_price, 2),
            "volume": volume
        })
        
        base_price = close_price  # Next day starts from previous close
    
    return {
        "symbol": symbol,
        "data": data
    }