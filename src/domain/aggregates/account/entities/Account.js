import { Money } from "../../../shared/value-objects/Money.js";
import { AccountInvalidAmountError } from "../errors/AccountInvalidAmountError.js";
import { AccountNotEnoughtFundsError } from "../errors/AccountNotEnoughtFundsError.js";
import { Movement, MovementType } from "./Movement.js";

export class Account {
    #balance;
    #movements;

    constructor(amount) {
        if (!(amount instanceof Money))
            throw new AccountInvalidAmountError("Type of Amount is unexpected");

        if (!amount.isPositive())
            throw new AccountInvalidAmountError("Initial balance must be positive");

        this.#balance = amount;
        this.#movements = [];
    }

    getBalance() {
        return this.#balance;
    }

    getMovements() {
        return this.#movements;
    }

    withdrawFunds(amount) {
        if (!(amount instanceof Money))
            throw new AccountInvalidAmountError(
                "The account balance is less than the amount to withdraw",
            );

        if (this.#balance.isLessThan(amount))
            throw new AccountNotEnoughtFundsError(
                "The account balance is less than the amount to withdraw",
            );
        this.#balance = this.#balance.subtract(amount);
        this.#movements.push(new Movement(MovementType.WITHDRAW, amount));
    }

    depositFunds(amount) {
        if (!(amount instanceof Money))
            throw new AccountInvalidAmountError(
                "Type of Amount is unexpected",
            );

        if (!amount.isPositive())
            throw new AccountInvalidAmountError(
                "Deposit amount must be positive",
            );

        this.#balance = this.#balance.add(amount);
        this.#movements.push(new Movement(MovementType.DEPOSIT, amount));
    }
}
