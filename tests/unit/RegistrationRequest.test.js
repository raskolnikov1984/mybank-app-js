import { describe, expect, it } from "vitest";
import { RegistrationRequest } from "../../src/domain/aggregates/registration/entities/RegistrationRequest.js";
import { RegistrationRequestAlreadyExistsError } from "../../src/domain/aggregates/registration/errors/RegistrationRequestAlreadyExistsError.js";
import { RegistrationRequestNotFoundError } from "../../src/domain/aggregates/registration/errors/RegistrationRequestNotFoundError.js";
import { ClientProfile } from "../../src/domain/aggregates/user/value-objects/ClientProfile.js";
import { InvalidIdentificationError } from "../../src/domain/aggregates/user/errors/InvalidIdentificationError.js";
import { UserNameRequiredError } from "../../src/domain/aggregates/user/errors/UserNameRequiredError.js";
import { UserPasswordRequiredError } from "../../src/domain/aggregates/user/errors/UserPasswordRequiredError.js";
import { InvalidAccountTypeError } from "../../src/domain/aggregates/account/errors/InvalidAccountTypeError.js";
import { AmountInvalidError } from "../../src/domain/shared/errors/AmountInvalidError.js";
import { DomainError } from "../../src/domain/shared/errors/DomainError.js";

const profile = new ClientProfile({
    fullName: "Ana Pérez",
    identificationType: "CEDULA",
    identificationNumber: "1020304050",
    phone: "3001234567",
});
const valid = { name: "ana", password: "pw", accountType: "SAVINGS", initialBalance: 50000, profile };

describe("RegistrationRequest", () => {
    it("Must be created for a savings account with an initial balance", () => {
        const request = new RegistrationRequest(valid);

        expect(request.getName()).toBe("ana");
        expect(request.getPassword()).toBe("pw");
        expect(request.getAccountType()).toBe("SAVINGS");
        expect(request.getInitialBalance()).toBe(50000);
        expect(request.getCreatedAt()).toBeInstanceOf(Date);
    });

    it("Must accept a checking account", () => {
        expect(new RegistrationRequest({ ...valid, accountType: "CHECKING" }).getAccountType()).toBe("CHECKING");
    });

    it("Must accept a credit card without an initial balance and ignore any given", () => {
        const withoutBalance = new RegistrationRequest({ name: "ana", password: "pw", accountType: "CREDIT_CARD", profile });
        const withBalance = new RegistrationRequest({ ...valid, accountType: "CREDIT_CARD" });

        expect(withoutBalance.getInitialBalance()).toBeNull();
        expect(withBalance.getInitialBalance()).toBeNull();
    });

    it("Must default to a savings account", () => {
        expect(new RegistrationRequest({ name: "ana", password: "pw", initialBalance: 1, profile }).getAccountType()).toBe("SAVINGS");
    });

    it("Must reject an empty or missing name", () => {
        for (const name of ["", "   ", undefined, null, 5])
            expect(() => new RegistrationRequest({ ...valid, name })).toThrow(UserNameRequiredError);
    });

    it("Must reject an empty or missing password", () => {
        for (const password of ["", "  ", undefined])
            expect(() => new RegistrationRequest({ ...valid, password })).toThrow(UserPasswordRequiredError);
    });

    it("Must keep the identity data of the applicant", () => {
        const request = new RegistrationRequest(valid);

        expect(request.getProfile()).toBe(profile);
        expect(request.getProfile().getIdentification().key()).toBe("CEDULA:1020304050");
    });

    it("Must reject a request without valid identity data", () => {
        for (const bad of [undefined, null, {}, { fullName: "Ana" }, "1020304050"])
            expect(() => new RegistrationRequest({ ...valid, profile: bad })).toThrow(InvalidIdentificationError);
    });

    it("Must keep the identity data in its snapshot and restore it", () => {
        const snapshot = JSON.parse(JSON.stringify(new RegistrationRequest(valid).toSnapshot()));

        expect(snapshot.profile).toEqual({
            fullName: "Ana Pérez",
            identificationType: "CEDULA",
            identificationNumber: "1020304050",
            phone: "3001234567",
        });
        expect(RegistrationRequest.restore(snapshot).getProfile().getPhone()).toBe("3001234567");
    });

    it("Must fail to restore a snapshot saved before identity data existed", () => {
        const { profile: _omitted, ...legacy } = new RegistrationRequest(valid).toSnapshot();

        expect(() => RegistrationRequest.restore(legacy)).toThrow(InvalidIdentificationError);
    });

    it("Must reject an unknown product type", () => {
        expect(() => new RegistrationRequest({ ...valid, accountType: "GOLD" })).toThrow(InvalidAccountTypeError);
    });

    it("Must reject a missing, zero, negative or non numeric balance for savings and checking", () => {
        for (const accountType of ["SAVINGS", "CHECKING"])
            for (const initialBalance of [undefined, 0, -5, "100", NaN])
                expect(() => new RegistrationRequest({ ...valid, accountType, initialBalance })).toThrow(
                    AmountInvalidError,
                );
    });

    it("Must survive a snapshot round trip with its date", () => {
        const createdAt = new Date("2026-10-13T10:00:00.000Z");
        const request = new RegistrationRequest({ ...valid, createdAt });

        const restored = RegistrationRequest.restore(JSON.parse(JSON.stringify(request.toSnapshot())));

        expect(restored.getName()).toBe("ana");
        expect(restored.getPassword()).toBe("pw");
        expect(restored.getInitialBalance()).toBe(50000);
        expect(restored.getCreatedAt().getTime()).toBe(createdAt.getTime());
    });

    it("Must restore a credit card request without balance", () => {
        const request = new RegistrationRequest({ name: "ana", password: "pw", accountType: "CREDIT_CARD", profile });

        const restored = RegistrationRequest.restore(JSON.parse(JSON.stringify(request.toSnapshot())));

        expect(restored.getAccountType()).toBe("CREDIT_CARD");
        expect(restored.getInitialBalance()).toBeNull();
    });
});

describe.each([
    [RegistrationRequestAlreadyExistsError, "RegistrationRequestAlreadyExistsError", "REGISTRATION_REQUEST_ALREADY_EXISTS_ERROR"],
    [RegistrationRequestNotFoundError, "RegistrationRequestNotFoundError", "REGISTRATION_REQUEST_NOT_FOUND_ERROR"],
])("%s", (ErrorClass, name, code) => {
    it("Must be a DomainError with its name, code and a custom message", () => {
        const error = new ErrorClass();

        expect(error).toBeInstanceOf(DomainError);
        expect(error.name).toBe(name);
        expect(error.errorCode()).toBe(code);
        expect(new ErrorClass("custom").message).toBe("custom");
    });
});
