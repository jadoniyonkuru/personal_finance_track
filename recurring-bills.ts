import type { AppData, RecurringBill } from "./types.js";

export function renderRecurringBills(container: HTMLElement, data: AppData): void {
  container.innerHTML = "";

  if (data.recurringBills.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No recurring bills yet. Add your first recurring bill to get started.</p>
      </div>
    `;
    return;
  }

  const billsGrid = document.createElement("div");
  billsGrid.className = "recurring-grid";

  data.recurringBills.forEach((bill) => {
    const billCard = document.createElement("div");
    billCard.className = "recurring-card";
    
    const nextDueDate = new Date(bill.nextDue);
    const today = new Date();
    const daysUntilDue = Math.ceil((nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    billCard.innerHTML = `
      <div class="recurring-header">
        <h3>${bill.title}</h3>
        <span class="recurring-amount">RWF ${bill.amount.toLocaleString()}</span>
      </div>
      <div class="recurring-details">
        <span class="recurring-frequency">${bill.frequency}</span>
        <span class="recurring-category">${bill.category}</span>
      </div>
      <div class="recurring-due">
        Due in ${daysUntilDue} days (${nextDueDate.toLocaleDateString()})
      </div>
      <div class="recurring-actions">
        <button class="btn-small btn-delete" data-id="${bill.id}">Delete</button>
      </div>
    `;
    
    billsGrid.appendChild(billCard);
  });

  container.appendChild(billsGrid);
}

export function bindRecurringForm(form: HTMLFormElement, data: AppData, setData: (data: AppData) => void): void {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const newBill: RecurringBill = {
      id: crypto.randomUUID(),
      title: formData.get("title") as string,
      amount: Number(formData.get("amount")),
      frequency: formData.get("frequency") as "monthly" | "weekly" | "yearly",
      category: formData.get("category") as any,
      nextDue: formData.get("nextDue") as string,
    };
    
    setData({
      ...data,
      recurringBills: [...data.recurringBills, newBill],
    });
    
    form.reset();
    (form.closest(".modal-backdrop") as HTMLElement).hidden = true;
  });
}
