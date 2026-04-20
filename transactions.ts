import type { AppData, Transaction, TransactionCategory } from "./types.js";
import { saveTransaction, deleteTransaction } from "./storage.js";
import { formatRWF, formatDate, generateId, getCurrentMonth } from "./utils.js";

// ─── Pure functions ────────────────────────────────────────────────────────────

export function getTransactionsByMonth(
  transactions: Transaction[],
  month: string   // "YYYY-MM"
): Transaction[] {
  return transactions.filter((t) => t.date.startsWith(month));
}

export function getTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getTotalExpenses(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getSpentByCategory(
  transactions: Transaction[],
  category: TransactionCategory,
  month: string
): number {
  return getTransactionsByMonth(transactions, month)
    .filter((t) => t.type === "expense" && t.category === category)
    .reduce((sum, t) => sum + t.amount, 0);
}

// ─── DOM rendering ─────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<TransactionCategory, string> = {
  income:        "💰",
  food:          "🍽️",
  transport:     "🚌",
  housing:       "🏠",
  entertainment: "🎬",
  health:        "💊",
  shopping:      "🛍️",
  education:     "📚",
  other:         "📌",
};

export function renderTransactions(
  container: HTMLElement,
  data: AppData,
  onDelete: (id: string) => void
): void {
  const month = getCurrentMonth();
  const list = getTransactionsByMonth(data.transactions, month)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (list.length === 0) {
    container.innerHTML = `<p class="empty-state">No transactions this month yet.</p>`;
    return;
  }

  container.innerHTML = list
    .map(
      (t) => `
    <div class="tx-row" data-id="${t.id}">
      <span class="tx-icon">${CATEGORY_ICONS[t.category]}</span>
      <div class="tx-info">
        <span class="tx-title">${t.title}</span>
        <span class="tx-meta">${t.category} · ${formatDate(t.date)}</span>
      </div>
      <span class="tx-amount ${t.type}">${t.type === "income" ? "+" : "-"}${formatRWF(t.amount)}</span>
      <button class="btn-icon delete-tx" data-id="${t.id}" title="Delete">✕</button>
    </div>`
    )
    .join("");

  container.querySelectorAll<HTMLButtonElement>(".delete-tx").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset["id"] ?? "";
      onDelete(id);
    });
  });
}

// ─── Form handling ─────────────────────────────────────────────────────────────

export function bindTransactionForm(
  form: HTMLFormElement,
  getData: () => AppData,
  setData: (d: AppData) => void,
  onSuccess: () => void
): void {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);

    const tx: Transaction = {
      id:       generateId(),
      title:    (fd.get("title") as string).trim(),
      amount:   Number(fd.get("amount")),
      type:     fd.get("type") as Transaction["type"],
      category: fd.get("category") as TransactionCategory,
      date:     fd.get("date") as string,
      note:     (fd.get("note") as string | null) ?? undefined,
    };

    const updated = saveTransaction(getData(), tx);
    setData(updated);
    form.reset();
    onSuccess();
  });
}
