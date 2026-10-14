import { describe, expect, it } from "vitest";
import { SavingsAccount } from "../../src/domain/aggregates/account/entities/SavingsAccount.js";
import { CheckingAccount } from "../../src/domain/aggregates/account/entities/CheckingAccount.js";
import { CreditCard } from "../../src/domain/aggregates/account/entities/CreditCard.js";
import { MovementType } from "../../src/domain/aggregates/account/entities/Movement.js";
import { AccountFactory } from "../../src/domain/aggregates/account/factories/AccountFactory.js";
import { SameAccountTransferError } from "../../src/domain/aggregates/account/errors/SameAccountTransferError.js";
import { DomainError } from "../../src/domain/shared/errors/DomainError.js";
import { Money } from "../../src/domain/shared/value-objects/Money.js";

const types = (account) => account.getMovements().map((m) => m.getType());

describe("Movement type on withdraw and deposit", () => {
    it("Must keep WITHDRAW and DEPOSIT when no type is given", () => {
        for (const account of [new SavingsAccount(new Money(100000)), new CheckingAccount(new Money(100000)), new CreditCard()]) {
            account.withdrawFunds(new Money(2000));
            account.depositFunds(new Money(1000));
            account.withdrawFunds(new Money(1000));

            expect(types(account)).toContain(MovementType.DEPOSIT);
            expect(types(account)).toContain(MovementType.WITHDRAW);
        }
    });

    it("Must record the given movement type in every product", () => {
        const savings = new SavingsAccount(new Money(100000));
        const checking = new CheckingAccount(new Money(100000));
        const card = new CreditCard();

        savings.withdrawFunds(new Money(10000), MovementType.TRANSFER_OUT);
        checking.withdrawFunds(new Money(10000), MovementType.TRANSFER_OUT);
        card.withdrawFunds(new Money(10000), MovementType.TRANSFER_OUT);
        savings.depositFunds(new Money(5000), MovementType.TRANSFER_IN);

        expect(types(savings)).toEqual([MovementType.INTEREST, MovementType.TRANSFER_OUT, MovementType.TRANSFER_IN]);
        expect(types(checking)).toEqual([MovementType.TRANSFER_OUT]);
        expect(types(card)).toEqual([MovementType.INTEREST, MovementType.TRANSFER_OUT]);
    });

    it("Must restore transfer movements from a snapshot", () => {
        const account = new SavingsAccount(new Money(100000));
        account.withdrawFunds(new Money(10000), MovementType.TRANSFER_OUT);
        account.depositFunds(new Money(5000), MovementType.TRANSFER_IN);

        const restored = AccountFactory.restore(JSON.parse(JSON.stringify(account.toSnapshot())));

        expect(types(restored)).toEqual([MovementType.INTEREST, MovementType.TRANSFER_OUT, MovementType.TRANSFER_IN]);
    });
});

describe("SameAccountTransferError", () => {
    it("Must be a DomainError with its error code", () => {
        const error = new SameAccountTransferError();

        expect(error).toBeInstanceOf(DomainError);
        expect(error.name).toBe("SameAccountTransferError");
        expect(error.errorCode()).toBe("SAME_ACCOUNT_TRANSFER_ERROR");
        expect(new SameAccountTransferError("x").message).toBe("x");
    });
});
