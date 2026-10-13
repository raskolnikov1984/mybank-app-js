import { describe, expect, it, beforeEach } from "vitest";
import { RegisterUserUseCase } from "../../../src/application/use-cases/RegisterUserUseCase.js";
import { MockUserRepository, MockAccountRepository } from "./mockRepositories.js";
import { SavingsAccount } from "../../../src/domain/aggregates/account/entities/SavingsAccount.js";
import { CheckingAccount } from "../../../src/domain/aggregates/account/entities/CheckingAccount.js";
import { CreditCard } from "../../../src/domain/aggregates/account/entities/CreditCard.js";
import { AccountType } from "../../../src/domain/aggregates/account/value-objects/AccountType.js";
import { InvalidAccountTypeError } from "../../../src/domain/aggregates/account/errors/InvalidAccountTypeError.js";
import { UserAlreadyExistsError } from "../../../src/domain/aggregates/user/errors/UserAlreadyExistsError.js";
import { AmountInvalidError } from "../../../src/domain/shared/errors/AmountInvalidError.js";
import { UserRole } from "../../../src/domain/aggregates/user/value-objects/UserRole.js";
import { Money } from "../../../src/domain/shared/value-objects/Money.js";
import { withIdentity } from "./clientData.js";

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
        useCase.execute(withIdentity({ name: "ana", password: "pw", initialBalance: 50000, accountType: AccountType.SAVINGS }));

        const account = accountRepository.findById("ana");
        expect(account).toBeInstanceOf(SavingsAccount);
        expect(account.getBalance().equals(new Money(50000))).toBe(true);
        expect(userRepository.findByName("ana").getRole()).toBe(UserRole.CLIENTE);
    });

    it("Must register a client with a checking account", () => {
        useCase.execute(withIdentity({ name: "ana", password: "pw", initialBalance: 100000, accountType: AccountType.CHECKING }));

        expect(accountRepository.findById("ana")).toBeInstanceOf(CheckingAccount);
    });

    it("Must register a client with a credit card without initial balance", () => {
        useCase.execute(withIdentity({ name: "ana", password: "pw", accountType: AccountType.CREDIT_CARD }));

        const card = accountRepository.findById("ana");
        expect(card).toBeInstanceOf(CreditCard);
        expect(userRepository.findByName("ana").getAccount()).toBe(card);
    });

    it("Must default to a savings account when no type is given", () => {
        useCase.execute(withIdentity({ name: "ana", password: "pw", initialBalance: 50000 }));

        expect(accountRepository.findById("ana")).toBeInstanceOf(SavingsAccount);
    });

    it("Must reject an unknown type", () => {
        expect(() =>
            useCase.execute(withIdentity({ name: "ana", password: "pw", initialBalance: 1000, accountType: "GOLD" })),
        ).toThrow(InvalidAccountTypeError);
    });

    it("Must require a positive initial balance for savings and checking", () => {
        expect(() =>
            useCase.execute(withIdentity({ name: "ana", password: "pw", initialBalance: 0, accountType: AccountType.CHECKING })),
        ).toThrow(AmountInvalidError);
    });

    it("Must reject a name that already exists without touching the existing user", () => {
        useCase.execute(withIdentity({ name: "ana", password: "pw", initialBalance: 50000 }));
        accountRepository.findById("ana").withdrawFunds(new Money(10000));

        expect(() =>
            useCase.execute(withIdentity({ name: "ana", password: "otra", accountType: AccountType.CREDIT_CARD })),
        ).toThrow(UserAlreadyExistsError);

        expect(accountRepository.findById("ana")).toBeInstanceOf(SavingsAccount);
        expect(accountRepository.findById("ana").getBalance().equals(new Money(40750))).toBe(true);
        expect(userRepository.findByName("ana").authenticate("pw")).toBe(true);
    });

    it("Must allow a name again once it has been deleted", () => {
        useCase.execute(withIdentity({ name: "ana", password: "pw", initialBalance: 50000 }));
        userRepository.delete("ana");
        accountRepository.delete("ana");

        useCase.execute(withIdentity({ name: "ana", password: "nueva", accountType: AccountType.CREDIT_CARD }));

        expect(accountRepository.findById("ana")).toBeInstanceOf(CreditCard);
        expect(accountRepository.findById("ana").getMovements()).toEqual([]);
    });
});
