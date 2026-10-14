import { describe, expect, it, beforeEach } from "vitest";
import { TransferUseCase } from "../../../src/application/use-cases/TransferUseCase.js";
import { ListTransferRecipientsUseCase } from "../../../src/application/use-cases/ListTransferRecipientsUseCase.js";
import { RegisterUserUseCase } from "../../../src/application/use-cases/RegisterUserUseCase.js";
import { CreateManagerUseCase } from "../../../src/application/use-cases/CreateManagerUseCase.js";
import { LoginUseCase } from "../../../src/application/use-cases/LoginUseCase.js";
import { SameAccountTransferError } from "../../../src/domain/aggregates/account/errors/SameAccountTransferError.js";
import { AccountInvalidAmountError } from "../../../src/domain/aggregates/account/errors/AccountInvalidAmountError.js";
import { AccountNotEnoughtFundsError } from "../../../src/domain/aggregates/account/errors/AccountNotEnoughtFundsError.js";
import { PaymentExceedsDebtError } from "../../../src/domain/aggregates/account/errors/PaymentExceedsDebtError.js";
import { AmountInvalidError } from "../../../src/domain/shared/errors/AmountInvalidError.js";
import { Money } from "../../../src/domain/shared/value-objects/Money.js";
import { MockUserRepository, MockAccountRepository } from "./mockRepositories.js";
import { withIdentity } from "./clientData.js";

describe("Transfers", () => {
    let users;
    let accounts;
    let register;
    let transfer;

    const balanceOf = (name) => accounts.findById(name).getBalance().getAmount();
    const debtOf = (name) => accounts.findById(name).getCreditUsed().getAmount();
    const typesOf = (name) => accounts.findById(name).getMovements().map((m) => m.getType());

    beforeEach(() => {
        users = new MockUserRepository();
        accounts = new MockAccountRepository();
        register = new RegisterUserUseCase(users, accounts);
        transfer = new TransferUseCase(users, accounts);
        new CreateManagerUseCase(users, accounts).execute();
        register.execute(withIdentity({ name: "ana", password: "pw", initialBalance: 500000, accountType: "SAVINGS" }));
        register.execute(withIdentity({ name: "luis", password: "pw", initialBalance: 200000, accountType: "SAVINGS" }));
    });

    describe("TransferUseCase", () => {
        it("Must move the amount between savings accounts charging the withdrawal interest", () => {
            transfer.execute({ fromAccountId: "ana", toAccountId: "luis", amount: 100000 });

            expect(balanceOf("luis")).toBe(300000);
            expect(balanceOf("ana")).toBe(500000 + 7500 - 100000);
        });

        it("Must record the transfer in both histories", () => {
            transfer.execute({ fromAccountId: "ana", toAccountId: "luis", amount: 100000 });

            expect(typesOf("ana")).toEqual(["INTEREST", "TRANSFER_OUT"]);
            expect(typesOf("luis")).toEqual(["TRANSFER_IN"]);
        });

        it("Must pay the debt of a credit card recipient", () => {
            register.execute(withIdentity({ name: "tarjeta", password: "pw", accountType: "CREDIT_CARD" }));
            accounts.findById("tarjeta").withdrawFunds(new Money(500000));

            transfer.execute({ fromAccountId: "ana", toAccountId: "tarjeta", amount: 100000 });

            expect(debtOf("tarjeta")).toBe(410000);
        });

        it("Must use the available credit when the sender is a credit card", () => {
            register.execute(withIdentity({ name: "tarjeta", password: "pw", accountType: "CREDIT_CARD" }));

            transfer.execute({ fromAccountId: "tarjeta", toAccountId: "luis", amount: 300000 });

            expect(debtOf("tarjeta")).toBe(306000);
            expect(balanceOf("luis")).toBe(500000);
            expect(typesOf("tarjeta")).toEqual(["INTEREST", "TRANSFER_OUT"]);
        });

        it("Must reject a transfer above the debt of a credit card recipient leaving both accounts unchanged", () => {
            register.execute(withIdentity({ name: "tarjeta", password: "pw", accountType: "CREDIT_CARD" }));
            accounts.findById("tarjeta").withdrawFunds(new Money(294118)); // debt 300000 with its interest

            expect(() => transfer.execute({ fromAccountId: "ana", toAccountId: "tarjeta", amount: 450000 })).toThrow(
                PaymentExceedsDebtError,
            );

            expect(debtOf("tarjeta")).toBe(300000);
            expect(balanceOf("ana")).toBe(500000);
            expect(typesOf("ana")).toEqual([]);
        });

        it("Must reject a transfer to a credit card without debt", () => {
            register.execute(withIdentity({ name: "tarjeta", password: "pw", accountType: "CREDIT_CARD" }));

            expect(() => transfer.execute({ fromAccountId: "ana", toAccountId: "tarjeta", amount: 1000 })).toThrow(
                PaymentExceedsDebtError,
            );

            expect(balanceOf("ana")).toBe(500000);
        });

        it("Must reject insufficient funds leaving both accounts unchanged", () => {
            expect(() => transfer.execute({ fromAccountId: "ana", toAccountId: "luis", amount: 9000000 })).toThrow(
                AccountNotEnoughtFundsError,
            );

            expect(balanceOf("ana")).toBe(500000);
            expect(balanceOf("luis")).toBe(200000);
            expect(typesOf("ana")).toEqual([]);
            expect(typesOf("luis")).toEqual([]);
        });

        it("Must reject invalid amounts", () => {
            for (const amount of [0, -5, "10", NaN, undefined])
                expect(() => transfer.execute({ fromAccountId: "ana", toAccountId: "luis", amount })).toThrow(
                    AmountInvalidError,
                );

            expect(balanceOf("ana")).toBe(500000);
        });

        it("Must reject a transfer to the same account", () => {
            expect(() => transfer.execute({ fromAccountId: "ana", toAccountId: "ana", amount: 1000 })).toThrow(
                SameAccountTransferError,
            );

            expect(balanceOf("ana")).toBe(500000);
        });

        it("Must reject an unknown recipient", () => {
            expect(() => transfer.execute({ fromAccountId: "ana", toAccountId: "nadie", amount: 1000 })).toThrow(
                AccountInvalidAmountError,
            );

            expect(balanceOf("ana")).toBe(500000);
        });

        it("Must reject the manager as recipient", () => {
            const before = balanceOf("gerente");

            expect(() => transfer.execute({ fromAccountId: "ana", toAccountId: "gerente", amount: 1000 })).toThrow(
                AccountInvalidAmountError,
            );

            expect(balanceOf("ana")).toBe(500000);
            expect(balanceOf("gerente")).toBe(before);
        });

        it("Must reject an unknown sender", () => {
            expect(() => transfer.execute({ fromAccountId: "nadie", toAccountId: "luis", amount: 1000 })).toThrow(
                AccountInvalidAmountError,
            );

            expect(balanceOf("luis")).toBe(200000);
        });

        it("Must allow a locked recipient", () => {
            const login = new LoginUseCase(users);
            for (let i = 0; i < 3; i++) {
                try {
                    login.execute({ name: "luis", password: "mal" });
                } catch {
                    // expected failed attempts
                }
            }
            expect(users.findByName("luis").isLocked()).toBe(true);

            transfer.execute({ fromAccountId: "ana", toAccountId: "luis", amount: 1000 });

            expect(balanceOf("luis")).toBe(201000);
        });
    });

    describe("ListTransferRecipientsUseCase", () => {
        it("Must list the other clients by name without the sender and the manager", () => {
            register.execute(withIdentity({ name: "maria", password: "pw", initialBalance: 1000, accountType: "CHECKING" }));

            const { recipients } = new ListTransferRecipientsUseCase(users).execute({ name: "ana" });

            expect(recipients.map((r) => r.name)).toEqual(["luis", "maria"]);
            expect(recipients[1].type).toBe("CHECKING");
            expect(recipients[1].fullName).toBe("Persona de Prueba");
        });

        it("Must be empty when the sender is the only client", () => {
            users.delete("luis");

            expect(new ListTransferRecipientsUseCase(users).execute({ name: "ana" }).recipients).toEqual([]);
        });

        it("Must not expose balances, debts or movements", () => {
            const [recipient] = new ListTransferRecipientsUseCase(users).execute({ name: "ana" }).recipients;

            expect(Object.keys(recipient).sort()).toEqual(["fullName", "name", "type", "typeName"]);
        });
    });
});
