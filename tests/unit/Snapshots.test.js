import { describe, expect, it, vi, afterEach } from "vitest";
import { AccountFactory } from "../../src/domain/aggregates/account/factories/AccountFactory.js";
import { AccountType } from "../../src/domain/aggregates/account/value-objects/AccountType.js";
import { SavingsAccount } from "../../src/domain/aggregates/account/entities/SavingsAccount.js";
import { CheckingAccount } from "../../src/domain/aggregates/account/entities/CheckingAccount.js";
import { CreditCard } from "../../src/domain/aggregates/account/entities/CreditCard.js";
import { User } from "../../src/domain/aggregates/user/entities/User.js";
import { UserRole } from "../../src/domain/aggregates/user/value-objects/UserRole.js";
import { InvalidAccountTypeError } from "../../src/domain/aggregates/account/errors/InvalidAccountTypeError.js";
import { AccountLockedError } from "../../src/domain/aggregates/user/errors/AccountLockedError.js";
import { ClientProfile } from "../../src/domain/aggregates/user/value-objects/ClientProfile.js";
import { Money } from "../../src/domain/shared/value-objects/Money.js";

const roundTrip = (account) =>
    AccountFactory.restore(JSON.parse(JSON.stringify(account.toSnapshot())));

describe("Account snapshots", () => {
    it("Must restore a savings account with its movements", () => {
        const account = new SavingsAccount(new Money(100000));
        account.depositFunds(new Money(5000));
        account.withdrawFunds(new Money(20000));

        const restored = roundTrip(account);

        expect(restored).toBeInstanceOf(SavingsAccount);
        expect(restored.getBalance().equals(new Money(86575))).toBe(true);
        expect(restored.getMovements().map((m) => m.getType())).toEqual([
            "DEPOSIT",
            "INTEREST",
            "WITHDRAW",
        ]);
        expect(restored.getMovements()[0].getDate()).toBeInstanceOf(Date);
        expect(restored.getMovements()[0].getDate().getTime()).toBe(
            account.getMovements()[0].getDate().getTime(),
        );
    });

    it("Must restore a checking account with overdraft in use", () => {
        const account = new CheckingAccount(new Money(1000000));
        account.withdrawFunds(new Money(1200000));

        const restored = roundTrip(account);

        expect(restored).toBeInstanceOf(CheckingAccount);
        expect(restored.getCreditUsed().equals(new Money(200000))).toBe(true);
        expect(restored.getBalance().equals(new Money(0))).toBe(true);
    });

    it("Must restore a credit card with debt and limit", () => {
        const card = new CreditCard(new Money(3000000));
        card.withdrawFunds(new Money(300000));

        const restored = roundTrip(card);

        expect(restored).toBeInstanceOf(CreditCard);
        expect(restored.getDebt().equals(new Money(306000))).toBe(true);
        expect(restored.creditLimit().equals(new Money(3000000))).toBe(true);
    });

    it("Must restore an account whose balance is zero", () => {
        const account = new CheckingAccount(new Money(100));
        account.withdrawFunds(new Money(100));

        expect(roundTrip(account).getBalance().equals(new Money(0))).toBe(true);
    });

    it("Must reject an unknown snapshot type", () => {
        expect(() => AccountFactory.restore({ type: "GOLD" })).toThrow(InvalidAccountTypeError);
    });

    it("Must expose the type in the snapshot", () => {
        expect(AccountFactory.create(AccountType.SAVINGS, 10).toSnapshot().type).toBe("SAVINGS");
    });
});

describe("User snapshots", () => {
    afterEach(() => vi.useRealTimers());

    it("Must restore a user with its account and role", () => {
        const account = new SavingsAccount(new Money(1000));
        const user = new User("ana", "pw", account, UserRole.CLIENTE);

        const restored = User.restore(JSON.parse(JSON.stringify(user.toSnapshot())), account);

        expect(restored.getName()).toBe("ana");
        expect(restored.getRole()).toBe(UserRole.CLIENTE);
        expect(restored.getAccount()).toBe(account);
        expect(restored.authenticate("pw")).toBe(true);
    });

    it("Must keep failed attempts and the lock after restoring", () => {
        vi.useFakeTimers();
        const account = new SavingsAccount(new Money(1000));
        const user = new User("ana", "pw", account);
        for (let i = 0; i < 3; i++) expect(() => user.authenticate("bad")).toThrow();

        const restored = User.restore(JSON.parse(JSON.stringify(user.toSnapshot())), account);

        expect(restored.isLocked()).toBe(true);
        expect(restored.getFailedAttempts()).toBe(3);
        expect(() => restored.authenticate("pw")).toThrow(AccountLockedError);
    });

    it("Must restore the identity profile of a client", () => {
        const account = new SavingsAccount(new Money(1000));
        const profile = new ClientProfile({
            fullName: "Ana Pérez",
            identificationType: "CEDULA",
            identificationNumber: "1020304050",
            phone: "3001234567",
        });
        const user = new User("ana", "pw", account, UserRole.CLIENTE, profile);

        const restored = User.restore(JSON.parse(JSON.stringify(user.toSnapshot())), account);

        expect(restored.getProfile().getFullName()).toBe("Ana Pérez");
        expect(restored.getProfile().getIdentification().key()).toBe("CEDULA:1020304050");
        expect(restored.getProfile().getPhone()).toBe("3001234567");
    });

    it("Must keep loading users saved before identity data existed", () => {
        const account = new SavingsAccount(new Money(1000));
        const { profile: _omitted, ...legacy } = new User("ana", "pw", account).toSnapshot();

        const restored = User.restore(JSON.parse(JSON.stringify(legacy)), account);

        expect(restored.getProfile()).toBeNull();
        expect(restored.authenticate("pw")).toBe(true);
    });

    it("Must save a user without profile with a null profile", () => {
        expect(new User("ana", "pw", new SavingsAccount(new Money(1000))).toSnapshot().profile).toBeNull();
    });
});
