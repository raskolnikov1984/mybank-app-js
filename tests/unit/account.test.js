import { describe, expect, it } from "vitest";
import { Account } from "../../src/domain/aggregates/account/entities/Account.js";
import { Money } from "../../src/domain/shared/value-objects/Money.js";
import { AccountInvalidAmountError } from "../../src/domain/aggregates/account/errors/AccountInvalidAmountError.js";

describe("Account", () => {
    it("Must be possible to create a new account.", () => {
        const account = new Account(new Money(100000));

        expect(account).toBeInstanceOf(Account);
        expect(account.getBalance().equals(new Money(100000))).toBe(true);
    });

    it("Only is possible to create a new account with an amount of type Money", () => {
        expect(() => new Account(19999)).toThrow(AccountInvalidAmountError);
    });
});
