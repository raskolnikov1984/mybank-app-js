import { describe, expect, it } from "vitest";
import { CheckingAccount } from "../../src/domain/aggregates/account/entities/CheckingAccount.js";
import { Account } from "../../src/domain/aggregates/account/entities/Account.js";
import { Money } from "../../src/domain/shared/value-objects/Money.js";
import { AccountNotEnoughtFundsError } from "../../src/domain/aggregates/account/errors/AccountNotEnoughtFundsError.js";
import { MonthlyStatementNotSupportedError } from "../../src/domain/aggregates/account/errors/MonthlyStatementNotSupportedError.js";
import { AccountType } from "../../src/domain/aggregates/account/value-objects/AccountType.js";

describe("CheckingAccount", () => {
    it("Must inherit from Account and report its type", () => {
        const account = new CheckingAccount(new Money(1000));

        expect(account).toBeInstanceOf(Account);
        expect(account.accountType()).toBe(AccountType.CHECKING);
        expect(account.typeName()).toBe("Cuenta Corriente");
    });

    it("Must allow withdrawing up to 120% of the balance using the overdraft", () => {
        const account = new CheckingAccount(new Money(1000000));

        account.withdrawFunds(new Money(1200000));

        expect(account.getBalance().equals(new Money(0))).toBe(true);
        expect(account.getCreditUsed().equals(new Money(200000))).toBe(true);
    });

    it("Must reject a withdraw above 120% of the balance", () => {
        const account = new CheckingAccount(new Money(1000000));

        expect(() => account.withdrawFunds(new Money(1200001))).toThrow(
            AccountNotEnoughtFundsError,
        );
        expect(account.getBalance().equals(new Money(1000000))).toBe(true);
        expect(account.getCreditUsed().equals(new Money(0))).toBe(true);
        expect(account.getMovements()).toEqual([]);
    });

    it("Must not use the overdraft when the balance is enough", () => {
        const account = new CheckingAccount(new Money(1000000));

        account.withdrawFunds(new Money(400000));

        expect(account.getBalance().equals(new Money(600000))).toBe(true);
        expect(account.getCreditUsed().equals(new Money(0))).toBe(true);
        expect(account.getMovements().map((m) => m.getType())).toEqual(["WITHDRAW"]);
    });

    it("Must not grant more overdraft once it is in use", () => {
        const account = new CheckingAccount(new Money(1000000));
        account.withdrawFunds(new Money(1100000));

        expect(() => account.withdrawFunds(new Money(1))).toThrow(AccountNotEnoughtFundsError);
    });

    it("Must repay the overdraft first when depositing", () => {
        const account = new CheckingAccount(new Money(1000000));
        account.withdrawFunds(new Money(1200000));

        account.depositFunds(new Money(250000));

        expect(account.getCreditUsed().equals(new Money(0))).toBe(true);
        expect(account.getBalance().equals(new Money(50000))).toBe(true);
    });

    it("Must not generate interests or fees and must not support a monthly statement", () => {
        const account = new CheckingAccount(new Money(1000000));
        account.withdrawFunds(new Money(1200000));

        expect(account.supportsMonthlyStatement()).toBe(false);
        expect(() => account.monthlyStatement()).toThrow(MonthlyStatementNotSupportedError);
        expect(account.getCreditUsed().equals(new Money(200000))).toBe(true);
        expect(account.getMovements().map((m) => m.getType())).toEqual(["WITHDRAW"]);
    });

    it("Must describe balance and overdraft", () => {
        const description = new CheckingAccount(new Money(1000000)).describe();

        expect(description).toContain("Sobregiro usado");
        expect(description).toContain("Sobregiro disponible");
    });
});
