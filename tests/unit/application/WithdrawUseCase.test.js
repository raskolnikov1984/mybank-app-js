import { describe, expect, it } from "vitest";
import { WithdrawUseCase } from "../../../src/application/use-cases/WithdrawUseCase.js";
import { AccountRepository } from "../../../src/application/ports/AccountRepository.js";
import { SavingsAccount } from "../../../src/domain/aggregates/account/entities/SavingsAccount.js";
import { CheckingAccount } from "../../../src/domain/aggregates/account/entities/CheckingAccount.js";
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

describe("WithdrawUseCase business rules", () => {
    it("Must credit the withdrawal interest of a savings account and persist it", () => {
        const repository = new MockAccountRepository();
        repository.save("saver", new SavingsAccount(new Money(100000)));

        const { newBalance } = new WithdrawUseCase(repository).execute({ accountId: "saver", amount: 40000 });

        expect(newBalance.equals(new Money(61500))).toBe(true);
        expect(repository.findById("saver").getMovements().map((m) => m.getType())).toEqual([
            "INTEREST",
            "WITHDRAW",
        ]);
    });

    it("Must let a checking account withdraw up to 120% of its balance", () => {
        const repository = new MockAccountRepository();
        repository.save("payer", new CheckingAccount(new Money(1000000)));

        new WithdrawUseCase(repository).execute({ accountId: "payer", amount: 1200000 });

        expect(repository.findById("payer").getCreditUsed().equals(new Money(200000))).toBe(true);
    });
});
