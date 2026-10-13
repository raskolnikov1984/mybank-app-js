import { describe, expect, it } from "vitest";
import { SavingsAccount } from "../../src/domain/aggregates/account/entities/SavingsAccount.js";
import { Account } from "../../src/domain/aggregates/account/entities/Account.js";
import { Money } from "../../src/domain/shared/value-objects/Money.js";
import { AccountNotEnoughtFundsError } from "../../src/domain/aggregates/account/errors/AccountNotEnoughtFundsError.js";
import { AccountInvalidAmountError } from "../../src/domain/aggregates/account/errors/AccountInvalidAmountError.js";
import { MonthlyStatementNotSupportedError } from "../../src/domain/aggregates/account/errors/MonthlyStatementNotSupportedError.js";
import { AccountType } from "../../src/domain/aggregates/account/value-objects/AccountType.js";

describe("SavingsAccount", () => {
    it("Must inherit from Account", () => {
        expect(new SavingsAccount(new Money(1000))).toBeInstanceOf(Account);
    });

    it("Must report its type", () => {
        const account = new SavingsAccount(new Money(1000));

        expect(account.accountType()).toBe(AccountType.SAVINGS);
        expect(account.typeName()).toBe("Cuenta de Ahorros");
    });

    it("Must credit 1.5% interest and then withdraw", () => {
        const account = new SavingsAccount(new Money(100000));

        account.withdrawFunds(new Money(40000));

        expect(account.getBalance().equals(new Money(61500))).toBe(true);
        const movements = account.getMovements();
        expect(movements.map((m) => m.getType())).toEqual(["INTEREST", "WITHDRAW"]);
        expect(movements[0].getAmount().equals(new Money(1500))).toBe(true);
        expect(movements[1].getAmount().equals(new Money(40000))).toBe(true);
    });

    it("Must allow withdrawing up to balance plus interest", () => {
        const account = new SavingsAccount(new Money(100000));

        account.withdrawFunds(new Money(101500));

        expect(account.getBalance().equals(new Money(0))).toBe(true);
    });

    it("Must reject a withdraw above balance plus interest without side effects", () => {
        const account = new SavingsAccount(new Money(100000));

        expect(() => account.withdrawFunds(new Money(101501))).toThrow(
            AccountNotEnoughtFundsError,
        );
        expect(account.getBalance().equals(new Money(100000))).toBe(true);
        expect(account.getMovements()).toEqual([]);
    });

    it("Must not credit interest when the amount is invalid", () => {
        const account = new SavingsAccount(new Money(100000));

        expect(() => account.withdrawFunds(new Money(0))).toThrow(AccountInvalidAmountError);
        expect(() => account.withdrawFunds(500)).toThrow(AccountInvalidAmountError);
        expect(account.getBalance().equals(new Money(100000))).toBe(true);
        expect(account.getMovements()).toEqual([]);
    });

    it("Must charge interest on the current balance in each withdrawal", () => {
        const account = new SavingsAccount(new Money(100000));

        account.withdrawFunds(new Money(100000));
        account.withdrawFunds(new Money(1000));

        expect(account.getBalance().equals(new Money(523))).toBe(true);
        expect(account.getMovements().filter((m) => m.getType() === "INTEREST").length).toBe(2);
    });

    it("Must reject a zero initial balance", () => {
        expect(() => new SavingsAccount(new Money(0))).toThrow(AccountInvalidAmountError);
    });

    it("Must not support a monthly statement", () => {
        const account = new SavingsAccount(new Money(1000));

        expect(account.supportsMonthlyStatement()).toBe(false);
        expect(() => account.monthlyStatement()).toThrow(MonthlyStatementNotSupportedError);
    });

    it("Must describe its balance", () => {
        const account = new SavingsAccount(new Money(100000));

        expect(account.describe()).toContain("Cuenta de Ahorros");
        expect(account.describe()).toContain("Saldo");
    });
});
