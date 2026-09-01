import { AmountInvalidError } from "../../domain/shared/errors/AmountInvalidError.js";

export class DepositDTO {
    #accountId;
    #amount;

    constructor({ accountId, amount }) {
        if (!accountId || accountId.trim().length === 0)
            throw new AmountInvalidError("Account ID is required");
        if (typeof amount !== "number" || amount <= 0)
            throw new AmountInvalidError("Amount must be greater than zero");

        this.#accountId = accountId;
        this.#amount = amount;
    }

    getAccountId() {
        return this.#accountId;
    }

    getAmount() {
        return this.#amount;
    }
}
