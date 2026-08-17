import { describe, expect, it } from "vitest";
import { AccountInvalidAmountError } from "../../src/domain/aggregates/account/errors/AccountInvalidAmountError.js";
import { DomainError } from "../../src/domain/shared/errors/DomainError.js";

describe("AccountInvalidAmountError", () => {
    it("Must be a subclass of DomainError", () => {
        const error = new AccountInvalidAmountError();

        expect(error).toBeInstanceOf(DomainError);
        expect(error).toBeInstanceOf(Error);
    });

    it("Must have default message", () => {
        const error = new AccountInvalidAmountError();

        expect(error.message).toEqual("The provided amount type is invalid");
    });

    it("Must allow custom message", () => {
        const error = new AccountInvalidAmountError("Custom message");

        expect(error.message).toEqual("Custom message");
    });

    it("Must set name to class name", () => {
        const error = new AccountInvalidAmountError();

        expect(error.name).toEqual("AccountInvalidAmountError");
    });

    it("errorCode must return ACCOUNT_INVALID_AMOUNT_ERROR", () => {
        const error = new AccountInvalidAmountError();

        expect(error.errorCode()).toEqual("ACCOUNT_INVALID_AMOUNT_ERROR");
    });

    it("throwError must return the error code via errorCode", () => {
        const error = new AccountInvalidAmountError();

        expect(error.throwError()).toEqual("ACCOUNT_INVALID_AMOUNT_ERROR");
    });
});
