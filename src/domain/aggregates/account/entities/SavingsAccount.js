import { Money } from "../../../shared/value-objects/Money.js";
import { AccountInvalidAmountError } from "../errors/AccountInvalidAmountError.js";
import { AccountType } from "../value-objects/AccountType.js";
import { Account } from "./Account.js";
import { MovementType } from "./Movement.js";

const WITHDRAWAL_INTEREST_RATE = 0.015;

export class SavingsAccount extends Account {
    accountType() {
        return AccountType.SAVINGS;
    }

    typeName() {
        return "Cuenta de Ahorros";
    }

    creditLimit() {
        return this._zero();
    }

    // Interest is credited right before each accepted withdrawal. Everything is
    // checked first so a rejected withdrawal leaves no interest behind.
    withdrawFunds(amount, type = MovementType.WITHDRAW) {
        if (!(amount instanceof Money))
            throw new AccountInvalidAmountError("Type of Amount is unexpected");

        if (!amount.isPositive())
            throw new AccountInvalidAmountError("Withdraw amount must be positive");

        const interest = new Money(
            Math.round(this.getBalance().getAmount() * WITHDRAWAL_INTEREST_RATE),
            this.getBalance().getCurrency(),
        );

        if (this.getBalance().add(interest).isLessThan(amount))
            throw this.insufficientFundsError();

        this._credit(interest, MovementType.INTEREST);
        super.withdrawFunds(amount, type);
    }

    describe() {
        return `${this.typeName()} - Saldo: ${this._format(this.getBalance())}`;
    }
}
