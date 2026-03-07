// src/data/dashboard.ts
export type DashboardInputs = {
    netWorthDelta: number;        // e.g., +0.03 = +3%
    incomeThisMonth: number;      // total credits
    fixedBills: number;           // rent/EMI/utilities/subscriptions
    plannedSavings: number;       // SIP/targets
    variableSpentSoFar: number;   // variable spend to date
  };
  
  export const dashboardInputs: DashboardInputs = {
    netWorthDelta: 0.03,
    incomeThisMonth: 4200,
    fixedBills: 1800,
    plannedSavings: 300,
    variableSpentSoFar: 1000,
  };