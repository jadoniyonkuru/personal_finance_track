import type { AppData, BalanceSummary } from "./types.js";
import { getTotalIncome, getTotalExpenses, getTransactionsByMonth } from "./transactions.js";
import { formatRWF, getCurrentMonth } from "./utils.js";

// ─── Pure function ─────────────────────────────────────────────────────────────

export function getBalanceSummary(data: AppData): BalanceSummary {
  const month = getCurrentMonth();
  const monthlyTx = getTransactionsByMonth(data.transactions, month);
  const totalIncome   = getTotalIncome(monthlyTx);
  const totalExpenses = getTotalExpenses(monthlyTx);
  const balance       = totalIncome - totalExpenses;
  return { balance, totalIncome, totalExpenses };
}

// ─── DOM rendering ─────────────────────────────────────────────────────────────

export function renderDashboard(container: HTMLElement, data: AppData): void {
  const { balance, totalIncome, totalExpenses } = getBalanceSummary(data);
  const savingsRate =
    totalIncome > 0
      ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)
      : 0;

  const cards: { label: string; value: string; accent: string }[] = [
    { label: "Balance",       value: formatRWF(balance),       accent: balance >= 0 ? "var(--green)" : "var(--red)" },
    { label: "Income",        value: formatRWF(totalIncome),   accent: "var(--green)" },
    { label: "Expenses",      value: formatRWF(totalExpenses), accent: "var(--red)" },
    { label: "Savings rate",  value: `${savingsRate}%`,        accent: "var(--accent)" },
  ];

  container.innerHTML = `
    <div class="summary-grid">
      ${cards
        .map(
          (c) => `
      <div class="summary-card">
        <p class="summary-label">${c.label}</p>
        <p class="summary-value" style="color:${c.accent}">${c.value}</p>
      </div>`
        )
        .join("")}
    </div>
    <div class="recent-label">
      <span>Recent transactions</span>
      <a href="#" data-nav="transactions" class="view-all-link">View all →</a>
    </div>
    <div id="recent-tx-list"></div>`;
}

export function renderRecentTransactions(
  container: HTMLElement,
  data: AppData
): void {
  const month = getCurrentMonth();
  const recent = getTransactionsByMonth(data.transactions, month)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const ICONS: Record<string, string> = {
    income: "💰", food: "🍽️", transport: "🚌", housing: "🏠",
    entertainment: "🎬", health: "💊", shopping: "🛍️", education: "📚", other: "📌",
  };

  if (recent.length === 0) {
    container.innerHTML = `<p class="empty-state">No transactions yet this month.</p>`;
    return;
  }

  container.innerHTML = recent
    .map(
      (t) => `
  <div class="tx-row mini">
    <span class="tx-icon">${ICONS[t.category] ?? "📌"}</span>
    <div class="tx-info">
      <span class="tx-title">${t.title}</span>
      <span class="tx-meta">${t.date}</span>
    </div>
    <span class="tx-amount ${t.type}">${t.type === "income" ? "+" : "-"}${formatRWF(t.amount)}</span>
  </div>`
    )
    .join("");
}
