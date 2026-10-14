import { describe, expect, it, beforeEach } from "vitest";
import { ApplyMonthlyStatementUseCase } from "../../../src/application/use-cases/ApplyMonthlyStatementUseCase.js";
import { AccountRepository } from "../../../src/application/ports/AccountRepository.js";
import { SavingsAccount } from "../../../src/domain/aggregates/account/entities/SavingsAccount.js";
import { CheckingAccount } from "../../../src/domain/aggregates/account/entities/CheckingAccount.js";
import { MonthlyStatementNotSupportedError } from "../../../src/domain/aggregates/account/errors/MonthlyStatementNotSupportedError.js";
import { CreditCard } from "../../../src/domain/aggregates/account/entities/CreditCard.js";
import { AccountInvalidAmountError } from "../../../src/domain/aggregates/account/errors/AccountInvalidAmountError.js";
import { Money } from "../../../src/domain/shared/value-objects/Money.js";

class MockAccountRepository extends AccountRepository {
    #accounts = new Map();

    findById(id) {
        return this.#accounts.get(id) || null;
    }

    save(id, account) {
        this.#accounts.set(id, account);
    }
}

describe("ApplyMonthlyStatementUseCase", () => {
    let accountRepository;
    let useCase;

    beforeEach(() => {
        accountRepository = new MockAccountRepository();
        useCase = new ApplyMonthlyStatementUseCase(accountRepository);
    });

    it("Must reject an unknown account", () => {
        expect(() => useCase.execute("nobody")).toThrow(AccountInvalidAmountError);
    });

    it("Must reject a credit card with debt without changing it", () => {
        const card = new CreditCard();
        card.withdrawFunds(new Money(500000));
        accountRepository.save("spender", card);

        expect(() => useCase.execute("spender")).toThrow(MonthlyStatementNotSupportedError);
        expect(accountRepository.findById("spender").getDebt().getAmount()).toBe(510000);
    });

    it("Must answer the same call differently only by rejecting every product", () => {
        const card = new CreditCard();
        card.withdrawFunds(new Money(500000));
        accountRepository.save("spender", card);
        accountRepository.save("saver", new SavingsAccount(new Money(100000)));

        expect(() => useCase.execute("spender")).toThrow(MonthlyStatementNotSupportedError);
        expect(() => useCase.execute("saver")).toThrow(MonthlyStatementNotSupportedError);
    });

    it("Must reject a savings account without changing it", () => {
        const savings = new SavingsAccount(new Money(100000));
        accountRepository.save("saver", savings);

        expect(() => useCase.execute("saver")).toThrow(MonthlyStatementNotSupportedError);
        expect(savings.getBalance().equals(new Money(100000))).toBe(true);
        expect(savings.getMovements()).toEqual([]);
    });

    it("Must reject a checking account without charging anything", () => {
        const checking = new CheckingAccount(new Money(100000));
        accountRepository.save("payer", checking);

        expect(() => useCase.execute("payer")).toThrow(MonthlyStatementNotSupportedError);
        expect(checking.getBalance().equals(new Money(100000))).toBe(true);
        expect(checking.getMovements()).toEqual([]);
    });
});
