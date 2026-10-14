import { AmountInvalidError } from "../../domain/shared/errors/AmountInvalidError.js";

export class PurchaseDTO {
    #accountId;
    #amount;
    #installments;

    constructor({ accountId, amount, installments }) {
        if (typeof accountId !== "string" || accountId.trim().length === 0)
            throw new AmountInvalidError("Account ID is required");
        if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0)
            throw new AmountInvalidError("Amount must be greater than zero");

        this.#accountId = accountId;
        this.#amount = amount;
        this.#installments = installments;
    }

    getAccountId() {
        return this.#accountId;
    }

    getAmount() {
        return this.#amount;
    }

    // Validated by the domain (whole number of installments within the allowed range).
    getInstallments() {
        return this.#installments;
    }
}
