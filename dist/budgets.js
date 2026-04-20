import { saveBudget, deleteBudget } from "./storage.js";
import { formatRWF, generateId, getCurrentMonth } from "./utils.js";
import { getSpentByCategory } from "./transactions.js";
// ─── Pure functions ────────────────────────────────────────────────────────────
export function getBudgetProgress(data, month) {
    return data.budgets
        .filter((b) => b.month === month)
        .map((budget) => {
        const spent = getSpentByCategory(data.transactions, budget.category, month);
        const remaining = Math.max(0, budget.limit - spent);
        const percentage = Math.min(100, Math.round((spent / budget.limit) * 100));
        return { budget, spent, remaining, percentage };
    });
}
// ─── DOM rendering ─────────────────────────────────────────────────────────────
export function renderBudgets(container, data, onDelete) {
    const month = getCurrentMonth();
    const progress = getBudgetProgress(data, month);
    if (progress.length === 0) {
        container.innerHTML = `<p class="empty-state">No budgets set for this month.</p>`;
        return;
    }
    container.innerHTML = progress
        .map(({ budget, spent, remaining, percentage }) => {
        const status = percentage >= 100 ? "over" : percentage >= 80 ? "warning" : "ok";
        return `
    <div class="budget-card">
      <div class="budget-header">
        <span class="budget-category">${budget.category}</span>
        <button class="btn-icon delete-budget" data-id="${budget.id}" title="Delete">✕</button>
      </div>
      <div class="budget-bar-track">
        <div class="budget-bar-fill ${status}" style="width:${percentage}%"></div>
      </div>
      <div class="budget-numbers">
        <span class="spent">${formatRWF(spent)} spent</span>
        <span class="limit">${formatRWF(budget.limit)} limit</span>
      </div>
      <p class="budget-remaining ${status}">
        ${percentage >= 100 ? `⚠️ Over by ${formatRWF(spent - budget.limit)}` : `${formatRWF(remaining)} remaining`}
      </p>
    </div>`;
    })
        .join("");
    container.querySelectorAll(".delete-budget").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = btn.dataset["id"] ?? "";
            onDelete(id);
        });
    });
}
// ─── Form handling ─────────────────────────────────────────────────────────────
export function bindBudgetForm(form, getData, setData, onSuccess) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const budget = {
            id: generateId(),
            category: fd.get("category"),
            limit: Number(fd.get("limit")),
            month: getCurrentMonth(),
        };
        const updated = saveBudget(getData(), budget);
        setData(updated);
        form.reset();
        onSuccess();
    });
}
export function bindDeleteBudget(getData, setData) {
    return (id) => {
        const updated = deleteBudget(getData(), id);
        setData(updated);
    };
}
