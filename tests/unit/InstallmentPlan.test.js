import { describe, expect, it } from "vitest";
import { InstallmentPlan } from "../../src/domain/aggregates/account/value-objects/InstallmentPlan.js";
import { InvalidInstallmentsError } from "../../src/domain/aggregates/account/errors/InvalidInstallmentsError.js";
import { InstallmentsNotSupportedError } from "../../src/domain/aggregates/account/errors/InstallmentsNotSupportedError.js";
import { DomainError } from "../../src/domain/shared/errors/DomainError.js";
import { Money } from "../../src/domain/shared/value-objects/Money.js";

const quote = (capital, n) => {
    const plan = InstallmentPlan.quote(new Money(capital), n);
    return {
        rate: plan.rate,
        monthly: plan.monthlyPayment.getAmount(),
        total: plan.totalToPay.getAmount(),
        interest: plan.interest.getAmount(),
    };
};

describe("InstallmentPlan", () => {
    it("Must quote 1000000 in 6 installments", () => {
        expect(quote(1000000, 6)).toEqual({ rate: 0.019, monthly: 177924, total: 1067544, interest: 67544 });
    });

    it("Must quote 1000000 in 12 installments", () => {
        expect(quote(1000000, 12)).toEqual({ rate: 0.023, monthly: 96310, total: 1155720, interest: 155720 });
    });

    it("Must quote 600000 in 3 installments", () => {
        const plan = quote(600000, 3);

        expect(plan.monthly).toBe(207648);
        expect(plan.total).toBe(622944);
    });

    it("Must not charge interest in 1 or 2 installments", () => {
        expect(quote(1000000, 2)).toEqual({ rate: 0, monthly: 500000, total: 1000000, interest: 0 });
        expect(quote(1000000, 1)).toEqual({ rate: 0, monthly: 1000000, total: 1000000, interest: 0 });
    });

    it("Must keep the exact capital as total without interest when it is not divisible", () => {
        const plan = quote(100001, 2);

        expect(plan.total).toBe(100001);
        expect(plan.interest).toBe(0);
        expect(plan.monthly).toBe(50001);
    });

    it("Must pick the rate at every boundary of the term", () => {
        const rates = [1, 2, 3, 6, 7, 36].map((n) => quote(1000000, n).rate);

        expect(rates).toEqual([0, 0, 0.019, 0.019, 0.023, 0.023]);
    });

    it("Must reject terms that are not a whole number from 1 to 36", () => {
        for (const n of [0, -1, 2.5, 37, "6", NaN, undefined])
            expect(() => InstallmentPlan.quote(new Money(100000), n)).toThrow(InvalidInstallmentsError);
    });
});

describe("Installment errors", () => {
    it("Must be DomainErrors with their error codes", () => {
        const invalid = new InvalidInstallmentsError();
        const unsupported = new InstallmentsNotSupportedError();

        expect(invalid).toBeInstanceOf(DomainError);
        expect(invalid.name).toBe("InvalidInstallmentsError");
        expect(invalid.errorCode()).toBe("INVALID_INSTALLMENTS_ERROR");
        expect(new InvalidInstallmentsError("x").message).toBe("x");
        expect(unsupported).toBeInstanceOf(DomainError);
        expect(unsupported.name).toBe("InstallmentsNotSupportedError");
        expect(unsupported.errorCode()).toBe("INSTALLMENTS_NOT_SUPPORTED_ERROR");
        expect(new InstallmentsNotSupportedError("x").message).toBe("x");
    });
});
