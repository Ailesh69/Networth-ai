import json
import os
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from groq import Groq
from pydantic import BaseModel

from .market_data import fetch_crypto_price, fetch_stock_history, fetch_stock_price
from .services._services import get_summary

# ── Environment Setup ─────────────────────────────────────────────────────────

load_dotenv(".env.local")
groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    raise RuntimeError("GROQ_API_KEY not found in environment variables")

# Single shared Groq client — created once, reused across all requests
groq_client = Groq(api_key=groq_api_key)

# ── App Initialization ────────────────────────────────────────────────────────

app = FastAPI(title="Networth AI", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Pydantic Models ───────────────────────────────────────────────────────────


class TransactionItem(BaseModel):
    date: str
    description: str
    debit: float
    credit: float
    category: str


class Transactions(BaseModel):
    count: int
    items: List[TransactionItem]


class AdviceRequest(BaseModel):
    summary: Dict[str, Any]
    byCategory: Dict[str, float]
    upcoming: List[Dict[str, Any]]
    transactions: Transactions


class ChatRequest(BaseModel):
    message: str
    personality_prompt: Optional[str] = (
        None  # Injected by frontend based on AI Mentor setting
    )


# ── Helper Functions ──────────────────────────────────────────────────────────


def extract_json_array(text: Optional[str]) -> Optional[list]:
    """Extract and parse the first JSON array found in a string.
    Returns None if text is None or no valid JSON array is found.
    """
    if not text:
        return None
    try:
        start = text.index("[")
        end = text.rindex("]")
        return json.loads(text[start : end + 1])
    except Exception:
        return None


# ── Routes: General ───────────────────────────────────────────────────────────


@app.get("/", tags=["General"])
def root():
    """Redirect root URL to the interactive API docs."""
    return RedirectResponse(url="/docs")


# ── Routes: Financial Data ────────────────────────────────────────────────────


@app.post("/upload-statement", tags=["Financial Data"])
async def upload_statement(
    file: UploadFile = File(...),
    month: str | None = Query(None, description="Filter by month in YYYY-MM format"),
):
    """Upload a bank statement (CSV or Excel) and get a financial summary."""
    file_content = await file.read()
    file_extension = file.filename.split(".")[-1].lower() if file.filename else "csv"
    return get_summary(month=month, file_content=file_content, file_type=file_extension)


@app.get("/summary", tags=["Financial Data"])
async def get_summary_data(
    month: str | None = Query(None, description="Filter by month in YYYY-MM format"),
):
    """Get a financial summary without uploading a file. Uses mock/demo data."""
    return get_summary(month=month)


# ── Routes: Market Data ───────────────────────────────────────────────────────


@app.get("/stock-price", tags=["Market Data"])
async def stock_price(
    symbol: str = Query(..., description="Stock ticker symbol, e.g. AAPL"),
):
    """Fetch the current price of a stock by its ticker symbol."""
    price = await fetch_stock_price(symbol)
    if price is None:
        raise HTTPException(
            status_code=404, detail=f"Price not found for symbol: {symbol}"
        )
    return {"symbol": symbol, "price": price}


@app.get("/crypto-price", tags=["Market Data"])
async def crypto_price(
    symbol: str = Query(..., description="Crypto id, e.g. bitcoin"),
):
    """Fetch the current price of a cryptocurrency by its CoinGecko ID."""
    price = await fetch_crypto_price(symbol)
    if price is None:
        raise HTTPException(
            status_code=404, detail=f"Price not found for symbol: {symbol}"
        )
    return {"symbol": symbol, "price": price}


@app.get("/stock-history", tags=["Market Data"])
async def stock_history(
    symbol: str = Query(..., description="Stock ticker symbol, e.g. AAPL"),
    days: int = Query(30, description="Number of days of history to fetch"),
):
    """Fetch historical price data for a stock over the last N days."""
    history = await fetch_stock_history(symbol, days)
    if history is None:
        raise HTTPException(
            status_code=404, detail=f"History not found for symbol: {symbol}"
        )
    return history


# ── Routes: AI Features ───────────────────────────────────────────────────────


@app.post("/advice", tags=["AI Features"])
async def advice(body: AdviceRequest):
    """Generate 3-5 personalized financial recommendations using AI."""
    data = body.dict()

    prompt = f"""
You are a personal finance coach for students and young professionals.
Given the following user data, provide 3-5 actionable, prioritized recommendations to improve their financial health this month, by adding bit touch of humor too.

User Data:
Summary: {data.get("summary")}
Spending by category: {data.get("byCategory")}
Upcoming bills: {data.get("upcoming")}
Recent transactions: {data.get("transactions", {}).get("items", [])[:5]}

Instructions:
- Be concise and specific.
- For each recommendation, include:
    - A short title
    - The main action to take
    - The reason (with numbers if possible)
    - Any risks or tradeoffs
- Output ONLY the JSON array, with no extra text or explanation.
[
  {{
    "title": "...",
    "action": "...",
    "reason": "...",
    "risk": "..."
  }},
  ...
]
"""

    system_prompt = (
        "You are an expert personal finance coach. "
        "Analyze the user's financial data and respond ONLY with a valid JSON array of recommendations. "
        "However you can add a humor touch in responses"
        "Do not include any explanation, greeting, or extra text outside the JSON."
    )

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ],
    )

    ai_text = response.choices[0].message.content
    recommendations = extract_json_array(ai_text)

    if not recommendations:
        recommendations = [
            {
                "title": "Could not parse recommendations",
                "action": ai_text,
                "reason": "",
                "risk": "",
            }
        ]

    return {"recommendations": recommendations}


@app.post("/chat", tags=["AI Features"])
async def chat(body: ChatRequest):
    """Chat with an AI financial assistant.
    The assistant's personality is controlled by the AI Mentor setting in the frontend.
    """
    financial_data = get_summary()
    summary = financial_data["summary"]
    by_category = financial_data["byCategory"]
    upcoming = financial_data["upcoming"]
    recent_transactions = financial_data["transactions"]["items"][:10]

    # Use personality prompt from frontend if provided, otherwise fall back to default
    personality = body.personality_prompt or (
        "You are a helpful personal finance assistant. "
        "Be honest, concise and practical, and add a bit of humor."
    )

    # Personality is injected at the top so it sets the tone for everything that follows
    system_prompt = f"""
{personality}

You have access to the user's real financial data below. Answer their questions based on this data.

Current Financial Data:
- Income this month: ₹{summary["incomeThisMonth"]}
- Expenses this month: ₹{summary["expenseThisMonth"]}
- Planned savings: ₹{summary["plannedSavings"]}
- Net worth: ₹{summary["netWorthValue"]}

Spending by category: {by_category}
Upcoming bills: {upcoming}
Recent transactions: {recent_transactions}
"""

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": body.message},
        ],
    )

    return {"reply": response.choices[0].message.content}
