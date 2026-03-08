import os
import random
from datetime import datetime, timedelta
from typing import Dict, Optional

import httpx

# ── Constants ─────────────────────────────────────────────────────────────────

# Load API key from environment — never hardcode keys in source code
# Add POLYGON_API_KEY to your .env.local file
POLYGON_API_KEY = os.getenv("POLYGON_API_KEY")

# Default timeout (in seconds) for all external API requests
REQUEST_TIMEOUT = 10

# Base prices used for mock data generation when real API data is unavailable
# Prices are approximate and grouped by sector for readability
MOCK_BASE_PRICES: Dict[str, float] = {
    # ── US Technology ──────────────────────────────────────────────────────
    "AAPL": 150.0,
    "MSFT": 300.0,
    "GOOGL": 2500.0,
    "AMZN": 3000.0,
    "META": 300.0,
    "TSLA": 200.0,
    "NVDA": 400.0,
    "NFLX": 500.0,
    # ── US Financial Services ──────────────────────────────────────────────
    "JPM": 140.0,
    "BAC": 30.0,
    "WFC": 40.0,
    "GS": 350.0,
    "MS": 85.0,
    "C": 50.0,
    "AXP": 150.0,
    "V": 250.0,
    "MA": 400.0,
    "PYPL": 60.0,
    # ── US Healthcare & Pharma ─────────────────────────────────────────────
    "JNJ": 160.0,
    "PFE": 30.0,
    "UNH": 500.0,
    "ABBV": 150.0,
    "MRK": 110.0,
    "TMO": 500.0,
    "ABT": 110.0,
    "DHR": 250.0,
    "BMY": 50.0,
    "AMGN": 250.0,
    # ── US Consumer & Retail ───────────────────────────────────────────────
    "WMT": 160.0,
    "HD": 300.0,
    "PG": 150.0,
    "KO": 60.0,
    "PEP": 170.0,
    "NKE": 100.0,
    "SBUX": 100.0,
    "MCD": 250.0,
    "DIS": 90.0,
    "CMCSA": 40.0,
    # ── US Energy & Utilities ──────────────────────────────────────────────
    "XOM": 110.0,
    "CVX": 150.0,
    "COP": 120.0,
    "EOG": 120.0,
    "SLB": 50.0,
    "NEE": 80.0,
    "DUK": 100.0,
    "SO": 70.0,
    "AEP": 90.0,
    "EXC": 40.0,
    # ── US Industrial & Manufacturing ──────────────────────────────────────
    "BA": 200.0,
    "CAT": 300.0,
    "GE": 100.0,
    "HON": 200.0,
    "MMM": 100.0,
    "UPS": 150.0,
    "FDX": 250.0,
    "LMT": 450.0,
    "RTX": 100.0,
    "DE": 400.0,
    # ── US Telecom ─────────────────────────────────────────────────────────
    "VZ": 40.0,
    "T": 20.0,
    "TMUS": 150.0,
    "CHTR": 300.0,
    # ── US Real Estate ─────────────────────────────────────────────────────
    "AMT": 200.0,
    "PLD": 120.0,
    "CCI": 150.0,
    "EQIX": 800.0,
    "PSA": 300.0,
    # ── US Crypto & Blockchain ─────────────────────────────────────────────
    "COIN": 200.0,
    "MSTR": 400.0,
    "SQ": 60.0,
    "RIOT": 15.0,
    "MARA": 20.0,
    # ── US Emerging Tech ───────────────────────────────────────────────────
    "PLTR": 20.0,
    "SNOW": 150.0,
    "CRWD": 200.0,
    "ZM": 70.0,
    "DOCU": 60.0,
    "SHOP": 50.0,
    "ROKU": 60.0,
    "SPOT": 200.0,
    # ── Indian IT & Technology (INR) ───────────────────────────────────────
    "TCS": 3500.0,
    "INFY": 1500.0,
    "WIPRO": 400.0,
    "HCLTECH": 1200.0,
    "TECHM": 1000.0,
    "LT": 2500.0,
    "BHARTIARTL": 800.0,
    "RELIANCE": 2500.0,
    # ── Indian Banking & Finance (INR) ─────────────────────────────────────
    "HDFCBANK": 1600.0,
    "ICICIBANK": 900.0,
    "SBIN": 500.0,
    "KOTAKBANK": 1800.0,
    "AXISBANK": 1000.0,
    "BAJFINANCE": 7000.0,
    "HDFC": 2500.0,
    "BAJAJFINSV": 1500.0,
    # ── Indian Automobile (INR) ────────────────────────────────────────────
    "MARUTI": 10000.0,
    "TATAMOTORS": 500.0,
    "M&M": 1200.0,
    "BAJAJ-AUTO": 4000.0,
    "HEROMOTOCO": 2500.0,
    "EICHERMOT": 3000.0,
    # ── Indian Pharma & Healthcare (INR) ───────────────────────────────────
    "SUNPHARMA": 1000.0,
    "DRREDDY": 5000.0,
    "CIPLA": 1000.0,
    "DIVISLAB": 3500.0,
    "BIOCON": 300.0,
    "LUPIN": 800.0,
    # ── Indian FMCG & Consumer (INR) ──────────────────────────────────────
    "HINDUNILVR": 2500.0,
    "ITC": 400.0,
    "NESTLEIND": 18000.0,
    "DABUR": 500.0,
    "BRITANNIA": 4000.0,
    "GODREJCP": 1000.0,
    # ── Indian Energy & Utilities (INR) ───────────────────────────────────
    "ONGC": 200.0,
    "IOC": 100.0,
    "BPCL": 300.0,
    "HPCL": 250.0,
    "NTPC": 200.0,
    "POWERGRID": 200.0,
    # ── Indian Metals & Mining (INR) ───────────────────────────────────────
    "TATASTEEL": 100.0,
    "JSWSTEEL": 600.0,
    "SAIL": 100.0,
    "HINDALCO": 400.0,
    "VEDL": 200.0,
    # ── Indian Real Estate & Media (INR) ──────────────────────────────────
    "DLF": 400.0,
    "GODREJPROP": 1200.0,
    "SUNTV": 500.0,
    "ZEEL": 200.0,
    # ── Indian New Age & E-commerce (INR) ─────────────────────────────────
    "ZOMATO": 60.0,
    "PAYTM": 600.0,
    "NYKA": 150.0,
    "POLICYBZR": 400.0,
}


# ── Helper Functions ──────────────────────────────────────────────────────────


def generate_mock_stock_data(symbol: str, days: int = 30) -> Dict:
    """Generate realistic mock OHLCV stock data for demo/fallback purposes.
    Simulates daily price movements with ±5% variance from a base price.
    Uses MOCK_BASE_PRICES if symbol is known, otherwise defaults to 100.0.
    """
    # Start from a known base price or use a generic default
    base_price = MOCK_BASE_PRICES.get(symbol, 100.0)
    data = []

    for i in range(days):
        # Calculate the date for this data point (oldest first)
        current_date = datetime.now() - timedelta(days=days - i - 1)

        # Simulate realistic daily price fluctuation (±5%)
        price_change = random.uniform(-0.05, 0.05)
        base_price *= 1 + price_change

        # Generate OHLC values around the day's base price
        open_price = base_price
        high_price = open_price * random.uniform(1.0, 1.03)  # Up to 3% above open
        low_price = open_price * random.uniform(0.97, 1.0)  # Up to 3% below open
        close_price = random.uniform(low_price, high_price)  # Close within range

        data.append(
            {
                "date": current_date.strftime("%Y-%m-%d"),
                "open": round(open_price, 2),
                "high": round(high_price, 2),
                "low": round(low_price, 2),
                "close": round(close_price, 2),
                "volume": random.randint(1_000_000, 10_000_000),
            }
        )

        # Next day's open starts from today's close (realistic continuity)
        base_price = close_price

    return {"symbol": symbol, "data": data}


# ── API Fetch Functions ───────────────────────────────────────────────────────


async def fetch_stock_price(symbol: str) -> Optional[float]:
    """Fetch the latest trade price for a stock from the Polygon API.
    Returns None if the request fails or price data is unavailable.
    """
    if not POLYGON_API_KEY:
        return None

    url = f"https://api.polygon.io/v2/last/trade/{symbol}?apiKey={POLYGON_API_KEY}"

    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
        try:
            resp = await client.get(url)
            if resp.status_code == 200:
                # Polygon returns price nested under "last.price"
                return resp.json().get("last", {}).get("price")
        except Exception as e:
            print(f"Error fetching stock price for {symbol}: {e}")

    return None


async def fetch_crypto_price(symbol: str) -> Optional[float]:
    """Fetch the current USD price of a cryptocurrency from CoinGecko.
    symbol should be the CoinGecko ID (e.g. 'bitcoin', 'ethereum').
    Returns None if the request fails or price data is unavailable.
    """
    url = (
        f"https://api.coingecko.com/api/v3/simple/price?ids={symbol}&vs_currencies=usd"
    )

    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
        try:
            resp = await client.get(url)
            if resp.status_code == 200:
                # CoinGecko returns { "bitcoin": { "usd": 45000 } }
                return resp.json().get(symbol, {}).get("usd")
        except Exception as e:
            print(f"Error fetching crypto price for {symbol}: {e}")

    return None


async def fetch_stock_history(symbol: str, days: int = 30) -> Optional[Dict]:
    """Fetch daily OHLCV history for a stock from the Polygon aggregates API.
    Falls back to generated mock data if the API is unavailable or returns no results.

    Args:
        symbol: Stock ticker symbol (e.g. 'AAPL')
        days: Number of calendar days of history to fetch (default: 30)

    Returns:
        Dict with 'symbol' and 'data' (list of daily OHLCV dicts), or None on hard failure.
    """
    if not POLYGON_API_KEY:
        # No API key available — use mock data for demo purposes
        return generate_mock_stock_data(symbol, days)

    # Build date range for the request
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)

    url = (
        f"https://api.polygon.io/v2/aggs/ticker/{symbol}/range/1/day"
        f"/{start_date.strftime('%Y-%m-%d')}/{end_date.strftime('%Y-%m-%d')}"
        f"?adjusted=true&sort=asc&apikey={POLYGON_API_KEY}"
    )

    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
        try:
            resp = await client.get(url)

            if resp.status_code == 200:
                data = resp.json()

                if data.get("status") == "OK" and data.get("results"):
                    # Map Polygon's compact field names to readable keys
                    # t=timestamp(ms), o=open, h=high, l=low, c=close, v=volume
                    return {
                        "symbol": symbol,
                        "data": [
                            {
                                "date": datetime.fromtimestamp(r["t"] / 1000).strftime(
                                    "%Y-%m-%d"
                                ),
                                "open": r["o"],
                                "high": r["h"],
                                "low": r["l"],
                                "close": r["c"],
                                "volume": r["v"],
                            }
                            for r in data["results"]
                        ],
                    }

                # API responded but returned no data for this symbol
                print(f"Polygon API returned no results for {symbol} — using mock data")

        except Exception as e:
            print(f"Error fetching stock history for {symbol}: {e}")

    # Fall back to mock data if anything went wrong
    return generate_mock_stock_data(symbol, days)
