import { Money } from "../../../shared/value-objects/Money.js";
import { InstallmentPlan } from "../value-objects/InstallmentPlan.js";
import { AccountInvalidAmountError } from "../errors/AccountInvalidAmountError.js";
import { PaymentExceedsDebtError } from "../errors/PaymentExceedsDebtError.js";
import { CreditLimitExceededError } from "../errors/CreditLimitExceededError.js";
import { AccountType } from "../value-objects/AccountType.js";
import { Account } from "./Account.js";
import { Movement, MovementType } from "./Movement.js";

const DEFAULT_CREDIT_LIMIT = 2000000;
const WITHDRAWAL_INTEREST_RATE = 0.02;

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

    // A payment can never exceed what the card owes, so no money is left unrecorded on it.
    assertCanDeposit(amount) {
        super.assertCanDeposit(amount);

        if (amount.isGreaterThan(this.getDebt()) || !this.getDebt().isPositive())
            throw new PaymentExceedsDebtError();
    }

    // Interest is charged right before each accepted withdrawal. Everything is checked
    // first so a rejected withdrawal leaves no interest behind.
    withdrawFunds(amount, type = MovementType.WITHDRAW) {
        if (!(amount instanceof Money))
            throw new AccountInvalidAmountError("Type of Amount is unexpected");

        if (!amount.isPositive())
            throw new AccountInvalidAmountError("Withdraw amount must be positive");

        const interest = new Money(
            Math.round(amount.getAmount() * WITHDRAWAL_INTEREST_RATE),
            this.#limit.getCurrency(),
        );

        if (this.getAvailableFunds().isLessThan(amount.add(interest)))
            throw this.insufficientFundsError();

        this._charge(interest, MovementType.INTEREST);
        super.withdrawFunds(amount, type);
    }

    supportsInstallments() {
        return true;
    }

    // The whole total to pay (capital plus the interest of the term) counts against the available credit.
    purchaseInInstallments(amount, installments) {
        if (!(amount instanceof Money))
            throw new AccountInvalidAmountError("Type of Amount is unexpected");

        if (!amount.isPositive())
            throw new AccountInvalidAmountError("Purchase amount must be positive");

        const plan = InstallmentPlan.quote(amount, installments);

        if (this.getAvailableFunds().isLessThan(plan.totalToPay))
            throw this.insufficientFundsError();

        this._chargeWithMovement(
            plan.totalToPay,
            new Movement(MovementType.INSTALLMENT_PURCHASE, amount, new Date(), {
                count: plan.installments,
                monthlyPayment: plan.monthlyPayment,
                totalToPay: plan.totalToPay,
            }),
        );

        return plan;
    }

    describe() {
        const creditBalance = this.getBalance().isPositive()
            ? ` | Saldo a favor: ${this._format(this.getBalance())}`
            : "";

        return (
            `${this.typeName()} - Deuda: ${this._format(this.getDebt())}` +
            ` | Cupo disponible: ${this._format(this.getAvailableCredit())}` +
            creditBalance
        );
    }
}
