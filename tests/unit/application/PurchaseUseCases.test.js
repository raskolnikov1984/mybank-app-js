import { describe, expect, it, beforeEach } from "vitest";
import { PurchaseUseCase } from "../../../src/application/use-cases/PurchaseUseCase.js";
import { QuoteInstallmentsUseCase } from "../../../src/application/use-cases/QuoteInstallmentsUseCase.js";
import { SavingsAccount } from "../../../src/domain/aggregates/account/entities/SavingsAccount.js";
import { CheckingAccount } from "../../../src/domain/aggregates/account/entities/CheckingAccount.js";
import { CreditCard } from "../../../src/domain/aggregates/account/entities/CreditCard.js";
import { AccountInvalidAmountError } from "../../../src/domain/aggregates/account/errors/AccountInvalidAmountError.js";
import { CreditLimitExceededError } from "../../../src/domain/aggregates/account/errors/CreditLimitExceededError.js";
import { InstallmentsNotSupportedError } from "../../../src/domain/aggregates/account/errors/InstallmentsNotSupportedError.js";
import { InvalidInstallmentsError } from "../../../src/domain/aggregates/account/errors/InvalidInstallmentsError.js";
import { AmountInvalidError } from "../../../src/domain/shared/errors/AmountInvalidError.js";
import { Money } from "../../../src/domain/shared/value-objects/Money.js";
import { MockAccountRepository } from "./mockRepositories.js";

describe("PurchaseUseCase", () => {
    let accounts;
    let purchase;

    beforeEach(() => {
        accounts = new MockAccountRepository();
        purchase = new PurchaseUseCase(accounts);
        accounts.save("ana", new CreditCard(new Money(2000000)));
    });

    it("Must report the whole purchase result", () => {
        const result = purchase.execute({ accountId: "ana", amount: 1000000, installments: 6 });

        expect(result.purchase.amount.getAmount()).toBe(1000000);
        expect(result.purchase.installments).toBe(6);
        expect(result.purchase.rate).toBe(0.019);
        expect(result.purchase.monthlyPayment.getAmount()).toBe(177924);
        expect(result.purchase.totalToPay.getAmount()).toBe(1067544);
        expect(result.purchase.interest.getAmount()).toBe(67544);
        expect(result.debt.getAmount()).toBe(1067544);
        expect(result.availableCredit.getAmount()).toBe(932456);
    });

    it("Must persist the debt and the purchase movement", () => {
        purchase.execute({ accountId: "ana", amount: 1000000, installments: 6 });

        const card = accounts.findById("ana");
        expect(card.getDebt().getAmount()).toBe(1067544);
        expect(card.getMovements()[0].getInstallments().monthlyPayment.getAmount()).toBe(177924);
    });

    it("Must reject an unknown client", () => {
        expect(() => purchase.execute({ accountId: "nadie", amount: 1000, installments: 3 })).toThrow(
            AccountInvalidAmountError,
        );
    });

    it("Must reject products without installments leaving them unchanged", () => {
        const savings = new SavingsAccount(new Money(100000));
        accounts.save("saver", savings);
        accounts.save("payer", new CheckingAccount(new Money(100000)));

        expect(() => purchase.execute({ accountId: "saver", amount: 1000, installments: 3 })).toThrow(
            InstallmentsNotSupportedError,
        );
        expect(() => purchase.execute({ accountId: "payer", amount: 1000, installments: 3 })).toThrow(
            InstallmentsNotSupportedError,
        );
        expect(savings.getBalance().getAmount()).toBe(100000);
        expect(savings.getMovements()).toEqual([]);
    });

    it("Must reject invalid amounts and terms", () => {
        for (const amount of [0, -5, "10", NaN, undefined])
            expect(() => purchase.execute({ accountId: "ana", amount, installments: 3 })).toThrow(AmountInvalidError);
        for (const installments of [0, -1, 2.5, 37, undefined])
            expect(() => purchase.execute({ accountId: "ana", amount: 1000, installments })).toThrow(
                InvalidInstallmentsError,
            );

        expect(accounts.findById("ana").getDebt().getAmount()).toBe(0);
    });

    it("Must reject a total above the available credit leaving the debt unchanged", () => {
        expect(() => purchase.execute({ accountId: "ana", amount: 1900000, installments: 12 })).toThrow(
            CreditLimitExceededError,
        );
        expect(accounts.findById("ana").getDebt().getAmount()).toBe(0);
    });
});

describe("QuoteInstallmentsUseCase", () => {
    it("Must quote without touching any account", () => {
        const accounts = new MockAccountRepository();
        const card = new CreditCard(new Money(2000000));
        accounts.save("ana", card);

        const plan = new QuoteInstallmentsUseCase().execute({ amount: 1000000, installments: 6 });

        expect(plan.rate).toBe(0.019);
        expect(plan.monthlyPayment.getAmount()).toBe(177924);
        expect(plan.totalToPay.getAmount()).toBe(1067544);
        expect(card.getDebt().getAmount()).toBe(0);
        expect(card.getMovements()).toEqual([]);
    });

    it("Must reject invalid values", () => {
        expect(() => new QuoteInstallmentsUseCase().execute({ amount: 0, installments: 6 })).toThrow(AmountInvalidError);
        expect(() => new QuoteInstallmentsUseCase().execute({ amount: 1000, installments: 40 })).toThrow(
            InvalidInstallmentsError,
        );
    });
});
