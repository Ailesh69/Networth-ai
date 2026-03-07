import json
import os
from typing import Any, Dict, List

from dotenv import load_dotenv
from fastapi import FastAPI, File, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from groq import Groq
from pydantic import BaseModel

from .market_data import fetch_crypto_price, fetch_stock_history, fetch_stock_price
from .services._services import get_summary

app = FastAPI(title="Networth Ai", version="1.0")


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


# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return RedirectResponse(url="/docs")


@app.post("/upload-statement")
async def upload_statement(file: UploadFile = File(...), month: str | None = None):
    # Read file content
    file_content = await file.read()

    # Get file extension
    file_extension = file.filename.split(".")[-1].lower() if file.filename else "csv"

    # Process the file and return summary
    return get_summary(month=month, file_content=file_content, file_type=file_extension)


@app.get("/summary")
async def get_summary_data(month: str | None = None):
    # Return summary without requiring file upload
    return get_summary(month=month)


@app.get("/stock-price")
async def stock_price(
    symbol: str = Query(..., description="Stock ticker symbol, e.g. AAPL"),
):
    price = await fetch_stock_price(symbol)
    if price is None:
        return {"error": "Price not found"}
    return {"symbol": symbol, "price": price}


@app.get("/crypto-price")
async def crypto_price(symbol: str = Query(..., description="Crypto id, e.g. bitcoin")):
    price = await fetch_crypto_price(symbol)
    if price is None:
        return {"error": "Price not found"}
    return {"symbol": symbol, "price": price}


@app.get("/stock-history")
async def stock_history(
    symbol: str = Query(..., description="Stock ticker symbol, e.g. AAPL"),
    days: int = Query(30, description="Number of days of history"),
):
    history = await fetch_stock_history(symbol, days)
    if history is None:
        return {"error": "Stock history not found"}
    return history


# Open api key
load_dotenv(".env.local")
groq_api_key = os.getenv("Groq_Api_Key")
if not groq_api_key:
    raise RuntimeError("Groq-api key not found in environment variables")
Groq.api_key = groq_api_key


@app.post("/advice")
async def advice(body: AdviceRequest):
    data = body.dict()
    prompt = f"""
You are a personal finance coach for students and young professionals.
Given the following user data, provide 3-5 actionable, prioritized recommendations to improve their financial health this month.

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
        "Hello, I'm your AI financial coach! Let's get your finances on track this month. "
        "To get started, I'll need a little more information about your financial situation. "
        "Please provide some details like your spending, upcoming bills, and recent transactions. "
        "Once I have that data, I'll be able to give you personalized, actionable advice."
    )

    client = Groq(api_key=groq_api_key)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ],
    )
    ai_text = response.choices[0].message.content

    # Improved JSON extraction: find the first [ and last ] and parse
    def extract_json_array(text):
        try:
            start = text.index("[")
            end = text.rindex("]")
            json_str = text[start : end + 1]
            return json.loads(json_str)
        except Exception:
            return None

    recommendations = extract_json_array(ai_text)
    if not recommendations:
        recommendations = [
            {
                "title": "No recommendations found",
                "action": ai_text,
                "reason": "",
                "risk": "",
            }
        ]

    return {"recommendations": recommendations}


class ChatRequest(BaseModel):
    message: str


@app.post("/chat")
async def chat(body: ChatRequest):
    # Get current financial data
    financial_data = get_summary()
    summary = financial_data["summary"]
    by_category = financial_data["byCategory"]
    upcoming = financial_data["upcoming"]
    transactions = financial_data["transactions"]["items"][:10]

    system_prompt = f"""
You are a personal finance assistant. You have access to the user's real financial data below.
Answer their questions based on this data. Be honest, concise and practical.

Current Financial Data:
- Income this month: ₹{summary["incomeThisMonth"]}
- Expenses this month: ₹{summary["expenseThisMonth"]}
- Planned savings: ₹{summary["plannedSavings"]}
- Net worth: ₹{summary["netWorthValue"]}

Spending by category: {by_category}
Upcoming bills: {upcoming}
Recent transactions: {transactions}
"""

    client = Groq(api_key=groq_api_key)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": body.message},
        ],
    )

    return {"reply": response.choices[0].message.content}
