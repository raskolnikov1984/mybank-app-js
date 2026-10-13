export const MovementType = Object.freeze({
    WITHDRAW: "WITHDRAW",
    DEPOSIT: "DEPOSIT",
    INTEREST: "INTEREST",
});

export class Movement {
    #type;
    #amount;
    #date;

    constructor(type, amount, date = new Date()) {
        this.#type = type;
        this.#amount = amount;
        this.#date = date;
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
}
