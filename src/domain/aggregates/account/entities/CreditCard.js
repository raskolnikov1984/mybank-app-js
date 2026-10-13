import { Money } from "../../../shared/value-objects/Money.js";
import { CreditLimitExceededError } from "../errors/CreditLimitExceededError.js";
import { AccountType } from "../value-objects/AccountType.js";
import { Account } from "./Account.js";
import { MovementType } from "./Movement.js";

const DEFAULT_CREDIT_LIMIT = 2000000;
const MONTHLY_INTEREST_RATE = 0.02;

export class CreditCard extends Account {
    #limit;

    constructor(limit = new Money(DEFAULT_CREDIT_LIMIT)) {
        super(new Money(0, limit.getCurrency()), { allowZeroInitialBalance: true });
        this.#limit = limit;
    }

    accountType() {
        return AccountType.CREDIT_CARD;
    }

    typeName() {
        return "Tarjeta de Credito";
    }

    creditLimit() {
        return this.#limit;
    }

    insufficientFundsError() {
        return new CreditLimitExceededError();
    }

    toSnapshot() {
        return { ...super.toSnapshot(), limit: this.#limit.getAmount() };
    }

    getDebt() {
        return this.getCreditUsed();
    }

    supportsMonthlyStatement() {
        return true;
    }

    monthlyStatement() {
        const interest = new Money(
            Math.round(this.getDebt().getAmount() * MONTHLY_INTEREST_RATE),
            this.#limit.getCurrency(),
        );
        this._charge(interest, MovementType.INTEREST);

        return this._statementResult({ interest, fee: this._zero() });
    }

    describe() {
        return (
            `${this.typeName()} - Deuda: ${this._format(this.getDebt())}` +
            ` | Cupo disponible: ${this._format(this.getAvailableCredit())}`
        );
    }
}
