import { AmountInvalidError } from "../errors/AmountInvalidError.js";

export const Currency = Object.freeze({
    AMERICAN_DOLLAR: "USD",
    COLOMBIAN_PESO: "COP",
});

export class Money {
    #amount;
    #currency;

    constructor(amount, currency = Currency.COLOMBIAN_PESO) {
        if (amount < 0)
            throw new AmountInvalidError("Amount cannot be negative.");

        this.#amount = amount;
        this.#currency = currency;
    }

    getAmount() {
        return this.#amount;
    }

    getCurrency() {
        return this.#currency;
    }

    equals(other) {
        return (
            this.#amount === other.#amount &&
            this.#currency === other.#currency
        );
    }

    add(other) {
        this.#assertSameCurrency(other);
        return new Money(this.#amount + other.#amount, this.#currency);
    }

    subtract(other) {
        this.#assertSameCurrency(other);
        return new Money(this.#amount - other.#amount, this.#currency);
    }

    isGreaterThan(other) {
        this.#assertSameCurrency(other);
        return this.#amount > other.#amount;
    }

    isLessThan(other) {
        this.#assertSameCurrency(other);
        return this.#amount < other.#amount;
    }

    isPositive() {
        return this.#amount > 0;
    }

    #assertSameCurrency(other) {
        if (this.#currency !== other.#currency) {
            throw new Error(
                `Cannot operate with different currencies: ${this.#currency} and ${other.#currency}`,
            );
        }
    }
}
