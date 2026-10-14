import { Money } from "../../../shared/value-objects/Money.js";
import { AccountInvalidAmountError } from "../errors/AccountInvalidAmountError.js";
import { AccountNotEnoughtFundsError } from "../errors/AccountNotEnoughtFundsError.js";
import { MonthlyStatementNotSupportedError } from "../errors/MonthlyStatementNotSupportedError.js";
import { Movement, MovementType } from "./Movement.js";

const NOT_IMPLEMENTED = "NOT_IMPLEMENTED_METHOD";

export class Account {
    #balance;
    #creditUsed;
    #movements;

    constructor(amount, { allowZeroInitialBalance = false } = {}) {
        if (new.target === Account)
            throw new TypeError(
                "You can't create an instance of an abstract class.",
            );

        if (!(amount instanceof Money))
            throw new AccountInvalidAmountError("Type of Amount is unexpected");

        const isAllowedZero = allowZeroInitialBalance && amount.getAmount() === 0;
        if (!amount.isPositive() && !isAllowedZero)
            throw new AccountInvalidAmountError("Initial balance must be positive");

        this.#balance = amount;
        this.#creditUsed = new Money(0, amount.getCurrency());
        this.#movements = [];
    }

    // Hooks that every concrete account type must implement.
    accountType() {
        throw new Error(NOT_IMPLEMENTED);
    }

    typeName() {
        throw new Error(NOT_IMPLEMENTED);
    }

    creditLimit() {
        throw new Error(NOT_IMPLEMENTED);
    }

    supportsMonthlyStatement() {
        return false;
    }

    monthlyStatement() {
        throw new MonthlyStatementNotSupportedError();
    }

    describe() {
        throw new Error(NOT_IMPLEMENTED);
    }

    insufficientFundsError() {
        return new AccountNotEnoughtFundsError();
    }

    getBalance() {
        return this.#balance;
    }

    getCreditUsed() {
        return this.#creditUsed;
    }

    getAvailableCredit() {
        const limit = this.creditLimit();
        return limit.isGreaterThan(this.#creditUsed)
            ? limit.subtract(this.#creditUsed)
            : this._zero();
    }

    getAvailableFunds() {
        return this.#balance.add(this.getAvailableCredit());
    }

    // True while the product holds money or owes any: balance, debt or overdraft.
    hasOpenPosition() {
        return this.#balance.isPositive() || this.#creditUsed.isPositive();
    }

    getMovements() {
        return [...this.#movements];
    }

    withdrawFunds(amount, type = MovementType.WITHDRAW) {
        this.#assertPositiveMoney(amount, "Withdraw amount must be positive");

        if (this.getAvailableFunds().isLessThan(amount))
            throw this.insufficientFundsError();

        const fromBalance = this.#balance.isLessThan(amount) ? this.#balance : amount;
        this.#balance = this.#balance.subtract(fromBalance);
        this.#creditUsed = this.#creditUsed.add(amount.subtract(fromBalance));
        this.#movements.push(new Movement(type, amount));
    }

    depositFunds(amount, type = MovementType.DEPOSIT) {
        this.#assertPositiveMoney(amount, "Deposit amount must be positive");

        const toCredit = this.#creditUsed.isLessThan(amount) ? this.#creditUsed : amount;
        this.#creditUsed = this.#creditUsed.subtract(toCredit);
        this.#balance = this.#balance.add(amount.subtract(toCredit));
        this.#movements.push(new Movement(type, amount));
    }

    // Persistence: the only way state leaves or re-enters an account.
    toSnapshot() {
        return {
            type: this.accountType(),
            currency: this.#balance.getCurrency(),
            balance: this.#balance.getAmount(),
            creditUsed: this.#creditUsed.getAmount(),
            movements: this.#movements.map((movement) => ({
                type: movement.getType(),
                amount: movement.getAmount().getAmount(),
                date: movement.getDate().toISOString(),
            })),
        };
    }

    // Restore-only hook: rebuilds state from a snapshot (used by AccountFactory.restore).
    static restoreState(account, snapshot) {
        const currency = snapshot.currency;
        account.#balance = new Money(snapshot.balance, currency);
        account.#creditUsed = new Money(snapshot.creditUsed, currency);
        account.#movements = snapshot.movements.map(
            (m) => new Movement(m.type, new Money(m.amount, currency), new Date(m.date)),
        );
        return account;
    }

    // Protected by convention (used only by subclasses in monthlyStatement).
    _zero() {
        return new Money(0, this.#balance.getCurrency());
    }

    _credit(amount, type) {
        if (!amount.isPositive()) return;
        this.#balance = this.#balance.add(amount);
        this.#movements.push(new Movement(type, amount));
    }

    _charge(amount, type) {
        if (!amount.isPositive()) return;
        const fromBalance = this.#balance.isLessThan(amount) ? this.#balance : amount;
        this.#balance = this.#balance.subtract(fromBalance);
        this.#creditUsed = this.#creditUsed.add(amount.subtract(fromBalance));
        this.#movements.push(new Movement(type, amount));
    }

    _statementResult({ interest, fee }) {
        return {
            type: this.accountType(),
            typeName: this.typeName(),
            interest,
            fee,
            balance: this.#balance,
            creditUsed: this.#creditUsed,
        };
    }

    _format(money) {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: money.getCurrency(),
            maximumFractionDigits: 0,
        }).format(money.getAmount());
    }

    #assertPositiveMoney(amount, positiveMessage) {
        if (!(amount instanceof Money))
            throw new AccountInvalidAmountError("Type of Amount is unexpected");

        if (!amount.isPositive())
            throw new AccountInvalidAmountError(positiveMessage);
    }
}
