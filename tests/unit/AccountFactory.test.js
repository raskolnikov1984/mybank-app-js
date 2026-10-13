import { describe, expect, it } from "vitest";
import { AccountFactory } from "../../src/domain/aggregates/account/factories/AccountFactory.js";
import { SavingsAccount } from "../../src/domain/aggregates/account/entities/SavingsAccount.js";
import { CheckingAccount } from "../../src/domain/aggregates/account/entities/CheckingAccount.js";
import { CreditCard } from "../../src/domain/aggregates/account/entities/CreditCard.js";
import { AccountType } from "../../src/domain/aggregates/account/value-objects/AccountType.js";
import { InvalidAccountTypeError } from "../../src/domain/aggregates/account/errors/InvalidAccountTypeError.js";
import { Money } from "../../src/domain/shared/value-objects/Money.js";

describe("AccountFactory", () => {
    it("Must create a SavingsAccount", () => {
        const account = AccountFactory.create(AccountType.SAVINGS, 50000);

        expect(account).toBeInstanceOf(SavingsAccount);
        expect(account.getBalance().equals(new Money(50000))).toBe(true);
    });

    it("Must create a CheckingAccount", () => {
        expect(AccountFactory.create(AccountType.CHECKING, 50000)).toBeInstanceOf(CheckingAccount);
    });

    it("Must create a CreditCard ignoring the initial balance", () => {
        const card = AccountFactory.create(AccountType.CREDIT_CARD);

        expect(card).toBeInstanceOf(CreditCard);
        expect(card.getDebt().equals(new Money(0))).toBe(true);
    });

    it("Must reject unknown types", () => {
        expect(() => AccountFactory.create("GOLD", 1000)).toThrow(InvalidAccountTypeError);
    });
});
