export const MovementType = Object.freeze({
    WITHDRAW: "WITHDRAW",
    DEPOSIT: "DEPOSIT",
    INTEREST: "INTEREST",
    TRANSFER_OUT: "TRANSFER_OUT",
    TRANSFER_IN: "TRANSFER_IN",
    INSTALLMENT_PURCHASE: "INSTALLMENT_PURCHASE",
});

export class Movement {
    #type;
    #amount;
    #date;
    #installments;

    // installments: { count, monthlyPayment: Money, totalToPay: Money } for installment purchases, null otherwise.
    constructor(type, amount, date = new Date(), installments = null) {
        this.#type = type;
        this.#amount = amount;
        this.#date = date;
        this.#installments = installments;
    }

    getType() {
        return this.#type;
    }

    getAmount() {
        return this.#amount;
    }

    getDate() {
        return this.#date;
    }

    getInstallments() {
        return this.#installments;
    }
}
