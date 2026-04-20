import { loadData, saveData, deleteTransaction, deleteBudget, deletePot } from "./storage.js";
import { renderDashboard, renderRecentTransactions } from "./dashboard.js";
import { renderTransactions, bindTransactionForm, bindTransactionControls } from "./transactions.js";
import { renderBudgets, bindBudgetForm } from "./budgets.js";
import { renderPots, bindPotForm, addMoneyToPot } from "./pots.js";
import { renderRecurringBills, bindRecurringForm } from "./recurring-bills.js";
// ─── State ─────────────────────────────────────────────────────────────────────
let appData = loadData();
function getData() { return appData; }
function setData(d) {
    appData = d;
    refresh();
}
function navigate(page) {
    document.querySelectorAll(".page").forEach((el) => {
        el.hidden = el.id !== `page-${page}`;
    });
    document.querySelectorAll(".nav-link").forEach((el) => {
        el.classList.toggle("active", el.dataset["page"] === page);
    });
    refresh();
}
// ─── Render ────────────────────────────────────────────────────────────────────
function refresh() {
    // Dashboard
    const dashContainer = document.getElementById("dashboard-content");
    if (dashContainer && !dashContainer.closest(".page")?.hasAttribute("hidden")) {
        renderDashboard(dashContainer, appData);
        const recentContainer = document.getElementById("recent-tx-list");
        if (recentContainer)
            renderRecentTransactions(recentContainer, appData);
    }
    // Transactions
    const txContainer = document.getElementById("tx-list");
    if (txContainer && !txContainer.closest(".page")?.hasAttribute("hidden")) {
        renderTransactions(txContainer, appData, (id) => {
            setData(deleteTransaction(appData, id));
        });
        bindTransactionControls(appData, () => refresh());
    }
    // Budgets
    const budgetContainer = document.getElementById("budget-list");
    if (budgetContainer && !budgetContainer.closest(".page")?.hasAttribute("hidden")) {
        renderBudgets(budgetContainer, appData, (id) => {
            setData(deleteBudget(appData, id));
        });
    }
    // Pots
    const potsContainer = document.getElementById("pots-list");
    if (potsContainer && !potsContainer.closest(".page")?.hasAttribute("hidden")) {
        renderPots(potsContainer, appData, (id, amount) => {
            const updated = addMoneyToPot(appData, id, amount);
            saveData(updated);
            setData(updated);
        }, (id) => {
            setData(deletePot(appData, id));
        });
    }
    // Recurring Bills
    const recurringContainer = document.getElementById("recurring-list");
    if (recurringContainer && !recurringContainer.closest(".page")?.hasAttribute("hidden")) {
        renderRecurringBills(recurringContainer, appData);
    }
}
// ─── Init ──────────────────────────────────────────────────────────────────────
function init() {
    // Nav links
    document.querySelectorAll("[data-nav]").forEach((el) => {
        el.addEventListener("click", (e) => {
            e.preventDefault();
            navigate(el.dataset["nav"]);
        });
    });
    // Modals
    document.querySelectorAll("[data-modal-open]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = btn.dataset["modalOpen"] ?? "";
            document.getElementById(id)?.removeAttribute("hidden");
        });
    });
    document.querySelectorAll("[data-modal-close]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = btn.dataset["modalClose"] ?? "";
            document.getElementById(id)?.setAttribute("hidden", "");
        });
    });
    // Forms
    const txForm = document.getElementById("tx-form");
    if (txForm)
        bindTransactionForm(txForm, getData, setData, () => {
            document.getElementById("modal-add-tx")?.setAttribute("hidden", "");
        });
    const budgetForm = document.getElementById("budget-form");
    if (budgetForm)
        bindBudgetForm(budgetForm, getData, setData, () => {
            document.getElementById("modal-add-budget")?.setAttribute("hidden", "");
        });
    const potForm = document.getElementById("pot-form");
    if (potForm)
        bindPotForm(potForm, getData, setData, () => {
            document.getElementById("modal-add-pot")?.setAttribute("hidden", "");
        });
    const recurringForm = document.getElementById("recurring-form");
    if (recurringForm)
        bindRecurringForm(recurringForm, appData, setData);
    navigate("dashboard");
}
document.addEventListener("DOMContentLoaded", init);
