import { describe, expect, it, beforeEach } from "vitest";
import { RegisterUserUseCase } from "../../../src/application/use-cases/RegisterUserUseCase.js";
import { UserRepository } from "../../../src/application/ports/UserRepository.js";
import { AccountRepository } from "../../../src/application/ports/AccountRepository.js";
import { SavingsAccount } from "../../../src/domain/aggregates/account/entities/SavingsAccount.js";
import { CheckingAccount } from "../../../src/domain/aggregates/account/entities/CheckingAccount.js";
import { CreditCard } from "../../../src/domain/aggregates/account/entities/CreditCard.js";
import { AccountType } from "../../../src/domain/aggregates/account/value-objects/AccountType.js";
import { InvalidAccountTypeError } from "../../../src/domain/aggregates/account/errors/InvalidAccountTypeError.js";
import { AmountInvalidError } from "../../../src/domain/shared/errors/AmountInvalidError.js";
import { UserRole } from "../../../src/domain/aggregates/user/value-objects/UserRole.js";
import { Money } from "../../../src/domain/shared/value-objects/Money.js";

class MockUserRepository extends UserRepository {
    #users = new Map();

    findByName(name) {
        return this.#users.get(name) || null;
    }

    save(user) {
        this.#users.set(user.getName(), user);
    }

    exists(name) {
        return this.#users.has(name);
    }
}

class MockAccountRepository extends AccountRepository {
    #accounts = new Map();

    findById(id) {
        return this.#accounts.get(id) || null;
    }

    save(id, account) {
        this.#accounts.set(id, account);
    }
}

describe("RegisterUserUseCase", () => {
    let userRepository;
    let accountRepository;
    let useCase;

    beforeEach(() => {
        userRepository = new MockUserRepository();
        accountRepository = new MockAccountRepository();
        useCase = new RegisterUserUseCase(userRepository, accountRepository);
    });

    it("Must register a client with a savings account", () => {
        useCase.execute({ name: "ana", password: "pw", initialBalance: 50000, accountType: AccountType.SAVINGS });

        const account = accountRepository.findById("ana");
        expect(account).toBeInstanceOf(SavingsAccount);
        expect(account.getBalance().equals(new Money(50000))).toBe(true);
        expect(userRepository.findByName("ana").getRole()).toBe(UserRole.CLIENTE);
    });

    it("Must register a client with a checking account", () => {
        useCase.execute({ name: "ana", password: "pw", initialBalance: 100000, accountType: AccountType.CHECKING });

        expect(accountRepository.findById("ana")).toBeInstanceOf(CheckingAccount);
    });

    it("Must register a client with a credit card without initial balance", () => {
        useCase.execute({ name: "ana", password: "pw", accountType: AccountType.CREDIT_CARD });

        const card = accountRepository.findById("ana");
        expect(card).toBeInstanceOf(CreditCard);
        expect(userRepository.findByName("ana").getAccount()).toBe(card);
    });

    it("Must default to a savings account when no type is given", () => {
        useCase.execute({ name: "ana", password: "pw", initialBalance: 50000 });

        expect(accountRepository.findById("ana")).toBeInstanceOf(SavingsAccount);
    });

    it("Must reject an unknown type", () => {
        expect(() =>
            useCase.execute({ name: "ana", password: "pw", initialBalance: 1000, accountType: "GOLD" }),
        ).toThrow(InvalidAccountTypeError);
    });

    it("Must require a positive initial balance for savings and checking", () => {
        expect(() =>
            useCase.execute({ name: "ana", password: "pw", initialBalance: 0, accountType: AccountType.CHECKING }),
        ).toThrow(AmountInvalidError);
    });
});
