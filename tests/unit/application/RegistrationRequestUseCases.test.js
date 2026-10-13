import { describe, expect, it, beforeEach } from "vitest";
import { SubmitRegistrationRequestUseCase } from "../../../src/application/use-cases/SubmitRegistrationRequestUseCase.js";
import { ListRegistrationRequestsUseCase } from "../../../src/application/use-cases/ListRegistrationRequestsUseCase.js";
import { ApproveRegistrationRequestUseCase } from "../../../src/application/use-cases/ApproveRegistrationRequestUseCase.js";
import { RejectRegistrationRequestUseCase } from "../../../src/application/use-cases/RejectRegistrationRequestUseCase.js";
import { RegisterUserUseCase } from "../../../src/application/use-cases/RegisterUserUseCase.js";
import { CreateManagerUseCase } from "../../../src/application/use-cases/CreateManagerUseCase.js";
import { LoginUseCase } from "../../../src/application/use-cases/LoginUseCase.js";
import { SavingsAccount } from "../../../src/domain/aggregates/account/entities/SavingsAccount.js";
import { CreditCard } from "../../../src/domain/aggregates/account/entities/CreditCard.js";
import { RegistrationRequestAlreadyExistsError } from "../../../src/domain/aggregates/registration/errors/RegistrationRequestAlreadyExistsError.js";
import { RegistrationRequestNotFoundError } from "../../../src/domain/aggregates/registration/errors/RegistrationRequestNotFoundError.js";
import { UserAlreadyExistsError } from "../../../src/domain/aggregates/user/errors/UserAlreadyExistsError.js";
import { UserNameRequiredError } from "../../../src/domain/aggregates/user/errors/UserNameRequiredError.js";
import { UserPasswordRequiredError } from "../../../src/domain/aggregates/user/errors/UserPasswordRequiredError.js";
import { InvalidAccountTypeError } from "../../../src/domain/aggregates/account/errors/InvalidAccountTypeError.js";
import { AmountInvalidError } from "../../../src/domain/shared/errors/AmountInvalidError.js";
import { UserRole } from "../../../src/domain/aggregates/user/value-objects/UserRole.js";
import { MockUserRepository, MockAccountRepository, MockRegistrationRequestRepository } from "./mockRepositories.js";
import { withIdentity } from "./clientData.js";

describe("Registration request use cases", () => {
    let users;
    let accounts;
    let requests;
    let register;
    let submit;
    let list;
    let approve;
    let reject;

    beforeEach(() => {
        users = new MockUserRepository();
        accounts = new MockAccountRepository();
        requests = new MockRegistrationRequestRepository();
        register = new RegisterUserUseCase(users, accounts);
        submit = new SubmitRegistrationRequestUseCase(users, requests);
        list = new ListRegistrationRequestsUseCase(requests);
        approve = new ApproveRegistrationRequestUseCase(requests, register);
        reject = new RejectRegistrationRequestUseCase(requests);
        new CreateManagerUseCase(users, accounts).execute();
    });

    describe("SubmitRegistrationRequestUseCase", () => {
        it("Must store a pending request without creating a user or a product", () => {
            submit.execute(withIdentity({ name: "ana", password: "pw", accountType: "SAVINGS", initialBalance: 50000 }));

            expect(requests.findByName("ana")).not.toBeNull();
            expect(users.exists("ana")).toBe(false);
            expect(accounts.findById("ana")).toBeNull();
        });

        it("Must accept a credit card request without balance", () => {
            submit.execute(withIdentity({ name: "ana", password: "pw", accountType: "CREDIT_CARD" }));

            expect(requests.findByName("ana").getAccountType()).toBe("CREDIT_CARD");
        });

        it("Must reject invalid data and store nothing", () => {
            expect(() => submit.execute(withIdentity({ name: "", password: "pw", initialBalance: 1 }))).toThrow(UserNameRequiredError);
            expect(() => submit.execute(withIdentity({ name: "a", password: "", initialBalance: 1 }))).toThrow(UserPasswordRequiredError);
            expect(() => submit.execute(withIdentity({ name: "a", password: "pw", accountType: "GOLD", initialBalance: 1 }))).toThrow(
                InvalidAccountTypeError,
            );
            expect(() => submit.execute(withIdentity({ name: "a", password: "pw", accountType: "SAVINGS", initialBalance: 0 }))).toThrow(
                AmountInvalidError,
            );
            expect(requests.findAll()).toEqual([]);
        });

        it("Must reject the name of an existing user, including the manager", () => {
            register.execute(withIdentity({ name: "luis", password: "pw", initialBalance: 1000 }));

            expect(() => submit.execute(withIdentity({ name: "luis", password: "x", initialBalance: 1 }))).toThrow(UserAlreadyExistsError);
            expect(() => submit.execute(withIdentity({ name: "gerente", password: "x", initialBalance: 1 }))).toThrow(UserAlreadyExistsError);
            expect(requests.findAll()).toEqual([]);
        });

        it("Must reject a name that already has a pending request and keep the first one", () => {
            submit.execute(withIdentity({ name: "ana", password: "primera", initialBalance: 100 }));

            expect(() => submit.execute(withIdentity({ name: "ana", password: "segunda", initialBalance: 999 }))).toThrow(
                RegistrationRequestAlreadyExistsError,
            );
            expect(requests.findByName("ana").getPassword()).toBe("primera");
            expect(requests.findAll().length).toBe(1);
        });
    });

    describe("ListRegistrationRequestsUseCase", () => {
        it("Must be empty without requests", () => {
            expect(list.execute().requests).toEqual([]);
        });

        it("Must list from the oldest to the newest with type and balance, and no password", () => {
            submit.execute(withIdentity({ name: "primera", password: "secreto1", accountType: "CHECKING", initialBalance: 700 }));
            submit.execute(withIdentity({ name: "segunda", password: "secreto2", accountType: "CREDIT_CARD" }));
            const items = list.execute().requests;

            expect(items.map((r) => r.name)).toEqual(["primera", "segunda"]);
            expect(items[0].accountType).toBe("CHECKING");
            expect(items[0].initialBalance).toBe(700);
            expect(items[1].initialBalance).toBeNull();
            expect(items[0].createdAt).toBeInstanceOf(Date);
            expect(JSON.stringify(items)).not.toContain("secreto");
        });
    });

    describe("ApproveRegistrationRequestUseCase", () => {
        it("Must create the client with the requested data and clear the request", () => {
            submit.execute(withIdentity({ name: "ana", password: "clave", accountType: "SAVINGS", initialBalance: 50000 }));

            approve.execute({ name: "ana" });

            expect(accounts.findById("ana")).toBeInstanceOf(SavingsAccount);
            expect(accounts.findById("ana").getBalance().getAmount()).toBe(50000);
            expect(users.findByName("ana").getRole()).toBe(UserRole.CLIENTE);
            expect(new LoginUseCase(users).execute({ name: "ana", password: "clave" }).user.getName()).toBe("ana");
            expect(requests.findByName("ana")).toBeNull();
        });

        it("Must create a credit card with zero debt", () => {
            submit.execute(withIdentity({ name: "ana", password: "pw", accountType: "CREDIT_CARD" }));

            approve.execute({ name: "ana" });

            expect(accounts.findById("ana")).toBeInstanceOf(CreditCard);
            expect(accounts.findById("ana").getDebt().getAmount()).toBe(0);
        });

        it("Must fail and keep the request when the name was taken meanwhile", () => {
            submit.execute(withIdentity({ name: "ana", password: "pedida", initialBalance: 50000 }));
            register.execute(withIdentity({ name: "ana", password: "directa", initialBalance: 1234 }));

            expect(() => approve.execute({ name: "ana" })).toThrow(UserAlreadyExistsError);

            expect(requests.findByName("ana")).not.toBeNull();
            expect(accounts.findById("ana").getBalance().getAmount()).toBe(1234);
            expect(users.findByName("ana").authenticate("directa")).toBe(true);
        });

        it("Must reject an unknown request", () => {
            expect(() => approve.execute({ name: "nobody" })).toThrow(RegistrationRequestNotFoundError);
            expect(() => approve.execute({})).toThrow(RegistrationRequestNotFoundError);
        });

        it("Must not approve the same request twice", () => {
            submit.execute(withIdentity({ name: "ana", password: "pw", initialBalance: 100 }));
            approve.execute({ name: "ana" });

            expect(() => approve.execute({ name: "ana" })).toThrow(RegistrationRequestNotFoundError);
        });
    });

    describe("RejectRegistrationRequestUseCase", () => {
        it("Must discard the request without creating a user and free the name", () => {
            submit.execute(withIdentity({ name: "ana", password: "pw", initialBalance: 100 }));

            reject.execute({ name: "ana" });

            expect(requests.findByName("ana")).toBeNull();
            expect(users.exists("ana")).toBe(false);
            expect(() => submit.execute(withIdentity({ name: "ana", password: "pw", initialBalance: 100 }))).not.toThrow();
        });

        it("Must reject an unknown request", () => {
            expect(() => reject.execute({ name: "nobody" })).toThrow(RegistrationRequestNotFoundError);
        });
    });
});
