import { Money } from "../../../shared/value-objects/Money.js";
import { AccountType } from "../value-objects/AccountType.js";
import { Account } from "./Account.js";

const OVERDRAFT_RATE = 0.2;

export class CheckingAccount extends Account {
    accountType() {
        return AccountType.CHECKING;
    }

    typeName() {
        return "Cuenta Corriente";
    }

    // Overdraft is an extra 20% over the current balance. Once the balance has been
    // spent the limit is zero, so no more overdraft is granted until a deposit repays it.
    creditLimit() {
        return new Money(
            Math.round(this.getBalance().getAmount() * OVERDRAFT_RATE),
            this.getBalance().getCurrency(),
        );
    }

    describe() {
        return (
            `${this.typeName()} - Saldo: ${this._format(this.getBalance())}` +
            ` | Sobregiro usado: ${this._format(this.getCreditUsed())}` +
            ` | Sobregiro disponible: ${this._format(this.getAvailableCredit())}`
        );
    }
}
