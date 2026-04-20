import { saveTransaction } from "./storage.js";
import { formatRWF, formatDate, generateId, getCurrentMonth } from "./utils.js";
// ─── State ─────────────────────────────────────────────────────────────────────
let currentPage = 1;
const itemsPerPage = 10;
let searchTerm = "";
let sortBy = "latest";
let filterCategory = "all";
// ─── Pure functions ────────────────────────────────────────────────────────────
export function getTransactionsByMonth(transactions, month // "YYYY-MM"
) {
    return transactions.filter((t) => t.date.startsWith(month));
}
export function getTotalIncome(transactions) {
    return transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
}
export function getTotalExpenses(transactions) {
    return transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
}
export function getSpentByCategory(transactions, category, month) {
    return getTransactionsByMonth(transactions, month)
        .filter((t) => t.type === "expense" && t.category === category)
        .reduce((sum, t) => sum + t.amount, 0);
}
function filterTransactions(transactions) {
    let filtered = transactions;
    // Filter by search term
    if (searchTerm) {
        filtered = filtered.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.category.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    // Filter by category
    if (filterCategory !== "all") {
        filtered = filtered.filter(t => t.category === filterCategory);
    }
    // Sort
    switch (sortBy) {
        case "latest":
            filtered.sort((a, b) => b.date.localeCompare(a.date));
            break;
        case "oldest":
            filtered.sort((a, b) => a.date.localeCompare(b.date));
            break;
        case "amount-high":
            filtered.sort((a, b) => b.amount - a.amount);
            break;
        case "amount-low":
            filtered.sort((a, b) => a.amount - b.amount);
            break;
    }
    return filtered;
}
function getPaginatedTransactions(transactions) {
    const filtered = filterTransactions(transactions);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
}
function getTotalPages(transactions) {
    const filtered = filterTransactions(transactions);
    return Math.ceil(filtered.length / itemsPerPage);
}
// ─── DOM rendering ─────────────────────────────────────────────────────────────
const CATEGORY_ICONS = {
    income: "💰",
    food: "🍽️",
    transport: "🚌",
    housing: "🏠",
    entertainment: "🎬",
    health: "💊",
    shopping: "🛍️",
    education: "📚",
    other: "📌",
};
export function renderTransactions(container, data, onDelete) {
    const month = getCurrentMonth();
    const monthTransactions = getTransactionsByMonth(data.transactions, month);
    const paginatedTransactions = getPaginatedTransactions(monthTransactions);
    const totalPages = getTotalPages(monthTransactions);
    // Clear container
    container.innerHTML = "";
    if (paginatedTransactions.length === 0) {
        container.innerHTML = `<tr><td colspan="5" class="no-results">No results.</td></tr>`;
        updatePaginationButtons(totalPages);
        return;
    }
    // Render table rows
    container.innerHTML = paginatedTransactions
        .map((t) => `
      <tr data-id="${t.id}">
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>${CATEGORY_ICONS[t.category]}</span>
            <span>${t.title}</span>
          </div>
        </td>
        <td>
          <span style="padding: 4px 8px; background: var(--bg); border-radius: 4px; font-size: 12px;">
            ${t.category}
          </span>
        </td>
        <td>${formatDate(t.date)}</td>
        <td style="color: ${t.type === 'income' ? 'var(--green)' : 'var(--red)'}; font-weight: 600;">
          ${t.type === "income" ? "+" : "-"}${formatRWF(t.amount)}
        </td>
        <td>
          <button class="btn-icon delete-tx" data-id="${t.id}" title="Delete" style="background: none; border: none; cursor: pointer; color: var(--muted);">✕</button>
        </td>
      </tr>`)
        .join("");
    // Add delete event listeners
    container.querySelectorAll(".delete-tx").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = btn.dataset["id"] ?? "";
            onDelete(id);
        });
    });
    updatePaginationButtons(totalPages);
}
function updatePaginationButtons(totalPages) {
    const prevBtn = document.getElementById("prev-page-btn");
    const nextBtn = document.getElementById("next-page-btn");
    if (prevBtn && nextBtn) {
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    }
}
// ─── Event handlers ───────────────────────────────────────────────────────────
export function bindTransactionControls(data, renderCallback) {
    // Search input
    const searchInput = document.getElementById("transaction-search");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            searchTerm = e.target.value;
            currentPage = 1;
            renderCallback();
        });
    }
    // Sort dropdown
    const sortSelect = document.getElementById("sort-transactions");
    if (sortSelect) {
        sortSelect.addEventListener("change", (e) => {
            sortBy = e.target.value;
            currentPage = 1;
            renderCallback();
        });
    }
    // Filter dropdown
    const filterSelect = document.getElementById("filter-transactions");
    if (filterSelect) {
        // Populate categories
        const categories = [...new Set(data.transactions.map(t => t.category))];
        filterSelect.innerHTML = '<option value="all">All Transactions</option>' +
            categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        filterSelect.addEventListener("change", (e) => {
            filterCategory = e.target.value;
            currentPage = 1;
            renderCallback();
        });
    }
    // Pagination buttons
    const prevBtn = document.getElementById("prev-page-btn");
    const nextBtn = document.getElementById("next-page-btn");
    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                renderCallback();
            }
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            const month = getCurrentMonth();
            const monthTransactions = getTransactionsByMonth(data.transactions, month);
            const totalPages = getTotalPages(monthTransactions);
            if (currentPage < totalPages) {
                currentPage++;
                renderCallback();
            }
        });
    }
}
// ─── Form handling ─────────────────────────────────────────────────────────────
export function bindTransactionForm(form, getData, setData, onSuccess) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const tx = {
            id: generateId(),
            title: fd.get("title").trim(),
            amount: Number(fd.get("amount")),
            type: fd.get("type"),
            category: fd.get("category"),
            date: fd.get("date"),
            note: fd.get("note") ?? undefined,
        };
        const updated = saveTransaction(getData(), tx);
        setData(updated);
        form.reset();
        onSuccess();
    });
}
