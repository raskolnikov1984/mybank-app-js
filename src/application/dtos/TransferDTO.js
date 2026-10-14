import { AmountInvalidError } from "../../domain/shared/errors/AmountInvalidError.js";

export class TransferDTO {
    #fromAccountId;
    #toAccountId;
    #amount;

    constructor({ fromAccountId, toAccountId, amount }) {
        if (typeof fromAccountId !== "string" || fromAccountId.trim().length === 0)
            throw new AmountInvalidError("Origin account ID is required");
        if (typeof toAccountId !== "string" || toAccountId.trim().length === 0)
            throw new AmountInvalidError("Destination account ID is required");
        if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0)
            throw new AmountInvalidError("Amount must be greater than zero");

        this.#fromAccountId = fromAccountId;
        this.#toAccountId = toAccountId;
        this.#amount = amount;
    }

    getFromAccountId() {
        return this.#fromAccountId;
    }

    getToAccountId() {
        return this.#toAccountId;
    }

    getAmount() {
        return this.#amount;
    }
}
