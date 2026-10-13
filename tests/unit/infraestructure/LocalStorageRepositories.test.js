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
import { User } from "../../../src/domain/aggregates/user/entities/User.js";
import { ClientProfile } from "../../../src/domain/aggregates/user/value-objects/ClientProfile.js";
import { Identification } from "../../../src/domain/aggregates/user/value-objects/Identification.js";
import { Money } from "../../../src/domain/shared/value-objects/Money.js";
import { withIdentity } from "../application/clientData.js";

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
        new RegisterUserUseCase(first.users, first.accounts).execute(withIdentity({
            name: "ana", password: "pw", accountType: "CREDIT_CARD",
        }));
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
        new RegisterUserUseCase(first.users, first.accounts).execute(withIdentity({
            name: "ana", password: "pw", initialBalance: 1000,
        }));

        const second = open(storage);

        expect(second.users.findByName("ana").getAccount()).toBe(second.accounts.findById("ana"));
        expect(second.users.findByName("ana").getAccount()).toBeInstanceOf(SavingsAccount);
    });

    it("Must keep the lockout across a reload", () => {
        const storage = new FakeStorage();
        const first = open(storage);
        new RegisterUserUseCase(first.users, first.accounts).execute(withIdentity({
            name: "ana", password: "pw", initialBalance: 1000,
        }));
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

    it("Must list every stored user", () => {
        const storage = new FakeStorage();
        const first = open(storage);
        const register = new RegisterUserUseCase(first.users, first.accounts);
        register.execute(withIdentity({ name: "ana", password: "pw", accountType: "CREDIT_CARD" }));
        register.execute(withIdentity({ name: "luis", password: "pw", initialBalance: 1000 }));

        const second = open(storage);

        expect(second.users.findAll().map((u) => u.getName()).sort()).toEqual(["ana", "luis"]);
    });

    it("Must not bring back a deleted user or account after reopening the storage", () => {
        const storage = new FakeStorage();
        const first = open(storage);
        new RegisterUserUseCase(first.users, first.accounts).execute(withIdentity({
            name: "ana", password: "pw", initialBalance: 1000,
        }));

        first.users.delete("ana");
        first.accounts.delete("ana");
        const second = open(storage);

        expect(first.users.exists("ana")).toBe(false);
        expect(first.accounts.findById("ana")).toBeNull();
        expect(second.users.exists("ana")).toBe(false);
        expect(second.users.findAll()).toEqual([]);
        expect(second.accounts.findById("ana")).toBeNull();
    });

    it("Must skip users whose account is missing when listing", () => {
        const storage = new FakeStorage();
        const first = open(storage);
        new RegisterUserUseCase(first.users, first.accounts).execute(withIdentity({
            name: "ana", password: "pw", initialBalance: 1000,
        }));
        first.accounts.delete("ana");

        expect(open(storage).users.findAll()).toEqual([]);
    });

    it("Must allow reusing a name after deleting it", () => {
        const storage = new FakeStorage();
        const { users, accounts } = open(storage);
        const register = new RegisterUserUseCase(users, accounts);
        register.execute(withIdentity({ name: "ana", password: "pw", initialBalance: 1000 }));
        users.delete("ana");
        accounts.delete("ana");

        register.execute(withIdentity({ name: "ana", password: "otra", accountType: "CREDIT_CARD" }));

        expect(open(storage).accounts.findById("ana")).toBeInstanceOf(CreditCard);
        expect(open(storage).accounts.findById("ana").getMovements()).toEqual([]);
    });

    it("Must not fail when deleting something that does not exist", () => {
        const { users, accounts } = open(new FakeStorage());

        expect(() => users.delete("nobody")).not.toThrow();
        expect(() => accounts.delete("nobody")).not.toThrow();
    });

    it("Must find an identification after reopening the storage, by type and number", () => {
        const storage = new FakeStorage();
        const first = open(storage);
        const profile = new ClientProfile({
            fullName: "Ana Pérez",
            identificationType: "CEDULA",
            identificationNumber: "1020304050",
            phone: "3001234567",
        });
        const account = new SavingsAccount(new Money(1000));
        first.accounts.save("ana", account);
        first.users.save(new User("ana", "pw", account, UserRole.CLIENTE, profile));

        const second = open(storage);

        expect(second.users.existsByIdentification(new Identification("CEDULA", "1020304050"))).toBe(true);
        expect(second.users.existsByIdentification(new Identification("PASSPORT", "1020304050"))).toBe(false);
        expect(second.users.findByName("ana").getProfile().getFullName()).toBe("Ana Pérez");
    });

    it("Must not match users stored without profile and must free the identification on delete", () => {
        const storage = new FakeStorage();
        const { users, accounts } = open(storage);
        new CreateManagerUseCase(users, accounts).execute();
        const account = new SavingsAccount(new Money(1000));
        accounts.save("ana", account);
        users.save(
            new User("ana", "pw", account, UserRole.CLIENTE, new ClientProfile({
                fullName: "Ana Pérez", identificationType: "CEDULA", identificationNumber: "1020304050", phone: "3001234567",
            })),
        );

        expect(users.existsByIdentification(new Identification("CEDULA", "1020304050"))).toBe(true);
        users.delete("ana");
        expect(open(storage).users.existsByIdentification(new Identification("CEDULA", "1020304050"))).toBe(false);
        expect(users.findByName("gerente").getProfile()).toBeNull();
    });

    it("Must load older users stored without a profile field", () => {
        const storage = new FakeStorage();
        const first = open(storage);
        new CreateManagerUseCase(first.users, first.accounts).execute();
        const raw = JSON.parse(storage.getItem("mi-plata:v1:users"));
        delete raw.gerente.profile;
        storage.setItem("mi-plata:v1:users", JSON.stringify(raw));

        const second = open(storage);

        expect(second.users.findByName("gerente").getProfile()).toBeNull();
        expect(second.users.findByName("gerente").authenticate("admin")).toBe(true);
    });
});
