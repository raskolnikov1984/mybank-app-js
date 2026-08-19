export const MovementType = Object.freeze({
    WITHDRAW: "WITHDRAW",
    DEPOSIT: "DEPOSIT",
});

export class Movement {
    #type;
    #amount;
    #date;

    constructor(type, amount) {
        this.#type = type;
        this.#amount = amount;
        this.#date = new Date();
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
