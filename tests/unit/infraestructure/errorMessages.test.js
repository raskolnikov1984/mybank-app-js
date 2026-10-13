import { describe, expect, it } from "vitest";
import { toMessage } from "../../../src/infraestructure/web/errorMessages.js";
import { AccountNotEnoughtFundsError } from "../../../src/domain/aggregates/account/errors/AccountNotEnoughtFundsError.js";
import { CreditLimitExceededError } from "../../../src/domain/aggregates/account/errors/CreditLimitExceededError.js";
import { AccountInvalidAmountError } from "../../../src/domain/aggregates/account/errors/AccountInvalidAmountError.js";
import { MonthlyStatementNotSupportedError } from "../../../src/domain/aggregates/account/errors/MonthlyStatementNotSupportedError.js";
import { AccountLockedError } from "../../../src/domain/aggregates/user/errors/AccountLockedError.js";
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

    it("Must translate the unsupported monthly statement", () => {
        expect(toMessage(new MonthlyStatementNotSupportedError())).toBe("Tu producto no tiene estado mensual.");
    });

    it("Must translate account not found", () => {
        expect(toMessage(new AccountInvalidAmountError("Account not found"))).toBe("No se encontró la cuenta.");
    });

    it("Must fall back to the error message or a generic text", () => {
        expect(toMessage(new Error("boom"))).toBe("boom");
        expect(toMessage(undefined)).toBe("Ocurrió un error inesperado.");
    });
});
