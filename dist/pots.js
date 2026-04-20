import { savePot } from "./storage.js";
import { formatRWF, generateId } from "./utils.js";
// ─── DOM rendering ─────────────────────────────────────────────────────────────
export function renderPots(container, data, onAddMoney, onDelete) {
    if (data.pots.length === 0) {
        container.innerHTML = `<p class="empty-state">No savings pots yet.</p>`;
        return;
    }
    container.innerHTML = data.pots
        .map((pot) => {
        const pct = Math.min(100, Math.round((pot.saved / pot.target) * 100));
        return `
    <div class="pot-card">
      <div class="pot-header">
        <span class="pot-emoji">${pot.emoji}</span>
        <div class="pot-info">
          <span class="pot-name">${pot.name}</span>
          <span class="pot-meta">${pct}% of goal</span>
        </div>
        <button class="btn-icon delete-pot" data-id="${pot.id}" title="Delete">✕</button>
      </div>
      <div class="pot-bar-track">
        <div class="pot-bar-fill" style="width:${pct}%; background:${pot.color}"></div>
      </div>
      <div class="pot-numbers">
        <span style="color:${pot.color};font-weight:600">${formatRWF(pot.saved)}</span>
        <span class="pot-target">/ ${formatRWF(pot.target)}</span>
      </div>
      <div class="pot-add-row">
        <input class="pot-amount-input" type="number" min="1" placeholder="Amount (RWF)" data-id="${pot.id}"/>
        <button class="btn-secondary add-to-pot" data-id="${pot.id}">Add →</button>
      </div>
    </div>`;
    })
        .join("");
    container.querySelectorAll(".add-to-pot").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = btn.dataset["id"] ?? "";
            const input = container.querySelector(`.pot-amount-input[data-id="${id}"]`);
            const amount = Number(input?.value ?? 0);
            if (amount > 0) {
                onAddMoney(id, amount);
                if (input)
                    input.value = "";
            }
        });
    });
    container.querySelectorAll(".delete-pot").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = btn.dataset["id"] ?? "";
            onDelete(id);
        });
    });
}
// ─── Form handling ─────────────────────────────────────────────────────────────
export function bindPotForm(form, getData, setData, onSuccess) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const pot = {
            id: generateId(),
            name: fd.get("name").trim(),
            target: Number(fd.get("target")),
            saved: 0,
            color: fd.get("color") || "#4f7eff",
            emoji: fd.get("emoji") || "💰",
        };
        const updated = savePot(getData(), pot);
        setData(updated);
        form.reset();
        onSuccess();
    });
}
export function addMoneyToPot(data, id, amount) {
    const pots = data.pots.map((p) => p.id === id ? { ...p, saved: p.saved + amount } : p);
    const updated = { ...data, pots };
    return updated;
}
