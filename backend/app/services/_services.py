from datetime import date, datetime
from typing import List, Dict, Optional
import csv
import io
import pandas as pd

# Default mock data for when no file is uploaded
mock_transaction = [{
    "date": date(2025, 8, 1),
    "description": "Salary Credit",
    "debit": 0,
    "credit": 10000,
    "category": "Income"
}, {
    "date": date(2025, 8, 1),
    "description": "Zomato",
    "debit": 200,
    "credit": 0,
    "category": "Food"
}, {
    "date": date(2025, 8, 2),
    "description": "Uber",
    "debit": 300,
    "credit": 0,
    "category": "Transport"
}, {
    "date": date(2025, 8, 2),
    "description": "Grocery",
    "debit": 400,
    "credit": 0,
    "category": "Grocery"
}, {
    "date": date(2025, 8, 2),
    "description": "EMI",
    "debit": 500,
    "credit": 0,
    "category": "Loans & EMIs"
}, {
    "date": date(2025, 8, 4),
    "description": "Netflix",
    "debit": 100,
    "credit": 0,
    "category": "Personal Expenses"
}, {
    "date": date(2025, 8, 4),
    "description": "Electricity Bill",
    "debit": 200,
    "credit": 0,
    "category": "Bills"
}]

def parse_csv_file(file_content: bytes) -> List[Dict]:
    """Parse CSV file content and return list of transactions"""
    try:
        # Try to read as CSV
        csv_content = file_content.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(csv_content))
        
        transactions = []
        for row in csv_reader:
            # Parse date
            try:
                if 'Date' in row:
                    transaction_date = datetime.strptime(row['Date'], '%Y-%m-%d').date()
                else:
                    transaction_date = date.today()
            except:
                transaction_date = date.today()
            
            # Parse amounts
            debit = float(row.get('Debit', 0)) if row.get('Debit', '0').replace('.', '').isdigit() else 0
            credit = float(row.get('Credit', 0)) if row.get('Credit', '0').replace('.', '').isdigit() else 0
            
            transactions.append({
                "date": transaction_date,
                "description": row.get('Description', 'Unknown'),
                "debit": debit,
                "credit": credit,
                "category": row.get('Category', 'Other')
            })
        
        return transactions
    except Exception as e:
        print(f"Error parsing CSV: {e}")
        return mock_transaction

def parse_excel_file(file_content: bytes) -> List[Dict]:
    """Parse Excel file content and return list of transactions"""
    try:
        # Read Excel file
        df = pd.read_excel(io.BytesIO(file_content))
        
        transactions = []
        for _, row in df.iterrows():
            # Parse date
            try:
                if 'Date' in df.columns:
                    transaction_date = pd.to_datetime(row['Date']).date()
                else:
                    transaction_date = date.today()
            except:
                transaction_date = date.today()
            
            # Parse amounts
            debit = float(row.get('Debit', 0)) if pd.notna(row.get('Debit', 0)) else 0
            credit = float(row.get('Credit', 0)) if pd.notna(row.get('Credit', 0)) else 0
            
            transactions.append({
                "date": transaction_date,
                "description": str(row.get('Description', 'Unknown')),
                "debit": debit,
                "credit": credit,
                "category": str(row.get('Category', 'Other'))
            })
        
        return transactions
    except Exception as e:
        print(f"Error parsing Excel: {e}")
        return mock_transaction

def get_summary(month: Optional[str] = None, file_content: Optional[bytes] = None, file_type: Optional[str] = None) -> Dict:
    """Generate financial summary from transactions"""
    
    # Use uploaded file data or fall back to mock data
    if file_content and file_type:
        if file_type.lower() == 'csv':
            transactions = parse_csv_file(file_content)
        elif file_type.lower() in ['xlsx', 'xls']:
            transactions = parse_excel_file(file_content)
        else:
            transactions = mock_transaction
    else:
        transactions = mock_transaction
    
    # Filter by month if specified
    if month:
        try:
            target_year, target_month = month.split('-')
            filtered_transactions = [
                t for t in transactions 
                if t["date"].year == int(target_year) and t["date"].month == int(target_month)
            ]
            transactions = filtered_transactions
        except:
            pass  # If month parsing fails, use all transactions
    
    # Calculate financial metrics
    income = sum(t["credit"] for t in transactions)
    expenses = sum(t["debit"] for t in transactions)
    variable_spent = 0.6 * expenses
    fixed_bills = 0.4 * expenses
    
    # Calculate net worth (simplified)
    net_worth_value = income - expenses + 10000  # Base net worth
    net_worth_delta = (income - expenses) / max(income, 1) if income > 0 else 0
    
    # Categorize expenses
    category = {}
    for t in transactions:
        if t["debit"] > 0:  # Only count expenses, not income
            category[t["category"]] = category.get(t["category"], 0) + t["debit"]
    
    # Generate upcoming bills based on transaction patterns
    upcoming = []
    if "Utilities" in category or "Bills" in category:
        upcoming.append({"text": "Electricity Bill", "category": "Utilities", "dueDate": "2025-08-28"})
    if "Loans & EMIs" in category or "EMI" in category:
        upcoming.append({"text": "Credit Card Payment", "category": "EMI/Loan", "dueDate": "2025-08-25"})
    if "Insurance" in category:
        upcoming.append({"text": "Health Insurance", "category": "Insurance", "dueDate": "2025-08-30"})
    
    return {
        "summary": {
            "incomeThisMonth": income,
            "expenseThisMonth": expenses,
            "variableSpentSoFar": variable_spent,
            "fixedBills": fixed_bills,
            "plannedSavings": max(0, income - expenses),
            "netWorthDelta": net_worth_delta,
            "netWorthValue": max(0, net_worth_value),
        },
        "byCategory": category,
        "upcoming": upcoming,
        "transactions": {
            "count": len(transactions),
            "items": transactions,
        },
        "month": month or "2025-08",
    }
