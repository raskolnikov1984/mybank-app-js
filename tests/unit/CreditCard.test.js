import { describe, expect, it } from "vitest";
import { CreditCard } from "../../src/domain/aggregates/account/entities/CreditCard.js";
import { Account } from "../../src/domain/aggregates/account/entities/Account.js";
import { Money } from "../../src/domain/shared/value-objects/Money.js";
import { CreditLimitExceededError } from "../../src/domain/aggregates/account/errors/CreditLimitExceededError.js";
import { AccountInvalidAmountError } from "../../src/domain/aggregates/account/errors/AccountInvalidAmountError.js";
import { AccountType } from "../../src/domain/aggregates/account/value-objects/AccountType.js";

describe("CreditCard", () => {
    it("Must inherit from Account and start without debt", () => {
        const card = new CreditCard();

        expect(card).toBeInstanceOf(Account);
        expect(card.accountType()).toBe(AccountType.CREDIT_CARD);
        expect(card.getDebt().equals(new Money(0))).toBe(true);
        expect(card.getAvailableCredit().equals(new Money(2000000))).toBe(true);
    });

    it("Must increase the debt on a purchase within the limit", () => {
        const card = new CreditCard(new Money(2000000));

        card.withdrawFunds(new Money(500000));

        expect(card.getDebt().equals(new Money(500000))).toBe(true);
        expect(card.getAvailableCredit().equals(new Money(1500000))).toBe(true);
    });

    it("Must reject a purchase above the limit", () => {
        const card = new CreditCard(new Money(2000000));
        card.withdrawFunds(new Money(1900000));

        expect(() => card.withdrawFunds(new Money(200000))).toThrow(
            CreditLimitExceededError,
        );
        expect(card.getDebt().equals(new Money(1900000))).toBe(true);
    });

    it("Must reduce the debt on a payment", () => {
        const card = new CreditCard();
        card.withdrawFunds(new Money(500000));

        card.depositFunds(new Money(200000));

        expect(card.getDebt().equals(new Money(300000))).toBe(true);
    });

    it("Must keep any overpayment as balance", () => {
        const card = new CreditCard();
        card.withdrawFunds(new Money(100000));

        card.depositFunds(new Money(150000));

        expect(card.getDebt().equals(new Money(0))).toBe(true);
        expect(card.getBalance().equals(new Money(50000))).toBe(true);
    });

    it("Must reject invalid amounts", () => {
        const card = new CreditCard();

        expect(() => card.depositFunds(new Money(0))).toThrow(AccountInvalidAmountError);
        expect(() => card.withdrawFunds(500)).toThrow(AccountInvalidAmountError);
    });

    it("Must add 2% interest to the debt on the monthly statement", () => {
        const card = new CreditCard();
        card.withdrawFunds(new Money(500000));

        const statement = card.monthlyStatement();

        expect(statement.interest.equals(new Money(10000))).toBe(true);
        expect(card.getDebt().equals(new Money(510000))).toBe(true);
    });

    it("Must accrue nothing without debt", () => {
        const card = new CreditCard();

        const statement = card.monthlyStatement();

        expect(statement.interest.equals(new Money(0))).toBe(true);
        expect(card.getDebt().equals(new Money(0))).toBe(true);
        expect(card.getMovements()).toEqual([]);
    });

    it("Must support a monthly statement", () => {
        expect(new CreditCard().supportsMonthlyStatement()).toBe(true);
    });

    it("Must describe debt and available credit", () => {
        const description = new CreditCard().describe();

        expect(description).toContain("Deuda");
        expect(description).toContain("Cupo disponible");
    });
});

describe("CreditCard open position", () => {
    it("Must have no open position without debt", () => {
        expect(new CreditCard().hasOpenPosition()).toBe(false);
    });

    it("Must have an open position while there is debt", () => {
        const card = new CreditCard();
        card.withdrawFunds(new Money(300000));

        expect(card.hasOpenPosition()).toBe(true);
    });

    it("Must have an open position when it holds a credit balance", () => {
        const card = new CreditCard();
        card.depositFunds(new Money(1000));

        expect(card.hasOpenPosition()).toBe(true);
    });
});
