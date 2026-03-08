// API service for communicating with the backend
const API_BASE_URL = "http://localhost:8000";

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
    items: any[];
  };
  month: string;
}

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(
          "Backend server is not running. Please start the backend server on http://localhost:8000",
        );
      }
      throw error;
    }
  }

  async uploadStatement(
    file: File,
    month?: string,
  ): Promise<UploadStatementResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const url = month
      ? `${API_BASE_URL}/upload-statement?month=${encodeURIComponent(month)}`
      : `${API_BASE_URL}/upload-statement`;

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(
          "Backend server is not running. Please start the backend server on http://localhost:8000",
        );
      }
      throw error;
    }
  }

  async getSummary(month?: string): Promise<UploadStatementResponse> {
    const endpoint = month
      ? `/summary?month=${encodeURIComponent(month)}`
      : "/summary";

    return this.makeRequest<UploadStatementResponse>(endpoint, {
      method: "GET",
    });
  }
  async getStockHistory(symbol: string, days: number = 30) {
    return this.makeRequest(
      `/stock-history?symbol=${encodeURIComponent(symbol)}&days=${days}`,
      {
        method: "GET",
      },
    );
  }

  async getStockPrice(symbol: string) {
    return this.makeRequest(
      `/stock-price?symbol=${encodeURIComponent(symbol)}`,
      {
        method: "GET",
      },
    );
  }

  async getCryptoPrice(symbol: string) {
    return this.makeRequest(
      `/crypto-price?symbol=${encodeURIComponent(symbol)}`,
      {
        method: "GET",
      },
    );
  }
}

export const apiService = new ApiService();
