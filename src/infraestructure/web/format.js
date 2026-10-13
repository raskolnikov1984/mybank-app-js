export function formatMoney(money) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: money.getCurrency(),
        maximumFractionDigits: 0,
    }).format(money.getAmount());
}

export const MOVEMENT_LABELS = {
    DEPOSIT: "Consignación",
    WITHDRAW: "Retiro",
    INTEREST: "Intereses",
};

export function parseAmount(value) {
    const amount = Number(value);
    return Number.isFinite(amount) && amount > 0 ? amount : null;
}
