import type { AppData, Transaction, Budget, SavingsPot, RecurringBill } from "./types.js";

const STORAGE_KEY = "finance_app_data";

// ─── Seed data ─────────────────────────────────────────────────────────────────

function seedData(): AppData {
  const now = new Date();
  const month = now.toISOString().slice(0, 7);

  const transactions: Transaction[] = [
    { id: "t1", title: "Salary", amount: 850000, type: "income",  category: "income",        date: `${month}-01` },
    { id: "t2", title: "Rent",   amount: 150000, type: "expense", category: "housing",       date: `${month}-02` },
    { id: "t3", title: "Groceries", amount: 32000, type: "expense", category: "food",        date: `${month}-05` },
    { id: "t4", title: "Moto taxi", amount: 5000,  type: "expense", category: "transport",   date: `${month}-07` },
    { id: "t5", title: "Freelance", amount: 120000, type: "income", category: "income",      date: `${month}-10` },
    { id: "t6", title: "Electricity", amount: 18000, type: "expense", category: "housing",   date: `${month}-12` },
    { id: "t7", title: "Cinema", amount: 8000,   type: "expense", category: "entertainment", date: `${month}-14` },
    { id: "t8", title: "Pharmacy", amount: 12000, type: "expense", category: "health",       date: `${month}-16` },
  ];

  const budgets: Budget[] = [
    { id: "b1", category: "food",          limit: 80000,  month },
    { id: "b2", category: "transport",     limit: 30000,  month },
    { id: "b3", category: "entertainment", limit: 25000,  month },
    { id: "b4", category: "health",        limit: 40000,  month },
  ];

  const pots: SavingsPot[] = [
    { id: "p1", name: "Emergency fund", target: 500000, saved: 180000, color: "#4f7eff", emoji: "🛡️" },
    { id: "p2", name: "New laptop",     target: 350000, saved: 95000,  color: "#22c98e", emoji: "💻" },
    { id: "p3", name: "Vacation",       target: 200000, saved: 45000,  color: "#f5a623", emoji: "✈️" },
  ];

  const recurringBills: RecurringBill[] = [
    { id: "r1", title: "Netflix", amount: 12000, frequency: "monthly", category: "entertainment", nextDue: `${month}-25` },
    { id: "r2", title: "Internet", amount: 25000, frequency: "monthly", category: "other", nextDue: `${month}-28` },
  ];

  return { transactions, budgets, pots, recurringBills };
}

// ─── Public API ────────────────────────────────────────────────────────────────

export function loadData(): AppData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = seedData();
    saveData(initial);
    return initial;
  }
  return JSON.parse(raw) as AppData;
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ─── Individual savers ─────────────────────────────────────────────────────────

export function saveTransaction(data: AppData, tx: Transaction): AppData {
  const updated: AppData = {
    ...data,
    transactions: [...data.transactions, tx],
  };
  saveData(updated);
  return updated;
}

export function deleteTransaction(data: AppData, id: string): AppData {
  const updated: AppData = {
    ...data,
    transactions: data.transactions.filter((t) => t.id !== id),
  };
  saveData(updated);
  return updated;
}

export function saveBudget(data: AppData, budget: Budget): AppData {
  const exists = data.budgets.findIndex((b) => b.id === budget.id);
  const budgets =
    exists >= 0
      ? data.budgets.map((b) => (b.id === budget.id ? budget : b))
      : [...data.budgets, budget];
  const updated: AppData = { ...data, budgets };
  saveData(updated);
  return updated;
}

export function deleteBudget(data: AppData, id: string): AppData {
  const updated: AppData = {
    ...data,
    budgets: data.budgets.filter((b) => b.id !== id),
  };
  saveData(updated);
  return updated;
}

export function savePot(data: AppData, pot: SavingsPot): AppData {
  const exists = data.pots.findIndex((p) => p.id === pot.id);
  const pots =
    exists >= 0
      ? data.pots.map((p) => (p.id === pot.id ? pot : p))
      : [...data.pots, pot];
  const updated: AppData = { ...data, pots };
  saveData(updated);
  return updated;
}

export function deletePot(data: AppData, id: string): AppData {
  const updated: AppData = {
    ...data,
    pots: data.pots.filter((p) => p.id !== id),
  };
  saveData(updated);
  return updated;
}

export function saveRecurringBill(data: AppData, bill: RecurringBill): AppData {
  const exists = data.recurringBills.findIndex((b) => b.id === bill.id);
  const recurringBills =
    exists >= 0
      ? data.recurringBills.map((b) => (b.id === bill.id ? bill : b))
      : [...data.recurringBills, bill];
  const updated: AppData = { ...data, recurringBills };
  saveData(updated);
  return updated;
}

export function deleteRecurringBill(data: AppData, id: string): AppData {
  const updated: AppData = {
    ...data,
    recurringBills: data.recurringBills.filter((b) => b.id !== id),
  };
  saveData(updated);
  return updated;
}
