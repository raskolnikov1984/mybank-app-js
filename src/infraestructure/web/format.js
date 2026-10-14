export function formatMoney(money) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: money.getCurrency(),
        maximumFractionDigits: 0,
    }).format(money.getAmount());
}

export function formatPesos(amount) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(amount);
}

export const MOVEMENT_LABELS = {
    DEPOSIT: "Consignación",
    WITHDRAW: "Retiro",
    INTEREST: "Intereses",
    TRANSFER_OUT: "Transferencia enviada",
    TRANSFER_IN: "Transferencia recibida",
    INSTALLMENT_PURCHASE: "Compra a cuotas",
};

export function parseAmount(value) {
    const amount = Number(value);
    return Number.isFinite(amount) && amount > 0 ? amount : null;
}
