import { describe, expect, it } from "vitest";
import { Identification } from "../../src/domain/aggregates/user/value-objects/Identification.js";
import { IdentificationType } from "../../src/domain/aggregates/user/value-objects/IdentificationType.js";
import { MobilePhone } from "../../src/domain/aggregates/user/value-objects/MobilePhone.js";
import { FullName } from "../../src/domain/aggregates/user/value-objects/FullName.js";
import { ClientProfile } from "../../src/domain/aggregates/user/value-objects/ClientProfile.js";
import { InvalidIdentificationError } from "../../src/domain/aggregates/user/errors/InvalidIdentificationError.js";
import { FullNameInvalidError } from "../../src/domain/aggregates/user/errors/FullNameInvalidError.js";
import { InvalidPhoneError } from "../../src/domain/aggregates/user/errors/InvalidPhoneError.js";
import { PasswordMismatchError } from "../../src/domain/aggregates/user/errors/PasswordMismatchError.js";
import { IdentificationAlreadyRegisteredError } from "../../src/domain/aggregates/user/errors/IdentificationAlreadyRegisteredError.js";
import { DomainError } from "../../src/domain/shared/errors/DomainError.js";

const { CEDULA, PASSPORT } = IdentificationType;

describe("Identification", () => {
    it("Must accept a cédula of 6 to 10 digits", () => {
        for (const number of ["123456", "1020304050", " 1020304050 "])
            expect(new Identification(CEDULA, number).getNumber()).toBe(number.trim());
    });

    it("Must reject a cédula with letters or a wrong length", () => {
        for (const number of ["10A0304050", "12345", "12345678901", "12 3456", "-123456"])
            expect(() => new Identification(CEDULA, number)).toThrow(InvalidIdentificationError);
    });

    it("Must store a passport in uppercase and ignore surrounding spaces", () => {
        const passport = new Identification(PASSPORT, " ab123456 ");

        expect(passport.getNumber()).toBe("AB123456");
        expect(passport.getType()).toBe("PASSPORT");
    });

    it("Must accept passports from 6 to 12 characters and reject others", () => {
        expect(() => new Identification(PASSPORT, "A1B2C3")).not.toThrow();
        expect(() => new Identification(PASSPORT, "A1B2C3D4E5F6")).not.toThrow();
        for (const number of ["AB-12345", "AB123", "AB1234567890123", "AB 12345"])
            expect(() => new Identification(PASSPORT, number)).toThrow(InvalidIdentificationError);
    });

    it("Must reject an unknown type and a missing or non text number", () => {
        expect(() => new Identification("DNI", "12345678")).toThrow(InvalidIdentificationError);
        expect(() => new Identification(undefined, "12345678")).toThrow(InvalidIdentificationError);
        for (const number of ["", "   ", undefined, null, 1020304050])
            expect(() => new Identification(CEDULA, number)).toThrow(InvalidIdentificationError);
    });

    it("Must tell identifications apart by type and number", () => {
        const cedula = new Identification(CEDULA, "123456");

        expect(cedula.key()).toBe("CEDULA:123456");
        expect(cedula.equals(new Identification(CEDULA, "123456"))).toBe(true);
        expect(cedula.equals(new Identification(PASSPORT, "123456"))).toBe(false);
        expect(cedula.equals("CEDULA:123456")).toBe(false);
        expect(new Identification(PASSPORT, "ab123456").equals(new Identification(PASSPORT, "AB123456"))).toBe(true);
    });
});

describe("MobilePhone", () => {
    it("Must accept 10 digits starting with 3 and remove spaces", () => {
        expect(new MobilePhone("3001234567").getNumber()).toBe("3001234567");
        expect(new MobilePhone("300 123 4567").getNumber()).toBe("3001234567");
        expect(new MobilePhone(" 310 1234567 ").getNumber()).toBe("3101234567");
    });

    it("Must reject other starts, lengths, letters and non text values", () => {
        for (const phone of ["6011234567", "300123456", "30012345678", "300123456a", "+573001234567", "", undefined, 3001234567])
            expect(() => new MobilePhone(phone)).toThrow(InvalidPhoneError);
    });
});

describe("FullName", () => {
    it("Must trim and collapse inner spaces, keeping accents and ñ", () => {
        expect(new FullName("  María  José Pérez-Núñez ").getValue()).toBe("María José Pérez-Núñez");
        expect(new FullName("Iñaki O'Connor Jr.").getValue()).toBe("Iñaki O'Connor Jr.");
    });

    it("Must reject empty, blank and non text values", () => {
        for (const value of ["", "   ", undefined, null, 5])
            expect(() => new FullName(value)).toThrow(FullNameInvalidError);
    });

    it("Must reject digits, symbols and invalid lengths", () => {
        for (const value of ["Ana 2", "Ana_Pérez", "Al", "-Ana", "x".repeat(81), "Ana@Perez"])
            expect(() => new FullName(value)).toThrow(FullNameInvalidError);
        expect(() => new FullName("Ana")).not.toThrow();
        expect(() => new FullName("a".repeat(80))).not.toThrow();
    });
});

describe("ClientProfile", () => {
    const data = { fullName: "Ana  Pérez", identificationType: "CEDULA", identificationNumber: "1020304050", phone: "300 123 4567" };

    it("Must group the normalized identity data", () => {
        const profile = new ClientProfile(data);

        expect(profile.getFullName()).toBe("Ana Pérez");
        expect(profile.getIdentification().key()).toBe("CEDULA:1020304050");
        expect(profile.getPhone()).toBe("3001234567");
    });

    it("Must reject any invalid piece", () => {
        expect(() => new ClientProfile({ ...data, identificationNumber: "1" })).toThrow(InvalidIdentificationError);
        expect(() => new ClientProfile({ ...data, fullName: "" })).toThrow(FullNameInvalidError);
        expect(() => new ClientProfile({ ...data, phone: "123" })).toThrow(InvalidPhoneError);
        expect(() => new ClientProfile({})).toThrow(InvalidIdentificationError);
    });

    it("Must survive a snapshot round trip", () => {
        const restored = ClientProfile.restore(JSON.parse(JSON.stringify(new ClientProfile(data).toSnapshot())));

        expect(restored.getFullName()).toBe("Ana Pérez");
        expect(restored.getIdentification().key()).toBe("CEDULA:1020304050");
        expect(restored.getPhone()).toBe("3001234567");
    });
});

describe.each([
    [InvalidIdentificationError, "InvalidIdentificationError", "INVALID_IDENTIFICATION_ERROR"],
    [FullNameInvalidError, "FullNameInvalidError", "FULL_NAME_INVALID_ERROR"],
    [InvalidPhoneError, "InvalidPhoneError", "INVALID_PHONE_ERROR"],
    [PasswordMismatchError, "PasswordMismatchError", "PASSWORD_MISMATCH_ERROR"],
    [IdentificationAlreadyRegisteredError, "IdentificationAlreadyRegisteredError", "IDENTIFICATION_ALREADY_REGISTERED_ERROR"],
])("%s", (ErrorClass, name, code) => {
    it("Must be a DomainError with its name, code, default and custom message", () => {
        const error = new ErrorClass();

        expect(error).toBeInstanceOf(DomainError);
        expect(error.name).toBe(name);
        expect(error.errorCode()).toBe(code);
        expect(error.message.length).toBeGreaterThan(0);
        expect(new ErrorClass("custom").message).toBe("custom");
    });
});
