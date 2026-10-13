import { describe, expect, it, beforeEach } from "vitest";
import { RegisterUserUseCase } from "../../../src/application/use-cases/RegisterUserUseCase.js";
import { SubmitRegistrationRequestUseCase } from "../../../src/application/use-cases/SubmitRegistrationRequestUseCase.js";
import { ApproveRegistrationRequestUseCase } from "../../../src/application/use-cases/ApproveRegistrationRequestUseCase.js";
import { RejectRegistrationRequestUseCase } from "../../../src/application/use-cases/RejectRegistrationRequestUseCase.js";
import { ListRegistrationRequestsUseCase } from "../../../src/application/use-cases/ListRegistrationRequestsUseCase.js";
import { ListUsersUseCase } from "../../../src/application/use-cases/ListUsersUseCase.js";
import { CreateManagerUseCase } from "../../../src/application/use-cases/CreateManagerUseCase.js";
import { LoginUseCase } from "../../../src/application/use-cases/LoginUseCase.js";
import { DeleteUserUseCase } from "../../../src/application/use-cases/DeleteUserUseCase.js";
import { User } from "../../../src/domain/aggregates/user/entities/User.js";
import { SavingsAccount } from "../../../src/domain/aggregates/account/entities/SavingsAccount.js";
import { InvalidIdentificationError } from "../../../src/domain/aggregates/user/errors/InvalidIdentificationError.js";
import { FullNameInvalidError } from "../../../src/domain/aggregates/user/errors/FullNameInvalidError.js";
import { InvalidPhoneError } from "../../../src/domain/aggregates/user/errors/InvalidPhoneError.js";
import { PasswordMismatchError } from "../../../src/domain/aggregates/user/errors/PasswordMismatchError.js";
import { IdentificationAlreadyRegisteredError } from "../../../src/domain/aggregates/user/errors/IdentificationAlreadyRegisteredError.js";
import { Money } from "../../../src/domain/shared/value-objects/Money.js";
import { withIdentity } from "./clientData.js";
import { MockUserRepository, MockAccountRepository, MockRegistrationRequestRepository } from "./mockRepositories.js";

const base = { name: "ana", password: "clave123", initialBalance: 50000, accountType: "SAVINGS" };

describe("Client identity in registration", () => {
    let users;
    let accounts;
    let requests;
    let register;
    let submit;

    beforeEach(() => {
        users = new MockUserRepository();
        accounts = new MockAccountRepository();
        requests = new MockRegistrationRequestRepository();
        register = new RegisterUserUseCase(users, accounts);
        submit = new SubmitRegistrationRequestUseCase(users, requests);
        new CreateManagerUseCase(users, accounts).execute();
    });

    const nothingStored = (name = "ana") => {
        expect(users.exists(name)).toBe(false);
        expect(accounts.findById(name)).toBeNull();
        expect(requests.findByName(name)).toBeNull();
    };

    describe("direct registration", () => {
        it("Must store the normalized identity data in the client", () => {
            register.execute(withIdentity(base, {
                identificationType: "PASSPORT",
                identificationNumber: " ab123456 ",
                fullName: "  María  José Pérez-Núñez ",
                phone: "300 123 4567",
            }));

            const profile = users.findByName("ana").getProfile();
            expect(profile.getIdentification().key()).toBe("PASSPORT:AB123456");
            expect(profile.getFullName()).toBe("María José Pérez-Núñez");
            expect(profile.getPhone()).toBe("3001234567");
        });

        it("Must reject each invalid piece of identity data and store nothing", () => {
            const cases = [
                [{ identificationNumber: "10A0304050" }, InvalidIdentificationError],
                [{ identificationNumber: "12345" }, InvalidIdentificationError],
                [{ identificationType: "PASSPORT", identificationNumber: "AB-12345" }, InvalidIdentificationError],
                [{ identificationType: "DNI" }, InvalidIdentificationError],
                [{ identificationNumber: "" }, InvalidIdentificationError],
                [{ fullName: "" }, FullNameInvalidError],
                [{ fullName: "Ana 2" }, FullNameInvalidError],
                [{ phone: "6011234567" }, InvalidPhoneError],
                [{ phone: "300123456" }, InvalidPhoneError],
                [{ phone: "300123456a" }, InvalidPhoneError],
            ];

            for (const [overrides, ErrorClass] of cases) {
                expect(() => register.execute(withIdentity(base, overrides))).toThrow(ErrorClass);
                nothingStored();
            }
        });

        it("Must reject missing identity data", () => {
            for (const missing of ["identificationType", "identificationNumber", "fullName", "phone"])
                expect(() => register.execute(withIdentity(base, { [missing]: undefined }))).toThrow();
            expect(() => register.execute({ ...base, confirmPassword: base.password })).toThrow(InvalidIdentificationError);
            nothingStored();
        });

        it("Must reject a confirmation that differs or is missing and store nothing", () => {
            expect(() => register.execute(withIdentity(base, { confirmPassword: "clave124" }))).toThrow(PasswordMismatchError);
            expect(() => register.execute(withIdentity(base, { confirmPassword: undefined }))).toThrow(PasswordMismatchError);
            expect(() => register.execute(withIdentity(base, { confirmPassword: "" }))).toThrow(PasswordMismatchError);
            nothingStored();
        });

        it("Must not store the confirmation anywhere in the user", () => {
            register.execute(withIdentity(base, { confirmPassword: "clave123" }));

            expect(JSON.stringify(users.findByName("ana").toSnapshot())).not.toContain("confirm");
        });

        it("Must reject an identification already used by a client and keep the existing client", () => {
            register.execute(withIdentity(base, { identificationNumber: "1020304050" }));

            expect(() =>
                register.execute(withIdentity({ ...base, name: "luis" }, { identificationNumber: "1020304050" })),
            ).toThrow(IdentificationAlreadyRegisteredError);

            nothingStored("luis");
            expect(users.findByName("ana").getProfile().getIdentification().getNumber()).toBe("1020304050");
        });

        it("Must treat the same number with another type as a different identification", () => {
            register.execute(withIdentity(base, { identificationNumber: "123456" }));

            expect(() =>
                register.execute(
                    withIdentity({ ...base, name: "luis" }, { identificationType: "PASSPORT", identificationNumber: "123456" }),
                ),
            ).not.toThrow();
        });

        it("Must free the identification when the client is deleted", () => {
            register.execute(withIdentity({ ...base, accountType: "CREDIT_CARD" }, { identificationNumber: "1020304050" }));
            new DeleteUserUseCase(users, accounts).execute({ name: "ana", confirmed: true });

            expect(() =>
                register.execute(withIdentity({ ...base, name: "luis" }, { identificationNumber: "1020304050" })),
            ).not.toThrow();
        });

        it("Must keep rejecting a repeated user name", () => {
            register.execute(withIdentity(base));

            expect(() => register.execute(withIdentity(base))).toThrow("El usuario ya existe en el Banco Mi Plata");
        });
    });

    describe("registration requests", () => {
        it("Must store the identity data in the pending request", () => {
            submit.execute(withIdentity(base, { fullName: "Ana  Pérez", phone: "310 555 1212" }));

            const profile = requests.findByName("ana").getProfile();
            expect(profile.getFullName()).toBe("Ana Pérez");
            expect(profile.getPhone()).toBe("3105551212");
            expect(JSON.stringify(requests.findByName("ana").toSnapshot())).not.toContain("confirm");
        });

        it("Must reject invalid identity data and a wrong confirmation without storing", () => {
            expect(() => submit.execute(withIdentity(base, { identificationNumber: "1" }))).toThrow(InvalidIdentificationError);
            expect(() => submit.execute(withIdentity(base, { fullName: "" }))).toThrow(FullNameInvalidError);
            expect(() => submit.execute(withIdentity(base, { phone: "123" }))).toThrow(InvalidPhoneError);
            expect(() => submit.execute(withIdentity(base, { confirmPassword: "otra" }))).toThrow(PasswordMismatchError);
            expect(() => submit.execute(withIdentity(base, { confirmPassword: undefined }))).toThrow(PasswordMismatchError);
            expect(requests.findAll()).toEqual([]);
        });

        it("Must reject an identification used by a client and keep everything unchanged", () => {
            register.execute(withIdentity({ ...base, name: "luis" }, { identificationNumber: "1020304050" }));

            expect(() => submit.execute(withIdentity(base, { identificationNumber: "1020304050" }))).toThrow(
                IdentificationAlreadyRegisteredError,
            );
            expect(requests.findAll()).toEqual([]);
        });

        it("Must reject an identification that already has a pending request and keep the first one", () => {
            submit.execute(withIdentity({ ...base, name: "primera" }, { identificationNumber: "1020304050" }));

            expect(() =>
                submit.execute(withIdentity({ ...base, name: "segunda" }, { identificationNumber: "1020304050" })),
            ).toThrow(IdentificationAlreadyRegisteredError);
            expect(requests.findAll().map((r) => r.getName())).toEqual(["primera"]);
        });

        it("Must allow the same number with a different type", () => {
            submit.execute(withIdentity({ ...base, name: "primera" }, { identificationNumber: "123456" }));

            expect(() =>
                submit.execute(
                    withIdentity({ ...base, name: "segunda" }, { identificationType: "PASSPORT", identificationNumber: "123456" }),
                ),
            ).not.toThrow();
        });

        it("Must free the identification when the request is rejected", () => {
            submit.execute(withIdentity(base, { identificationNumber: "1020304050" }));
            new RejectRegistrationRequestUseCase(requests).execute({ name: "ana" });

            expect(() =>
                submit.execute(withIdentity({ ...base, name: "luis" }, { identificationNumber: "1020304050" })),
            ).not.toThrow();
        });

        it("Must keep checking the user name before anything is stored", () => {
            register.execute(withIdentity(base));

            expect(() => submit.execute(withIdentity(base))).toThrow("El usuario ya existe en el Banco Mi Plata");
            expect(requests.findAll()).toEqual([]);
        });
    });

    describe("approval", () => {
        let approve;

        beforeEach(() => {
            approve = new ApproveRegistrationRequestUseCase(requests, register);
        });

        it("Must give the new client the identity data of the request", () => {
            submit.execute(withIdentity(base, {
                identificationType: "PASSPORT",
                identificationNumber: "xy987654",
                fullName: "Ana Pérez",
                phone: "3105551212",
            }));

            approve.execute({ name: "ana" });

            const profile = users.findByName("ana").getProfile();
            expect(profile.getIdentification().key()).toBe("PASSPORT:XY987654");
            expect(profile.getFullName()).toBe("Ana Pérez");
            expect(profile.getPhone()).toBe("3105551212");
            expect(new LoginUseCase(users).execute({ name: "ana", password: "clave123" }).user.getName()).toBe("ana");
            expect(requests.findByName("ana")).toBeNull();
        });

        it("Must fail and keep the request when the identification was taken meanwhile", () => {
            submit.execute(withIdentity(base, { identificationNumber: "1020304050" }));
            register.execute(withIdentity({ ...base, name: "directo" }, { identificationNumber: "1020304050" }));

            expect(() => approve.execute({ name: "ana" })).toThrow(IdentificationAlreadyRegisteredError);

            expect(requests.findByName("ana")).not.toBeNull();
            expect(users.exists("ana")).toBe(false);
            expect(accounts.findById("ana")).toBeNull();
        });
    });

    describe("listings", () => {
        it("Must list the requests with identity data and without passwords", () => {
            submit.execute(withIdentity(base, {
                identificationNumber: "1020304050",
                fullName: "Ana Pérez",
                phone: "300 123 4567",
            }));

            const [item] = new ListRegistrationRequestsUseCase(requests).execute().requests;

            expect(item.fullName).toBe("Ana Pérez");
            expect(item.identificationType).toBe("CEDULA");
            expect(item.identification).toBe("1020304050");
            expect(item.phone).toBe("3001234567");
            expect(JSON.stringify(item)).not.toContain("clave123");
        });

        it("Must list the clients with identity data, and null fields for older clients", () => {
            register.execute(withIdentity({ ...base, name: "ana" }, { identificationNumber: "1020304050", fullName: "Ana Pérez" }));
            const legacyAccount = new SavingsAccount(new Money(1000));
            accounts.save("viejo", legacyAccount);
            users.save(new User("viejo", "pw", legacyAccount));

            const list = new ListUsersUseCase(users).execute().users;
            const ana = list.find((u) => u.name === "ana");
            const viejo = list.find((u) => u.name === "viejo");

            expect(ana.fullName).toBe("Ana Pérez");
            expect(ana.identificationType).toBe("CEDULA");
            expect(ana.identification).toBe("1020304050");
            expect(ana.phone).toBe("3001234567");
            expect(viejo.name).toBe("viejo");
            expect(viejo.fullName).toBeNull();
            expect(viejo.identification).toBeNull();
            expect(viejo.phone).toBeNull();
            expect(list.some((u) => u.name === "gerente")).toBe(false);
            expect(JSON.stringify(list)).not.toContain("clave123");
        });
    });
});
