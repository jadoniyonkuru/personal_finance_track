// ─── Core types ───────────────────────────────────────────────────────────────

export type TransactionCategory =
  | "income"
  | "food"
  | "transport"
  | "housing"
  | "entertainment"
  | "health"
  | "shopping"
  | "education"
  | "other";

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  title: string;
  amount: number;          // always positive; type determines sign
  type: TransactionType;
  category: TransactionCategory;
  date: string;            // ISO date string
  note?: string;
}

export interface Budget {
  id: string;
  category: TransactionCategory;
  limit: number;           // monthly spending cap
  month: string;           // "YYYY-MM"
}

export type RecurringFrequency = "monthly" | "weekly" | "yearly";

export interface RecurringBill {
  id: string;
  title: string;
  amount: number;
  frequency: RecurringFrequency;
  category: TransactionCategory;
  nextDue: string;         // ISO date string
}

export interface SavingsPot {
  id: string;
  name: string;
  target: number;
  saved: number;
  color: string;           // CSS hex
  emoji: string;
}

export interface AppData {
  transactions: Transaction[];
  budgets: Budget[];
  pots: SavingsPot[];
  recurringBills: RecurringBill[];
}

// ─── Summary helpers ───────────────────────────────────────────────────────────

export interface BalanceSummary {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
}

export interface BudgetProgress {
  budget: Budget;
  spent: number;
  remaining: number;
  percentage: number;      // 0–100
}
