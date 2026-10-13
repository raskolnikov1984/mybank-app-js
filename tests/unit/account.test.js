import { describe, expect, it } from "vitest";
import { Account } from "../../src/domain/aggregates/account/entities/Account.js";
import { Money } from "../../src/domain/shared/value-objects/Money.js";
import { CheckingAccount } from "../../src/domain/aggregates/account/entities/CheckingAccount.js";
import { AccountInvalidAmountError } from "../../src/domain/aggregates/account/errors/AccountInvalidAmountError.js";
import { AccountNotEnoughtFundsError } from "../../src/domain/aggregates/account/errors/AccountNotEnoughtFundsError.js";
import { AmountInvalidError } from "../../src/domain/shared/errors/AmountInvalidError.js";

describe("Account (shared behavior through CheckingAccount)", () => {
    it("Must be possible to create a new account.", () => {
        const account = new CheckingAccount(new Money(100000));

        expect(account).toBeInstanceOf(CheckingAccount);
        expect(account).toBeInstanceOf(Account);
        expect(account.getBalance().equals(new Money(100000))).toBe(true);
    });

    it("Must not be possible to instantiate the abstract Account directly.", () => {
        expect(() => new Account(new Money(100000))).toThrow(TypeError);
    });

    it("Only is possible to create a new account with an amount of type Money", () => {
        expect(() => new CheckingAccount(19999)).toThrow(AccountInvalidAmountError);
    });

    it("Cannot create account with zero balance", () => {
        expect(() => new CheckingAccount(new Money(0))).toThrow(AccountInvalidAmountError);
    });

    it("When an new account is created the account must not has movements.", () => {
        const account = new CheckingAccount(new Money(150000));

        expect(account.getMovements()).toEqual([]);
    });

    it("Must be possible do a withdraw.", () => {
        const account = new CheckingAccount(new Money(150000));
        const amountToWithdraw = new Money(5000);
        const newBalance = new Money(145000);

        account.withdrawFunds(amountToWithdraw);
        expect(account.getBalance().equals(newBalance)).toBe(true);
    });

    it("The amount to withdraw must be of type Money", () => {
        const account = new CheckingAccount(new Money(150000));

        expect(() => account.withdrawFunds(10000)).toThrow(
            AccountInvalidAmountError,
        );
    });

    it("The amount to withdraw must not be zero", () => {
        const account = new CheckingAccount(new Money(150000));

        expect(() => account.withdrawFunds(new Money(0))).toThrow(
            AccountInvalidAmountError,
        );
    });

    it("The amount to withdraw must be possitive", () => {
        const account = new CheckingAccount(new Money(150000));

        expect(() => account.withdrawFunds(new Money(-10000))).toThrow(
            AmountInvalidError,
        );
    });

    it("The amount to withdraw must be greater than the account balanace", () => {
        const account = new CheckingAccount(new Money(150000));

        expect(() => account.withdrawFunds(new Money(10000000))).toThrow(
            AccountNotEnoughtFundsError,
        );
    });

    it("When withdraw, must register a movement of type WITHDRAW", () => {
        const account = new CheckingAccount(new Money(150000));
        const amountToWithdraw = new Money(50000);

        account.withdrawFunds(amountToWithdraw);

        expect(account.getMovements().length).toBe(1);
        expect(account.getMovements()[0].getType()).toBe("WITHDRAW");
        expect(account.getMovements()[0].getAmount().equals(amountToWithdraw)).toBe(true);
    });

    it("Must be possible to deposit funds.", () => {
        const account = new CheckingAccount(new Money(50000));

        account.depositFunds(new Money(30000));

        expect(account.getBalance().equals(new Money(80000))).toBe(true);
    });

    it("When deposit, must register a movement of type DEPOSIT", () => {
        const account = new CheckingAccount(new Money(50000));
        const amountToDeposit = new Money(30000);

        account.depositFunds(amountToDeposit);

        expect(account.getMovements().length).toBe(1);
        expect(account.getMovements()[0].getType()).toBe("DEPOSIT");
        expect(account.getMovements()[0].getAmount().equals(amountToDeposit)).toBe(true);
    });

    it("The amount to deposit must be of type Money", () => {
        const account = new CheckingAccount(new Money(50000));

        expect(() => account.depositFunds(10000)).toThrow(AccountInvalidAmountError);
    });

    it("The amount to deposit must be positive", () => {
        const account = new CheckingAccount(new Money(50000));

        expect(() => account.depositFunds(new Money(0))).toThrow(AccountInvalidAmountError);
    });

    it("Multiple deposits should accumulate movements", () => {
        const account = new CheckingAccount(new Money(50000));

        account.depositFunds(new Money(10000));
        account.depositFunds(new Money(20000));

        expect(account.getBalance().equals(new Money(80000))).toBe(true);
        expect(account.getMovements().length).toBe(2);
    });

    it("Each movement must have a valid date", () => {
        const account = new CheckingAccount(new Money(50000));

        account.depositFunds(new Money(10000));
        account.withdrawFunds(new Money(5000));

        const movements = account.getMovements();
        expect(movements[0].getDate()).toBeInstanceOf(Date);
        expect(movements[1].getDate()).toBeInstanceOf(Date);
    });

    it("Movements must be in chronological order", () => {
        const account = new CheckingAccount(new Money(50000));

        account.depositFunds(new Money(10000));
        account.withdrawFunds(new Money(5000));
        account.depositFunds(new Money(20000));

        const movements = account.getMovements();
        expect(movements.length).toBe(3);
        expect(movements[0].getType()).toBe("DEPOSIT");
        expect(movements[1].getType()).toBe("WITHDRAW");
        expect(movements[2].getType()).toBe("DEPOSIT");
    });

    it("Movements must reflect the correct amounts", () => {
        const account = new CheckingAccount(new Money(100000));

        account.depositFunds(new Money(50000));
        account.withdrawFunds(new Money(30000));
        account.depositFunds(new Money(10000));

        const movements = account.getMovements();
        expect(movements[0].getAmount().equals(new Money(50000))).toBe(true);
        expect(movements[1].getAmount().equals(new Money(30000))).toBe(true);
        expect(movements[2].getAmount().equals(new Money(10000))).toBe(true);
    });

    it("The movement history returned must not allow external mutation", () => {
        const account = new CheckingAccount(new Money(50000));
        account.depositFunds(new Money(10000));

        account.getMovements().push("tampered");
        account.getMovements().length = 0;

        expect(account.getMovements().length).toBe(1);
    });

    it("Must have an open position while it holds a balance", () => {
        expect(new CheckingAccount(new Money(1000)).hasOpenPosition()).toBe(true);
    });

    it("Must have no open position when the balance is zero and nothing is owed", () => {
        const account = new CheckingAccount(new Money(1000));
        account.withdrawFunds(new Money(1000));

        expect(account.hasOpenPosition()).toBe(false);
    });

    it("Must have an open position while an overdraft is in use", () => {
        const account = new CheckingAccount(new Money(1000));
        account.withdrawFunds(new Money(1200));

        expect(account.getBalance().equals(new Money(0))).toBe(true);
        expect(account.hasOpenPosition()).toBe(true);
    });
});
