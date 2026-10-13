import { describe, expect, it } from "vitest";
import { FakeStorage } from "./FakeStorage.js";
import { LocalStorageAccountRepository } from "../../../src/infraestructure/repositories/LocalStorageAccountRepository.js";
import { LocalStorageUserRepository } from "../../../src/infraestructure/repositories/LocalStorageUserRepository.js";
import { RegisterUserUseCase } from "../../../src/application/use-cases/RegisterUserUseCase.js";
import { WithdrawUseCase } from "../../../src/application/use-cases/WithdrawUseCase.js";
import { LoginUseCase } from "../../../src/application/use-cases/LoginUseCase.js";
import { CreateManagerUseCase } from "../../../src/application/use-cases/CreateManagerUseCase.js";
import { CreditCard } from "../../../src/domain/aggregates/account/entities/CreditCard.js";
import { SavingsAccount } from "../../../src/domain/aggregates/account/entities/SavingsAccount.js";
import { AccountLockedError } from "../../../src/domain/aggregates/user/errors/AccountLockedError.js";
import { UserRole } from "../../../src/domain/aggregates/user/value-objects/UserRole.js";
import { Money } from "../../../src/domain/shared/value-objects/Money.js";

function open(storage) {
    const accounts = new LocalStorageAccountRepository(storage);
    const users = new LocalStorageUserRepository(accounts, storage);
    return { accounts, users };
}

describe("LocalStorage repositories", () => {
    it("Must return null and false for unknown ids", () => {
        const { accounts, users } = open(new FakeStorage());

        expect(accounts.findById("x")).toBeNull();
        expect(users.findByName("x")).toBeNull();
        expect(users.exists("x")).toBe(false);
    });

    it("Must keep users and typed accounts across a reload", () => {
        const storage = new FakeStorage();
        const first = open(storage);
        new RegisterUserUseCase(first.users, first.accounts).execute({
            name: "ana", password: "pw", accountType: "CREDIT_CARD",
        });
        new WithdrawUseCase(first.accounts).execute({ accountId: "ana", amount: 300000 });

        const second = open(storage);

        expect(second.users.exists("ana")).toBe(true);
        const account = second.accounts.findById("ana");
        expect(account).toBeInstanceOf(CreditCard);
        expect(account.getDebt().equals(new Money(300000))).toBe(true);
        expect(account.getMovements().length).toBe(1);
    });

    it("Must give the user the same account instance the account repository returns", () => {
        const storage = new FakeStorage();
        const first = open(storage);
        new RegisterUserUseCase(first.users, first.accounts).execute({
            name: "ana", password: "pw", initialBalance: 1000,
        });

        const second = open(storage);

        expect(second.users.findByName("ana").getAccount()).toBe(second.accounts.findById("ana"));
        expect(second.users.findByName("ana").getAccount()).toBeInstanceOf(SavingsAccount);
    });

    it("Must keep the lockout across a reload", () => {
        const storage = new FakeStorage();
        const first = open(storage);
        new RegisterUserUseCase(first.users, first.accounts).execute({
            name: "ana", password: "pw", initialBalance: 1000,
        });
        const login = new LoginUseCase(first.users);
        for (let i = 0; i < 3; i++)
            expect(() => login.execute({ name: "ana", password: "bad" })).toThrow();

        const second = open(storage);

        expect(() => new LoginUseCase(second.users).execute({ name: "ana", password: "pw" })).toThrow(
            AccountLockedError,
        );
    });

    it("Must seed the manager only once and restore its role", () => {
        const storage = new FakeStorage();
        const first = open(storage);
        new CreateManagerUseCase(first.users, first.accounts).execute();

        const second = open(storage);
        new CreateManagerUseCase(second.users, second.accounts).execute();

        expect(second.users.findByName("gerente").getRole()).toBe(UserRole.GERENTE);
    });

    it("Must ignore corrupted storage content", () => {
        const storage = new FakeStorage();
        storage.setItem("mi-plata:v1:users", "{not json");
        storage.setItem("mi-plata:v1:accounts", "[1,2");

        const { accounts, users } = open(storage);

        expect(users.exists("gerente")).toBe(false);
        expect(accounts.findById("gerente")).toBeNull();
    });
});
