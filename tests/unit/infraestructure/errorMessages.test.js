import { describe, expect, it } from "vitest";
import { toMessage } from "../../../src/infraestructure/web/errorMessages.js";
import { AccountNotEnoughtFundsError } from "../../../src/domain/aggregates/account/errors/AccountNotEnoughtFundsError.js";
import { CreditLimitExceededError } from "../../../src/domain/aggregates/account/errors/CreditLimitExceededError.js";
import { AccountInvalidAmountError } from "../../../src/domain/aggregates/account/errors/AccountInvalidAmountError.js";
import { MonthlyStatementNotSupportedError } from "../../../src/domain/aggregates/account/errors/MonthlyStatementNotSupportedError.js";
import { UserAlreadyExistsError } from "../../../src/domain/aggregates/user/errors/UserAlreadyExistsError.js";
import { UserHasOpenBalanceError } from "../../../src/domain/aggregates/user/errors/UserHasOpenBalanceError.js";
import { DeletionNotConfirmedError } from "../../../src/domain/aggregates/user/errors/DeletionNotConfirmedError.js";
import { ManagerProtectedError } from "../../../src/domain/aggregates/user/errors/ManagerProtectedError.js";
import { RegistrationRequestAlreadyExistsError } from "../../../src/domain/aggregates/registration/errors/RegistrationRequestAlreadyExistsError.js";
import { RegistrationRequestNotFoundError } from "../../../src/domain/aggregates/registration/errors/RegistrationRequestNotFoundError.js";
import { InvalidIdentificationError } from "../../../src/domain/aggregates/user/errors/InvalidIdentificationError.js";
import { FullNameInvalidError } from "../../../src/domain/aggregates/user/errors/FullNameInvalidError.js";
import { InvalidPhoneError } from "../../../src/domain/aggregates/user/errors/InvalidPhoneError.js";
import { PasswordMismatchError } from "../../../src/domain/aggregates/user/errors/PasswordMismatchError.js";
import { IdentificationAlreadyRegisteredError } from "../../../src/domain/aggregates/user/errors/IdentificationAlreadyRegisteredError.js";
import { AccountLockedError } from "../../../src/domain/aggregates/user/errors/AccountLockedError.js";
import { SameAccountTransferError } from "../../../src/domain/aggregates/account/errors/SameAccountTransferError.js";
import { UserNotFoundError } from "../../../src/domain/aggregates/user/errors/UserNotFoundError.js";

describe("toMessage", () => {
    it("Must translate domain errors by code", () => {
        expect(toMessage(new AccountNotEnoughtFundsError())).toBe("Fondos insuficientes para realizar el retiro.");
        expect(toMessage(new CreditLimitExceededError())).toContain("cupo");
    });

    it("Must keep the Spanish message of login errors", () => {
        expect(toMessage(new AccountLockedError("Cuenta bloqueada por 24 horas"))).toBe("Cuenta bloqueada por 24 horas");
        expect(toMessage(new UserNotFoundError("No tiene una cuenta abierta en el Banco Mi Plata"))).toBe(
            "No tiene una cuenta abierta en el Banco Mi Plata",
        );
    });

    it("Must translate the transfer to the same account", () => {
        expect(toMessage(new SameAccountTransferError())).toBe("No puedes transferir a tu propia cuenta.");
    });

    it("Must translate the unsupported monthly statement", () => {
        expect(toMessage(new MonthlyStatementNotSupportedError())).toBe("Tu producto no tiene estado mensual.");
    });

    it("Must translate the user administration errors", () => {
        expect(toMessage(new UserAlreadyExistsError())).toBe("Ya existe un usuario con ese nombre.");
        expect(toMessage(new UserHasOpenBalanceError())).toContain("en cero");
        expect(toMessage(new DeletionNotConfirmedError())).toContain("confirmar");
        expect(toMessage(new ManagerProtectedError())).toContain("gerente");
    });

    it("Must translate the registration request errors", () => {
        expect(toMessage(new RegistrationRequestAlreadyExistsError())).toContain("solicitud de registro pendiente");
        expect(toMessage(new RegistrationRequestNotFoundError())).toBe("No se encontró la solicitud de registro.");
    });

    it("Must show the Spanish message of the identity and password errors", () => {
        expect(toMessage(new InvalidIdentificationError("La cédula debe tener entre 6 y 10 dígitos"))).toBe(
            "La cédula debe tener entre 6 y 10 dígitos",
        );
        expect(toMessage(new FullNameInvalidError("El nombre completo es obligatorio"))).toBe("El nombre completo es obligatorio");
        expect(toMessage(new InvalidPhoneError())).toBe("El celular debe tener 10 dígitos y empezar por 3");
        expect(toMessage(new PasswordMismatchError())).toBe("La contraseña y su confirmación no coinciden");
        expect(toMessage(new IdentificationAlreadyRegisteredError())).toContain("identificación");
    });

    it("Must translate account not found", () => {
        expect(toMessage(new AccountInvalidAmountError("Account not found"))).toBe("No se encontró la cuenta.");
    });

    it("Must fall back to the error message or a generic text", () => {
        expect(toMessage(new Error("boom"))).toBe("boom");
        expect(toMessage(undefined)).toBe("Ocurrió un error inesperado.");
    });
});
