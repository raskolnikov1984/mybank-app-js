import { describe, expect, it } from "vitest";
import { SavingsAccount } from "../../src/domain/aggregates/account/entities/SavingsAccount.js";
import { CheckingAccount } from "../../src/domain/aggregates/account/entities/CheckingAccount.js";
import { CreditCard } from "../../src/domain/aggregates/account/entities/CreditCard.js";
import { Account } from "../../src/domain/aggregates/account/entities/Account.js";
import { MonthlyStatementNotSupportedError } from "../../src/domain/aggregates/account/errors/MonthlyStatementNotSupportedError.js";
import { Money } from "../../src/domain/shared/value-objects/Money.js";

describe("Account polymorphism", () => {
    const buildAccounts = () => [
        new SavingsAccount(new Money(100000)),
        new CheckingAccount(new Money(100000)),
        new CreditCard(),
    ];

    it("Must treat every product as an Account", () => {
        for (const account of buildAccounts())
            expect(account).toBeInstanceOf(Account);
    });

    it("Must behave differently on the same withdraw call", () => {
        const outcomes = buildAccounts().map((account) => {
            try {
                account.withdrawFunds(new Money(110000));
                return "ok";
            } catch (error) {
                return error.errorCode();
            }
        });

        // savings: 100000 + 1500 interest is not enough; checking: up to 120000; card: within limit
        expect(outcomes).toEqual(["ACCOUNT_NOT_ENOUGHT_FUNDS_ERROR", "ok", "ok"]);
    });

    it("Must leave a different trace on the same small withdraw call", () => {
        const traces = buildAccounts().map((account) => {
            account.withdrawFunds(new Money(10000));
            return account.getMovements().map((m) => m.getType()).join(",");
        });

        expect(traces).toEqual(["INTEREST,WITHDRAW", "WITHDRAW", "WITHDRAW"]);
    });

    it("Must answer the monthly statement differently depending on the product", () => {
        const [savings, checking, card] = buildAccounts();
        card.withdrawFunds(new Money(100000));

        expect(() => savings.monthlyStatement()).toThrow(MonthlyStatementNotSupportedError);
        expect(() => checking.monthlyStatement()).toThrow(MonthlyStatementNotSupportedError);
        expect(card.monthlyStatement().interest.getAmount()).toBe(2000);
        expect(buildAccounts().map((a) => a.supportsMonthlyStatement())).toEqual([false, false, true]);
    });

    it("Must give a different type name and description for each type", () => {
        const accounts = buildAccounts();

        expect(new Set(accounts.map((a) => a.typeName())).size).toBe(3);
        expect(new Set(accounts.map((a) => a.describe())).size).toBe(3);
    });

    it("Must require subclasses to implement the abstract hooks", () => {
        class Incomplete extends Account {}
        const account = new Incomplete(new Money(1000));

        expect(() => account.accountType()).toThrow("NOT_IMPLEMENTED_METHOD");
        expect(() => account.creditLimit()).toThrow("NOT_IMPLEMENTED_METHOD");
        expect(() => account.withdrawFunds(new Money(10))).toThrow("NOT_IMPLEMENTED_METHOD");
        expect(account.supportsMonthlyStatement()).toBe(false);
    });
});
