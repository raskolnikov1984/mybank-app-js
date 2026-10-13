import { describe, expect, it, beforeEach } from "vitest";
import { RegisterUserUseCase } from "../../../src/application/use-cases/RegisterUserUseCase.js";
import { CreateManagerUseCase } from "../../../src/application/use-cases/CreateManagerUseCase.js";
import { LoginUseCase } from "../../../src/application/use-cases/LoginUseCase.js";
import { WithdrawUseCase } from "../../../src/application/use-cases/WithdrawUseCase.js";
import { DepositUseCase } from "../../../src/application/use-cases/DepositUseCase.js";
import { ChangeUserPasswordUseCase } from "../../../src/application/use-cases/ChangeUserPasswordUseCase.js";
import { UnlockUserUseCase } from "../../../src/application/use-cases/UnlockUserUseCase.js";
import { DeleteUserUseCase } from "../../../src/application/use-cases/DeleteUserUseCase.js";
import { UserNotFoundError } from "../../../src/domain/aggregates/user/errors/UserNotFoundError.js";
import { ManagerProtectedError } from "../../../src/domain/aggregates/user/errors/ManagerProtectedError.js";
import { UserPasswordRequiredError } from "../../../src/domain/aggregates/user/errors/UserPasswordRequiredError.js";
import { InvalidCredentialsError } from "../../../src/domain/aggregates/user/errors/InvalidCredentialsError.js";
import { AccountLockedError } from "../../../src/domain/aggregates/user/errors/AccountLockedError.js";
import { DeletionNotConfirmedError } from "../../../src/domain/aggregates/user/errors/DeletionNotConfirmedError.js";
import { UserHasOpenBalanceError } from "../../../src/domain/aggregates/user/errors/UserHasOpenBalanceError.js";
import { MockUserRepository, MockAccountRepository } from "./mockRepositories.js";
import { withIdentity } from "./clientData.js";

describe("User administration use cases", () => {
    let users;
    let accounts;
    let register;
    let login;

    beforeEach(() => {
        users = new MockUserRepository();
        accounts = new MockAccountRepository();
        register = new RegisterUserUseCase(users, accounts);
        login = new LoginUseCase(users);
        new CreateManagerUseCase(users, accounts).execute();
    });

    const lock = (name) => {
        for (let i = 0; i < 3; i++)
            expect(() => login.execute({ name, password: "bad" })).toThrow();
    };

    describe("ChangeUserPasswordUseCase", () => {
        it("Must let the client log in with the new password only", () => {
            register.execute(withIdentity({ name: "ana", password: "vieja", initialBalance: 1000 }));

            new ChangeUserPasswordUseCase(users).execute({ name: "ana", newPassword: "nueva123" });

            expect(login.execute({ name: "ana", password: "nueva123" }).user.getName()).toBe("ana");
            expect(() => login.execute({ name: "ana", password: "vieja" })).toThrow(InvalidCredentialsError);
        });

        it("Must reject an empty password and keep the old one", () => {
            register.execute(withIdentity({ name: "ana", password: "vieja", initialBalance: 1000 }));

            expect(() =>
                new ChangeUserPasswordUseCase(users).execute({ name: "ana", newPassword: "" }),
            ).toThrow(UserPasswordRequiredError);
            expect(() =>
                new ChangeUserPasswordUseCase(users).execute({ name: "ana", newPassword: undefined }),
            ).toThrow("La nueva contraseña es obligatoria");
            expect(login.execute({ name: "ana", password: "vieja" }).user.getName()).toBe("ana");
        });

        it("Must keep the product and balance untouched", () => {
            register.execute(withIdentity({ name: "ana", password: "vieja", initialBalance: 1000 }));

            new ChangeUserPasswordUseCase(users).execute({ name: "ana", newPassword: "nueva" });

            expect(accounts.findById("ana").getBalance().getAmount()).toBe(1000);
        });

        it("Must reject an unknown client and the manager", () => {
            const useCase = new ChangeUserPasswordUseCase(users);

            expect(() => useCase.execute({ name: "nobody", newPassword: "x" })).toThrow(UserNotFoundError);
            expect(() => useCase.execute({ name: "gerente", newPassword: "x" })).toThrow(ManagerProtectedError);
            expect(login.execute({ name: "gerente", password: "admin" }).user.getName()).toBe("gerente");
        });
    });

    describe("UnlockUserUseCase", () => {
        it("Must let a locked client log in again", () => {
            register.execute(withIdentity({ name: "ana", password: "pw", initialBalance: 1000 }));
            lock("ana");
            expect(() => login.execute({ name: "ana", password: "pw" })).toThrow(AccountLockedError);

            new UnlockUserUseCase(users).execute({ name: "ana" });

            expect(login.execute({ name: "ana", password: "pw" }).user.getFailedAttempts()).toBe(0);
        });

        it("Must succeed on a client that is not locked", () => {
            register.execute(withIdentity({ name: "ana", password: "pw", initialBalance: 1000 }));

            expect(() => new UnlockUserUseCase(users).execute({ name: "ana" })).not.toThrow();
            expect(users.findByName("ana").isLocked()).toBe(false);
        });

        it("Must reject an unknown client and the manager", () => {
            const useCase = new UnlockUserUseCase(users);

            expect(() => useCase.execute({ name: "nobody" })).toThrow(UserNotFoundError);
            expect(() => useCase.execute({ name: "gerente" })).toThrow(ManagerProtectedError);
        });
    });

    describe("DeleteUserUseCase", () => {
        let remove;

        beforeEach(() => {
            remove = new DeleteUserUseCase(users, accounts);
        });

        it("Must delete a client whose product is at zero", () => {
            register.execute(withIdentity({ name: "luis", password: "pw", initialBalance: 1000, accountType: "CHECKING" }));
            new WithdrawUseCase(accounts).execute({ accountId: "luis", amount: 1000 });

            remove.execute({ name: "luis", confirmed: true });

            expect(users.exists("luis")).toBe(false);
            expect(accounts.findById("luis")).toBeNull();
            expect(() => login.execute({ name: "luis", password: "pw" })).toThrow(UserNotFoundError);
        });

        it("Must delete a credit card without debt", () => {
            register.execute(withIdentity({ name: "ana", password: "pw", accountType: "CREDIT_CARD" }));

            remove.execute({ name: "ana", confirmed: true });

            expect(users.exists("ana")).toBe(false);
        });

        it("Must not delete without an explicit confirmation", () => {
            register.execute(withIdentity({ name: "ana", password: "pw", accountType: "CREDIT_CARD" }));

            for (const confirmed of [undefined, false, "true", 1])
                expect(() => remove.execute({ name: "ana", confirmed })).toThrow(DeletionNotConfirmedError);
            expect(users.exists("ana")).toBe(true);
            expect(accounts.findById("ana")).not.toBeNull();
        });

        it("Must reject a client with a balance", () => {
            register.execute(withIdentity({ name: "sofi", password: "pw", initialBalance: 61500 }));

            expect(() => remove.execute({ name: "sofi", confirmed: true })).toThrow(UserHasOpenBalanceError);
            expect(users.exists("sofi")).toBe(true);
            expect(accounts.findById("sofi").getBalance().getAmount()).toBe(61500);
        });

        it("Must reject a client with debt", () => {
            register.execute(withIdentity({ name: "ana", password: "pw", accountType: "CREDIT_CARD" }));
            new WithdrawUseCase(accounts).execute({ accountId: "ana", amount: 300000 });

            expect(() => remove.execute({ name: "ana", confirmed: true })).toThrow(UserHasOpenBalanceError);
            expect(users.exists("ana")).toBe(true);
        });

        it("Must reject a client with an overdraft in use even if the balance is zero", () => {
            register.execute(withIdentity({ name: "luis", password: "pw", initialBalance: 1000000, accountType: "CHECKING" }));
            new WithdrawUseCase(accounts).execute({ accountId: "luis", amount: 1200000 });
            expect(accounts.findById("luis").getBalance().getAmount()).toBe(0);

            expect(() => remove.execute({ name: "luis", confirmed: true })).toThrow(UserHasOpenBalanceError);
            expect(users.exists("luis")).toBe(true);
        });

        it("Must allow deleting once the overdraft has been fully repaid", () => {
            register.execute(withIdentity({ name: "luis", password: "pw", initialBalance: 1000000, accountType: "CHECKING" }));
            new WithdrawUseCase(accounts).execute({ accountId: "luis", amount: 1200000 });
            new DepositUseCase(accounts).execute({ accountId: "luis", amount: 200000 });
            expect(accounts.findById("luis").getCreditUsed().getAmount()).toBe(0);
            expect(accounts.findById("luis").getBalance().getAmount()).toBe(0);

            remove.execute({ name: "luis", confirmed: true });

            expect(users.exists("luis")).toBe(false);
        });

        it("Must reject an unknown client", () => {
            expect(() => remove.execute({ name: "nobody", confirmed: true })).toThrow(UserNotFoundError);
        });

        it("Must never delete the manager", () => {
            expect(() => remove.execute({ name: "gerente", confirmed: true })).toThrow(ManagerProtectedError);
            expect(users.exists("gerente")).toBe(true);
            expect(accounts.findById("gerente")).not.toBeNull();
        });

        it("Must check the confirmation before anything else", () => {
            expect(() => remove.execute({ name: "gerente" })).toThrow(DeletionNotConfirmedError);
            expect(() => remove.execute({ name: "nobody" })).toThrow(DeletionNotConfirmedError);
        });
    });
});
