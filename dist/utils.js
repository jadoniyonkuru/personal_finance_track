export function formatRWF(amount) {
    return new Intl.NumberFormat("en-RW", {
        style: "currency",
        currency: "RWF",
        maximumFractionDigits: 0,
    }).format(amount);
}
export function formatDate(iso) {
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
    });
}
export function generateId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
export function getCurrentMonth() {
    return new Date().toISOString().slice(0, 7);
}
