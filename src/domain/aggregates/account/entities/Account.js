import { Money } from "../../../shared/value-objects/Money";
import { AccountInvalidAmountError } from "../errors/AccountInvalidAmountError";

export class Account {
    #balance;
    #movements;

    constructor(amount) {
        if (!(amount instanceof Money))
            throw new AccountInvalidAmountError("Type of Amount is unexpected");

        this.#balance = amount;
        this.#movements = [];
    }

    getBalance() {
        return this.#balance;
    }
}
