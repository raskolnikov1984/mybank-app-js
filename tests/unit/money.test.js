import { describe, expect, it } from "vitest";
import {
    Money,
    Currency,
} from "../../src/domain/Aggregates/Account/ValueObjects/Money.js";
import { AmountInvalidError } from "../../src/domain/Aggregates/Account/Errors/AmountInvalidError.js";

describe("Money", () => {
    describe("Creation", () => {
        it("Must be possible to create a valid Money amount from integer", () => {
            const cash = new Money(2000);

            expect(cash.getAmount()).toEqual(2000);
        });

        it("Must be possible to create Money with explicit currency", () => {
            const cash = new Money(50, Currency.AMERICAN_DOLLAR);

            expect(cash.getAmount()).toEqual(50);
            expect(cash.getCurrency()).toEqual(Currency.AMERICAN_DOLLAR);
        });

        it("Default currency must be COP", () => {
            const cash = new Money(1000);

            expect(cash.getCurrency()).toEqual(Currency.COLOMBIAN_PESO);
        });

        it("It's not possible to create a negative amount", () => {
            expect(() => new Money(-2000)).toThrow(AmountInvalidError);
        });

        it("Zero amount is valid", () => {
            const cash = new Money(0);

            expect(cash.getAmount()).toEqual(0);
        });
    });

    describe("Currency export", () => {
        it("Currency must be exported with USD and COP values", () => {
            expect(Currency.AMERICAN_DOLLAR).toEqual("USD");
            expect(Currency.COLOMBIAN_PESO).toEqual("COP");
        });
    });

    describe("equals", () => {
        it("Must return true for same amount and currency", () => {
            const a = new Money(1000);
            const b = new Money(1000);

            expect(a.equals(b)).toBe(true);
        });

        it("Must return false for different amount", () => {
            const a = new Money(1000);
            const b = new Money(2000);

            expect(a.equals(b)).toBe(false);
        });

        it("Must return false for different currency", () => {
            const a = new Money(1000, Currency.COLOMBIAN_PESO);
            const b = new Money(1000, Currency.AMERICAN_DOLLAR);

            expect(a.equals(b)).toBe(false);
        });
    });

    describe("add", () => {
        it("Must return a new Money with the summed amount", () => {
            const a = new Money(1000);
            const b = new Money(500);
            const result = a.add(b);

            expect(result.getAmount()).toEqual(1500);
            expect(result).not.toBe(a);
            expect(result).not.toBe(b);
        });

        it("Must not mutate the original Money", () => {
            const a = new Money(1000);
            const b = new Money(500);

            a.add(b);

            expect(a.getAmount()).toEqual(1000);
        });

        it("Must throw when currencies differ", () => {
            const a = new Money(1000, Currency.COLOMBIAN_PESO);
            const b = new Money(500, Currency.AMERICAN_DOLLAR);

            expect(() => a.add(b)).toThrow();
        });
    });

    describe("subtract", () => {
        it("Must return a new Money with the subtracted amount", () => {
            const a = new Money(1000);
            const b = new Money(300);
            const result = a.subtract(b);

            expect(result.getAmount()).toEqual(700);
            expect(result).not.toBe(a);
            expect(result).not.toBe(b);
        });

        it("Must not mutate the original Money", () => {
            const a = new Money(1000);
            const b = new Money(300);

            a.subtract(b);

            expect(a.getAmount()).toEqual(1000);
        });

        it("Must allow result of zero", () => {
            const a = new Money(500);
            const b = new Money(500);
            const result = a.subtract(b);

            expect(result.getAmount()).toEqual(0);
        });

        it("Must throw when currencies differ", () => {
            const a = new Money(1000, Currency.COLOMBIAN_PESO);
            const b = new Money(300, Currency.AMERICAN_DOLLAR);

            expect(() => a.subtract(b)).toThrow();
        });
    });

    describe("isGreaterThan", () => {
        it("Must return true when amount is greater", () => {
            const a = new Money(2000);
            const b = new Money(1000);

            expect(a.isGreaterThan(b)).toBe(true);
        });

        it("Must return false when amount is lesser", () => {
            const a = new Money(500);
            const b = new Money(1000);

            expect(a.isGreaterThan(b)).toBe(false);
        });

        it("Must return false when amounts are equal", () => {
            const a = new Money(1000);
            const b = new Money(1000);

            expect(a.isGreaterThan(b)).toBe(false);
        });
    });

    describe("isPositive", () => {
        it("Must return true for positive amount", () => {
            const cash = new Money(1000);

            expect(cash.isPositive()).toBe(true);
        });

        it("Must return false for zero", () => {
            const cash = new Money(0);

            expect(cash.isPositive()).toBe(false);
        });
    });

    describe("DomainError throwError", () => {
        it("throwError must return the error code string", () => {
            const error = new AmountInvalidError();

            expect(error.throwError()).toEqual("AMOUNT_INVALID_ERROR");
        });
    });
});
