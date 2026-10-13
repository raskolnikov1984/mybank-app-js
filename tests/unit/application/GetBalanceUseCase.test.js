import { describe, expect, it, beforeEach } from "vitest";
import { GetBalanceUseCase } from "../../../src/application/use-cases/GetBalanceUseCase.js";
import { AccountRepository } from "../../../src/application/ports/AccountRepository.js";
import { SavingsAccount } from "../../../src/domain/aggregates/account/entities/SavingsAccount.js";
import { CheckingAccount } from "../../../src/domain/aggregates/account/entities/CheckingAccount.js";
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

describe("GetBalanceUseCase", () => {
    let accountRepository;
    let useCase;

    beforeEach(() => {
        accountRepository = new MockAccountRepository();
        useCase = new GetBalanceUseCase(accountRepository);
    });

    it("Must reject an unknown account", () => {
        expect(() => useCase.execute("nobody")).toThrow(AccountInvalidAmountError);
    });

    it("Must report that only the credit card supports a monthly statement", () => {
        accountRepository.save("saver", new SavingsAccount(new Money(1000)));
        accountRepository.save("payer", new CheckingAccount(new Money(1000)));
        accountRepository.save("spender", new CreditCard());

        expect(useCase.execute("saver").supportsMonthlyStatement).toBe(false);
        expect(useCase.execute("payer").supportsMonthlyStatement).toBe(false);
        expect(useCase.execute("spender").supportsMonthlyStatement).toBe(true);
    });

    it("Must return the balance, type and summary of the product", () => {
        accountRepository.save("saver", new SavingsAccount(new Money(100000)));

        const result = useCase.execute("saver");

        expect(result.balance.equals(new Money(100000))).toBe(true);
        expect(result.type).toBe("SAVINGS");
        expect(result.typeName).toBe("Cuenta de Ahorros");
        expect(result.summary).toContain("Saldo");
    });
});
