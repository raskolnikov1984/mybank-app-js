import { describe, expect, it } from "vitest";
import { AmountInvalidError } from "../../src/domain/Aggregates/Account/Errors/AmountInvalidError.js";
import { DomainError } from "../../src/domain/Aggregates/Shared/Errors/DomainError.js";

describe("AmountInvalidError", () => {
    it("Must be a subclass of DomainError", () => {
        const error = new AmountInvalidError();

        expect(error).toBeInstanceOf(DomainError);
        expect(error).toBeInstanceOf(Error);
    });

    it("Must have default message", () => {
        const error = new AmountInvalidError();

        expect(error.message).toEqual("The provided amount is invalid");
    });

    it("Must allow custom message", () => {
        const error = new AmountInvalidError("Custom message");

        expect(error.message).toEqual("Custom message");
    });

    it("Must set name to class name", () => {
        const error = new AmountInvalidError();

        expect(error.name).toEqual("AmountInvalidError");
    });

    it("errorCode must return AMOUNT_INVALID_ERROR", () => {
        const error = new AmountInvalidError();

        expect(error.errorCode()).toEqual("AMOUNT_INVALID_ERROR");
    });

    it("throwError must return the error code via errorCode", () => {
        const error = new AmountInvalidError();

        expect(error.throwError()).toEqual("AMOUNT_INVALID_ERROR");
    });
});

describe("DomainError", () => {
    it("Must not be instantiable directly", () => {
        expect(() => new DomainError("test")).toThrow(TypeError);
    });
});
