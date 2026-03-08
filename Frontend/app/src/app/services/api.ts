// ── Config ────────────────────────────────────────────────────────────────────

// Base URL for all backend API requests
// Set NEXT_PUBLIC_API_URL in .env.local to override for production
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface TransactionItem {
  date: string;
  description: string;
  debit: number;
  credit: number;
  category: string;
}

export interface FinancialSummary {
  incomeThisMonth: number;
  expenseThisMonth: number;
  variableSpentSoFar: number;
  fixedBills: number;
  plannedSavings: number;
  netWorthDelta: number | null;
  netWorthValue?: number | null;
}

export interface UpcomingBill {
  text: string;
  category: string;
  dueDate: string;
}

export interface UploadStatementResponse {
  summary: FinancialSummary;
  byCategory: Record<string, number>;
  upcoming: UpcomingBill[];
  transactions: {
    count: number;
    items: TransactionItem[]; // Typed properly instead of any[]
  };
  month: string;
}

export interface StockDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockHistoryResponse {
  symbol: string;
  data: StockDataPoint[];
}

export interface PriceResponse {
  symbol: string;
  price: number;
}

// ── API Service ───────────────────────────────────────────────────────────────

class ApiService {
  /**
   * Central request handler for all API calls.
   * Handles JSON responses, error status codes, and network failures.
   * For file uploads, pass FormData as body and omit Content-Type
   * (the browser sets it automatically with the correct multipart boundary).
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          // Only set Content-Type for non-FormData requests
          // FormData needs the browser to set its own multipart boundary
          ...(options.body instanceof FormData
            ? {}
            : { "Content-Type": "application/json" }),
          ...options.headers,
        },
      });

      if (!response.ok) {
        // Include status code and server message for easier debugging
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      return response.json() as Promise<T>;
    } catch (error) {
      // Provide a helpful message when the backend server isn't running
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(
          `Cannot reach backend at ${API_BASE_URL}. Make sure the server is running.`,
        );
      }
      throw error;
    }
  }

  // ── Financial Data ──────────────────────────────────────────────────────────

  /**
   * Upload a bank statement file (CSV or Excel) and get a financial summary.
   * Optionally filter results by month in YYYY-MM format.
   */
  async uploadStatement(
    file: File,
    month?: string,
  ): Promise<UploadStatementResponse> {
    const formData = new FormData();
    formData.append("file", file);

    // Append month as a query param if provided
    const endpoint = month
      ? `/upload-statement?month=${encodeURIComponent(month)}`
      : "/upload-statement";

    return this.makeRequest<UploadStatementResponse>(endpoint, {
      method: "POST",
      body: formData, // FormData — Content-Type is handled automatically
    });
  }

  /**
   * Fetch a financial summary without uploading a file.
   * Uses mock/demo data on the backend when no file has been uploaded.
   */
  async getSummary(month?: string): Promise<UploadStatementResponse> {
    const endpoint = month
      ? `/summary?month=${encodeURIComponent(month)}`
      : "/summary";

    return this.makeRequest<UploadStatementResponse>(endpoint, {
      method: "GET",
    });
  }

  // ── Market Data ─────────────────────────────────────────────────────────────

  /**
   * Fetch daily OHLCV price history for a stock over the last N days.
   */
  async getStockHistory(
    symbol: string,
    days: number = 30,
  ): Promise<StockHistoryResponse> {
    return this.makeRequest<StockHistoryResponse>(
      `/stock-history?symbol=${encodeURIComponent(symbol)}&days=${days}`,
      { method: "GET" },
    );
  }

  /**
   * Fetch the current price of a stock by ticker symbol.
   */
  async getStockPrice(symbol: string): Promise<PriceResponse> {
    return this.makeRequest<PriceResponse>(
      `/stock-price?symbol=${encodeURIComponent(symbol)}`,
      { method: "GET" },
    );
  }

  /**
   * Fetch the current USD price of a cryptocurrency by CoinGecko ID.
   */
  async getCryptoPrice(symbol: string): Promise<PriceResponse> {
    return this.makeRequest<PriceResponse>(
      `/crypto-price?symbol=${encodeURIComponent(symbol)}`,
      { method: "GET" },
    );
  }
  /**
   * Send a chat message to the AI financial assistant.
   * Returns the assistant's reply as a string.
   */
  async chat(
    message: string,
    personalityPrompt?: string,
  ): Promise<{ reply: string }> {
    return this.makeRequest<{ reply: string }>("/chat", {
      method: "POST",
      body: JSON.stringify({ message, personality_prompt: personalityPrompt }),
    });
  }
}

// Export a single shared instance — no need to instantiate this elsewhere
export const apiService = new ApiService();
