import csv
import io
from datetime import date, datetime
from typing import Dict, List, Optional

import pandas as pd

# ── Constants ────────────────────────────────────────────────────────────────

# Base net worth added on top of (income - expenses) as a starting balance
BASE_NET_WORTH = 10000

# Approximate split of expenses into variable (food, transport) vs fixed (rent, EMI)
VARIABLE_EXPENSE_RATIO = 0.6
FIXED_EXPENSE_RATIO = 0.4

# Default transactions used when no file is uploaded (for demo/testing)
MOCK_TRANSACTIONS: List[Dict] = [
    {
        "date": date(2025, 8, 1),
        "description": "Salary Credit",
        "debit": 0,
        "credit": 10000,
        "category": "Income",
    },
    {
        "date": date(2025, 8, 1),
        "description": "Zomato",
        "debit": 200,
        "credit": 0,
        "category": "Food",
    },
    {
        "date": date(2025, 8, 2),
        "description": "Uber",
        "debit": 300,
        "credit": 0,
        "category": "Transport",
    },
    {
        "date": date(2025, 8, 2),
        "description": "Grocery",
        "debit": 400,
        "credit": 0,
        "category": "Grocery",
    },
    {
        "date": date(2025, 8, 2),
        "description": "EMI",
        "debit": 500,
        "credit": 0,
        "category": "Loans & EMIs",
    },
    {
        "date": date(2025, 8, 4),
        "description": "Netflix",
        "debit": 100,
        "credit": 0,
        "category": "Personal Expenses",
    },
    {
        "date": date(2025, 8, 4),
        "description": "Electricity Bill",
        "debit": 200,
        "credit": 0,
        "category": "Bills",
    },
]


# ── Private Helpers ───────────────────────────────────────────────────────────


def _parse_amount(value) -> float:
    """Safely parse a numeric amount from string or number.
    Handles edge cases like commas (e.g. '1,500'), whitespace, and None.
    Returns 0.0 if parsing fails.
    """
    try:
        # Remove commas (e.g. "1,500" → "1500") and strip whitespace before converting
        return float(str(value).replace(",", "").strip())
    except (ValueError, TypeError):
        # Return 0.0 for any unparseable value instead of crashing
        return 0.0


def _build_transaction(
    raw_date, description: str, debit, credit, category: str
) -> Dict:
    """Build a normalized transaction dictionary from raw parsed values.
    Ensures all fields have safe default values if data is missing or malformed.
    """
    return {
        # Use provided date if it's already a date object, otherwise default to today
        "date": raw_date if isinstance(raw_date, date) else date.today(),
        "description": description or "Unknown",  # Fallback if description is empty
        "debit": _parse_amount(debit),  # Safely convert to float
        "credit": _parse_amount(credit),  # Safely convert to float
        "category": category or "Other",  # Fallback if category is missing
    }


def _get_transactions(
    file_content: Optional[bytes], file_type: Optional[str]
) -> List[Dict]:
    """Determine the correct parser based on file type and return parsed transactions.
    Falls back to MOCK_TRANSACTIONS if no file is provided or type is unsupported.
    """
    # No file uploaded — use demo data
    if not file_content or not file_type:
        return MOCK_TRANSACTIONS

    ft = file_type.lower()

    if ft == "csv":
        return parse_csv_file(file_content)
    if ft in ("xlsx", "xls"):
        return parse_excel_file(file_content)

    # Unsupported file type — fall back to mock data
    return MOCK_TRANSACTIONS


def _filter_by_month(transactions: List[Dict], month: str) -> List[Dict]:
    """Filter a list of transactions to only include those from a given month.
    Expects month in 'YYYY-MM' format (e.g. '2025-08').
    Returns all transactions unfiltered if the month string is invalid.
    """
    try:
        # Split 'YYYY-MM' into integer year and month for comparison
        year, mon = map(int, month.split("-"))
        return [
            t for t in transactions if t["date"].year == year and t["date"].month == mon
        ]
    except ValueError:
        # If month format is wrong, return all transactions instead of crashing
        return transactions


def _build_upcoming_bills(category_totals: Dict) -> List[Dict]:
    """Generate a list of upcoming bill reminders based on detected expense categories.
    Only includes bills for categories that actually appear in the transaction data.
    Note: Due dates are currently hardcoded — can be made dynamic in future.
    """
    upcoming = []

    # Remind about utility/electricity bill if those categories exist in data
    if "Bills" in category_totals or "Utilities" in category_totals:
        upcoming.append(
            {
                "text": "Electricity Bill",
                "category": "Utilities",
                "dueDate": "2025-08-28",
            }
        )

    # Remind about EMI/loan payment if that category exists
    if "Loans & EMIs" in category_totals:
        upcoming.append(
            {
                "text": "Credit Card Payment",
                "category": "EMI/Loan",
                "dueDate": "2025-08-25",
            }
        )

    # Remind about insurance renewal if that category exists
    if "Insurance" in category_totals:
        upcoming.append(
            {
                "text": "Health Insurance",
                "category": "Insurance",
                "dueDate": "2025-08-30",
            }
        )

    return upcoming


# ── File Parsers ──────────────────────────────────────────────────────────────


def parse_csv_file(file_content: bytes) -> List[Dict]:
    """Parse a CSV file and return a list of normalized transaction dicts.
    Expected CSV columns: Date (YYYY-MM-DD), Description, Debit, Credit, Category.
    Falls back to MOCK_TRANSACTIONS if parsing fails.
    """
    try:
        # Decode bytes to string and wrap in StringIO so csv.DictReader can read it
        csv_reader = csv.DictReader(io.StringIO(file_content.decode("utf-8")))
        transactions = []

        for row in csv_reader:
            try:
                # Parse date strictly as YYYY-MM-DD format
                raw_date = datetime.strptime(row.get("Date", ""), "%Y-%m-%d").date()
            except ValueError:
                # If date is missing or malformed, default to today
                raw_date = date.today()

            transactions.append(
                _build_transaction(
                    raw_date,
                    row.get("Description", ""),
                    row.get("Debit", 0),
                    row.get("Credit", 0),
                    row.get("Category", ""),
                )
            )

        return transactions

    except Exception as e:
        print(f"Error parsing CSV: {e}")
        return MOCK_TRANSACTIONS  # Safe fallback on any unexpected error


def parse_excel_file(file_content: bytes) -> List[Dict]:
    """Parse an Excel (.xlsx/.xls) file and return a list of normalized transaction dicts.
    Expected columns: Date, Description, Debit, Credit, Category.
    Falls back to MOCK_TRANSACTIONS if parsing fails.
    """
    try:
        # Wrap bytes in BytesIO so pandas can read it without saving to disk
        df = pd.read_excel(io.BytesIO(file_content))
        transactions = []

        for _, row in df.iterrows():
            try:
                # Use pandas date parser only if the 'Date' column exists in the file
                raw_date = (
                    pd.to_datetime(row.get("Date")).date()
                    if "Date" in df.columns
                    else date.today()
                )
            except (ValueError, TypeError):
                # Handle NaT or unparseable dates gracefully
                raw_date = date.today()

            transactions.append(
                _build_transaction(
                    raw_date,
                    str(row.get("Description", "")),
                    row.get("Debit", 0),
                    row.get("Credit", 0),
                    str(row.get("Category", "")),
                )
            )

        return transactions

    except Exception as e:
        print(f"Error parsing Excel: {e}")
        return MOCK_TRANSACTIONS  # Safe fallback on any unexpected error


# ── Main Summary Function ─────────────────────────────────────────────────────


def get_summary(
    month: Optional[str] = None,
    file_content: Optional[bytes] = None,
    file_type: Optional[str] = None,
) -> Dict:
    """Generate a complete financial summary from transaction data.

    Args:
        month: Optional filter in 'YYYY-MM' format (e.g. '2025-08')
        file_content: Raw bytes of an uploaded CSV or Excel file
        file_type: File extension string ('csv', 'xlsx', 'xls')

    Returns:
        Dict containing summary metrics, category breakdown,
        upcoming bills, and transaction list.
    """
    # Load transactions from file or fall back to mock data
    transactions = _get_transactions(file_content, file_type)

    # Apply month filter if provided
    if month:
        transactions = _filter_by_month(transactions, month)

    # Calculate total income (sum of all credits)
    income = sum(t["credit"] for t in transactions)

    # Calculate total expenses (sum of all debits)
    expenses = sum(t["debit"] for t in transactions)

    # Group expenses by category for the breakdown chart
    category_totals: Dict[str, float] = {}
    for t in transactions:
        if t["debit"] > 0:  # Only include expense entries, skip income credits
            category_totals[t["category"]] = (
                category_totals.get(t["category"], 0) + t["debit"]
            )

    return {
        "summary": {
            "incomeThisMonth": income,
            "expenseThisMonth": expenses,
            # Estimated variable spend (food, transport, etc.) based on fixed ratio
            "variableSpentSoFar": round(VARIABLE_EXPENSE_RATIO * expenses, 2),
            # Estimated fixed costs (rent, EMI, subscriptions) based on fixed ratio
            "fixedBills": round(FIXED_EXPENSE_RATIO * expenses, 2),
            # Savings = whatever is left after expenses (floor at 0)
            "plannedSavings": max(0, income - expenses),
            # Net worth change as a ratio of income (0 if no income)
            "netWorthDelta": round((income - expenses) / income, 4)
            if income > 0
            else 0,
            # Total estimated net worth including base starting balance
            "netWorthValue": max(0, income - expenses + BASE_NET_WORTH),
        },
        "byCategory": category_totals,
        "upcoming": _build_upcoming_bills(category_totals),
        "transactions": {
            "count": len(transactions),
            "items": transactions,
        },
        # Default to August 2025 if no month was specified
        "month": month or "2025-08",
    }
