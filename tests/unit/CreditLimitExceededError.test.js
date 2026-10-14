import { describe, expect, it } from "vitest";
import { CreditLimitExceededError } from "../../src/domain/aggregates/account/errors/CreditLimitExceededError.js";
import { InvalidAccountTypeError } from "../../src/domain/aggregates/account/errors/InvalidAccountTypeError.js";
import { MonthlyStatementNotSupportedError } from "../../src/domain/aggregates/account/errors/MonthlyStatementNotSupportedError.js";
import { PaymentExceedsDebtError } from "../../src/domain/aggregates/account/errors/PaymentExceedsDebtError.js";
import { DomainError } from "../../src/domain/shared/errors/DomainError.js";

describe("CreditLimitExceededError", () => {
    it("Must be a DomainError with its error code", () => {
        const error = new CreditLimitExceededError();

        expect(error).toBeInstanceOf(DomainError);
        expect(error.name).toBe("CreditLimitExceededError");
        expect(error.errorCode()).toBe("CREDIT_LIMIT_EXCEEDED_ERROR");
    });
});

describe("PaymentExceedsDebtError", () => {
    it("Must be a DomainError with its error code", () => {
        const error = new PaymentExceedsDebtError();

        expect(error).toBeInstanceOf(DomainError);
        expect(error.name).toBe("PaymentExceedsDebtError");
        expect(error.errorCode()).toBe("PAYMENT_EXCEEDS_DEBT_ERROR");
        expect(new PaymentExceedsDebtError("x").message).toBe("x");
    });
});

describe("InvalidAccountTypeError", () => {
    it("Must be a DomainError with its error code", () => {
        const error = new InvalidAccountTypeError();

        expect(error).toBeInstanceOf(DomainError);
        expect(error.errorCode()).toBe("INVALID_ACCOUNT_TYPE_ERROR");
        expect(new InvalidAccountTypeError("x").message).toBe("x");
    });
});

describe("MonthlyStatementNotSupportedError", () => {
    it("Must be a DomainError with its error code", () => {
        const error = new MonthlyStatementNotSupportedError();

        expect(error).toBeInstanceOf(DomainError);
        expect(error.name).toBe("MonthlyStatementNotSupportedError");
        expect(error.errorCode()).toBe("MONTHLY_STATEMENT_NOT_SUPPORTED_ERROR");
        expect(new MonthlyStatementNotSupportedError("x").message).toBe("x");
    });
});
