import { describe, expect, it } from "vitest";
import { CreditCard } from "../../src/domain/aggregates/account/entities/CreditCard.js";
import { Account } from "../../src/domain/aggregates/account/entities/Account.js";
import { Money } from "../../src/domain/shared/value-objects/Money.js";
import { CreditLimitExceededError } from "../../src/domain/aggregates/account/errors/CreditLimitExceededError.js";
import { AccountInvalidAmountError } from "../../src/domain/aggregates/account/errors/AccountInvalidAmountError.js";
import { PaymentExceedsDebtError } from "../../src/domain/aggregates/account/errors/PaymentExceedsDebtError.js";
import { InvalidInstallmentsError } from "../../src/domain/aggregates/account/errors/InvalidInstallmentsError.js";
import { MonthlyStatementNotSupportedError } from "../../src/domain/aggregates/account/errors/MonthlyStatementNotSupportedError.js";
import { MovementType } from "../../src/domain/aggregates/account/entities/Movement.js";
import { AccountFactory } from "../../src/domain/aggregates/account/factories/AccountFactory.js";
import { AccountType } from "../../src/domain/aggregates/account/value-objects/AccountType.js";

describe("CreditCard", () => {
    it("Must inherit from Account and start without debt", () => {
        const card = new CreditCard();

        expect(card).toBeInstanceOf(Account);
        expect(card.accountType()).toBe(AccountType.CREDIT_CARD);
        expect(card.getDebt().equals(new Money(0))).toBe(true);
        expect(card.getAvailableCredit().equals(new Money(2000000))).toBe(true);
    });

    it("Must increase the debt on a purchase within the limit", () => {
        const card = new CreditCard(new Money(2000000));

        card.withdrawFunds(new Money(500000));

        expect(card.getDebt().equals(new Money(510000))).toBe(true);
        expect(card.getAvailableCredit().equals(new Money(1490000))).toBe(true);
    });

    it("Must reject a purchase above the limit", () => {
        const card = new CreditCard(new Money(2000000));
        card.withdrawFunds(new Money(1900000));

        expect(() => card.withdrawFunds(new Money(200000))).toThrow(
            CreditLimitExceededError,
        );
        expect(card.getDebt().equals(new Money(1938000))).toBe(true);
    });

    it("Must reduce the debt on a payment", () => {
        const card = new CreditCard();
        card.withdrawFunds(new Money(500000));

        card.depositFunds(new Money(200000));

        expect(card.getDebt().equals(new Money(310000))).toBe(true);
    });

    describe("payments", () => {
        const owing = (debt) => {
            const snapshot = {
                type: "CREDIT_CARD", currency: "COP", balance: 0, creditUsed: debt, limit: 2000000, movements: [],
            };
            return AccountFactory.restore(snapshot);
        };

        it("Must reject a payment above the debt leaving everything unchanged", () => {
            const card = owing(300000);

            expect(() => card.depositFunds(new Money(450000))).toThrow(PaymentExceedsDebtError);
            expect(card.getDebt().equals(new Money(300000))).toBe(true);
            expect(card.getBalance().equals(new Money(0))).toBe(true);
            expect(card.getMovements()).toEqual([]);
        });

        it("Must accept a payment equal to the debt", () => {
            const card = owing(300000);

            card.depositFunds(new Money(300000));

            expect(card.getDebt().equals(new Money(0))).toBe(true);
            expect(card.getBalance().equals(new Money(0))).toBe(true);
        });

        it("Must accept a partial payment", () => {
            const card = owing(300000);

            card.depositFunds(new Money(100000));

            expect(card.getDebt().equals(new Money(200000))).toBe(true);
        });

        it("Must reject any payment when there is no debt", () => {
            const card = new CreditCard();

            expect(() => card.depositFunds(new Money(1000))).toThrow(PaymentExceedsDebtError);
            expect(card.getMovements()).toEqual([]);
        });

        it("Must still reject invalid amounts with the invalid amount error", () => {
            expect(() => owing(1000).depositFunds(new Money(0))).toThrow(AccountInvalidAmountError);
        });

        it("Must tell beforehand whether a deposit would be rejected", () => {
            const card = owing(300000);

            expect(() => card.assertCanDeposit(new Money(450000))).toThrow(PaymentExceedsDebtError);
            expect(() => card.assertCanDeposit(new Money(300000))).not.toThrow();
            expect(card.getDebt().equals(new Money(300000))).toBe(true);
        });
    });

    describe("withdrawal interest", () => {
        it("Must charge 2% and record the interest before the withdrawal", () => {
            const card = new CreditCard(new Money(2000000));

            card.withdrawFunds(new Money(300000));

            expect(card.getDebt().equals(new Money(306000))).toBe(true);
            expect(card.getAvailableCredit().equals(new Money(1694000))).toBe(true);
            expect(card.getMovements().map((m) => [m.getType(), m.getAmount().getAmount()])).toEqual([
                [MovementType.INTEREST, 6000],
                [MovementType.WITHDRAW, 300000],
            ]);
        });

        it("Must reject an amount whose interest does not fit leaving no interest behind", () => {
            const card = new CreditCard(new Money(2000000));

            expect(() => card.withdrawFunds(new Money(1980000))).toThrow(CreditLimitExceededError);
            expect(card.getDebt().equals(new Money(0))).toBe(true);
            expect(card.getMovements()).toEqual([]);
        });

        it("Must accept an amount plus interest exactly at the limit", () => {
            const card = new CreditCard(new Money(2000000));

            card.withdrawFunds(new Money(1960784));

            expect(card.getDebt().equals(new Money(2000000))).toBe(true);
            expect(card.getMovements()[0].getAmount().getAmount()).toBe(39216);
        });

        it("Must reject one peso above the limit", () => {
            const card = new CreditCard(new Money(2000000));

            expect(() => card.withdrawFunds(new Money(1960785))).toThrow(CreditLimitExceededError);
        });

        it("Must allow paying everything that was owed after a withdrawal", () => {
            const card = new CreditCard();
            card.withdrawFunds(new Money(300000));

            card.depositFunds(new Money(306000));

            expect(card.getDebt().equals(new Money(0))).toBe(true);
        });

        it("Must charge the interest on a transfer sent as well", () => {
            const card = new CreditCard();

            card.withdrawFunds(new Money(300000), MovementType.TRANSFER_OUT);

            expect(card.getMovements().map((m) => m.getType())).toEqual([MovementType.INTEREST, MovementType.TRANSFER_OUT]);
        });
    });

    describe("legacy credit balance", () => {
        it("Must show a credit balance left from before payments were limited", () => {
            const card = AccountFactory.restore({
                type: "CREDIT_CARD", currency: "COP", balance: 150000, creditUsed: 0, limit: 2000000, movements: [],
            });

            expect(card.describe()).toContain("Saldo a favor");
            expect(card.describe()).toContain("150.000");
        });

        it("Must not mention a credit balance when there is none", () => {
            expect(new CreditCard().describe()).not.toContain("Saldo a favor");
        });
    });

    it("Must reject invalid amounts", () => {
        const card = new CreditCard();

        expect(() => card.depositFunds(new Money(0))).toThrow(AccountInvalidAmountError);
        expect(() => card.withdrawFunds(500)).toThrow(AccountInvalidAmountError);
    });

    it("Must not support a monthly statement and must not accrue interest by itself", () => {
        const card = new CreditCard();
        card.withdrawFunds(new Money(500000));

        expect(card.supportsMonthlyStatement()).toBe(false);
        expect(() => card.monthlyStatement()).toThrow(MonthlyStatementNotSupportedError);
        expect(card.getDebt().equals(new Money(510000))).toBe(true);
        expect(card.getMovements().length).toBe(2);
    });

    describe("installment purchases", () => {
        it("Must support installments", () => {
            expect(new CreditCard().supportsInstallments()).toBe(true);
        });

        it("Must add the capital plus the interest of the term to the debt", () => {
            const card = new CreditCard(new Money(2000000));

            const plan = card.purchaseInInstallments(new Money(1000000), 6);

            expect(plan.monthlyPayment.equals(new Money(177924))).toBe(true);
            expect(card.getDebt().equals(new Money(1067544))).toBe(true);
            expect(card.getAvailableCredit().equals(new Money(932456))).toBe(true);
        });

        it("Must record a purchase movement with the installment data", () => {
            const card = new CreditCard(new Money(2000000));
            card.purchaseInInstallments(new Money(1000000), 6);

            const [movement] = card.getMovements();

            expect(movement.getType()).toBe(MovementType.INSTALLMENT_PURCHASE);
            expect(movement.getAmount().equals(new Money(1000000))).toBe(true);
            expect(movement.getInstallments().count).toBe(6);
            expect(movement.getInstallments().monthlyPayment.equals(new Money(177924))).toBe(true);
            expect(movement.getInstallments().totalToPay.equals(new Money(1067544))).toBe(true);
        });

        it("Must not attach installment data to withdrawals and deposits", () => {
            const card = new CreditCard();
            card.withdrawFunds(new Money(1000));
            card.depositFunds(new Money(500));

            expect(card.getMovements().map((m) => m.getInstallments())).toEqual([null, null, null]);
        });

        it("Must reject a purchase whose total exceeds the available credit and leave the debt unchanged", () => {
            const card = new CreditCard(new Money(2000000));

            expect(() => card.purchaseInInstallments(new Money(1900000), 12)).toThrow(CreditLimitExceededError);
            expect(card.getDebt().equals(new Money(0))).toBe(true);
            expect(card.getMovements()).toEqual([]);
        });

        it("Must accept a purchase that fits only without interest", () => {
            const card = new CreditCard(new Money(2000000));

            card.purchaseInInstallments(new Money(2000000), 2);

            expect(card.getDebt().equals(new Money(2000000))).toBe(true);
        });

        it("Must let payments reduce the debt", () => {
            const card = new CreditCard(new Money(2000000));
            card.purchaseInInstallments(new Money(1000000), 6);

            card.depositFunds(new Money(177924));

            expect(card.getDebt().equals(new Money(889620))).toBe(true);
        });

        it("Must reject invalid amounts and terms without changes", () => {
            const card = new CreditCard();

            expect(() => card.purchaseInInstallments(new Money(0), 3)).toThrow(AccountInvalidAmountError);
            expect(() => card.purchaseInInstallments(500, 3)).toThrow(AccountInvalidAmountError);
            for (const n of [0, 37, 2.5])
                expect(() => card.purchaseInInstallments(new Money(100000), n)).toThrow(InvalidInstallmentsError);
            expect(card.getDebt().equals(new Money(0))).toBe(true);
        });

        it("Must restore an installment purchase from a snapshot and still load old snapshots", () => {
            const card = new CreditCard(new Money(2000000));
            card.purchaseInInstallments(new Money(1000000), 6);
            card.withdrawFunds(new Money(1000));

            const restored = AccountFactory.restore(JSON.parse(JSON.stringify(card.toSnapshot())));
            const [purchase, , withdrawal] = restored.getMovements();

            expect(purchase.getInstallments().count).toBe(6);
            expect(purchase.getInstallments().monthlyPayment.equals(new Money(177924))).toBe(true);
            expect(purchase.getInstallments().totalToPay.equals(new Money(1067544))).toBe(true);
            expect(purchase.getDate()).toBeInstanceOf(Date);
            expect(withdrawal.getInstallments()).toBeNull();
            expect(restored.getDebt().equals(new Money(1068564))).toBe(true);

            const old = { ...card.toSnapshot(), movements: [{ type: "WITHDRAW", amount: 5, date: new Date().toISOString() }] };
            expect(AccountFactory.restore(old).getMovements()[0].getInstallments()).toBeNull();
        });
    });

    it("Must describe debt and available credit", () => {
        const description = new CreditCard().describe();

        expect(description).toContain("Deuda");
        expect(description).toContain("Cupo disponible");
    });
});

describe("CreditCard open position", () => {
    it("Must have no open position without debt", () => {
        expect(new CreditCard().hasOpenPosition()).toBe(false);
    });

    it("Must have an open position while there is debt", () => {
        const card = new CreditCard();
        card.withdrawFunds(new Money(300000));

        expect(card.hasOpenPosition()).toBe(true);
    });

    it("Must have an open position when it holds a credit balance", () => {
        const card = AccountFactory.restore({
            type: "CREDIT_CARD", currency: "COP", balance: 1000, creditUsed: 0, limit: 2000000, movements: [],
        });

        expect(card.hasOpenPosition()).toBe(true);
    });
});
