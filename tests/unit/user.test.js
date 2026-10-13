import { describe, expect, it, vi, afterEach } from "vitest";
import { User } from "../../src/domain/aggregates/user/entities/User.js";
import { Account } from "../../src/domain/aggregates/account/entities/Account.js";
import { SavingsAccount } from "../../src/domain/aggregates/account/entities/SavingsAccount.js";
import { Money } from "../../src/domain/shared/value-objects/Money.js";
import { InvalidCredentialsError } from "../../src/domain/aggregates/user/errors/InvalidCredentialsError.js";
import { AccountLockedError } from "../../src/domain/aggregates/user/errors/AccountLockedError.js";
import { UserNameRequiredError } from "../../src/domain/aggregates/user/errors/UserNameRequiredError.js";
import { UserPasswordRequiredError } from "../../src/domain/aggregates/user/errors/UserPasswordRequiredError.js";
import { InvalidAccountError } from "../../src/domain/aggregates/user/errors/InvalidAccountError.js";
import { ClientProfile } from "../../src/domain/aggregates/user/value-objects/ClientProfile.js";
import { InvalidIdentificationError } from "../../src/domain/aggregates/user/errors/InvalidIdentificationError.js";
import { UserRole } from "../../src/domain/aggregates/user/value-objects/UserRole.js";

const LOCK_DURATION_MS = 24 * 60 * 60 * 1000;

describe("User", () => {
    afterEach(() => {
        vi.useRealTimers();
    });
    it("Must be possible to create a user with name, password and account", () => {
        const account = new SavingsAccount(new Money(100000));
        const user = new User("John", "secret123", account);

        expect(user).toBeInstanceOf(User);
        expect(user.getName()).toBe("John");
        expect(user.getAccount()).toBeInstanceOf(Account);
    });

    it("Must be possible to authenticate with correct password", () => {
        const account = new SavingsAccount(new Money(100000));
        const user = new User("John", "secret123", account);

        expect(user.authenticate("secret123")).toBe(true);
    });

    it("Must throw InvalidCredentialsError with wrong password", () => {
        const account = new SavingsAccount(new Money(100000));
        const user = new User("John", "secret123", account);

        expect(() => user.authenticate("wrong")).toThrow(InvalidCredentialsError);
    });

    it("Must allow 2 failed attempts without locking", () => {
        const account = new SavingsAccount(new Money(100000));
        const user = new User("John", "secret123", account);

        expect(() => user.authenticate("wrong1")).toThrow(InvalidCredentialsError);
        expect(() => user.authenticate("wrong2")).toThrow(InvalidCredentialsError);
        expect(user.isLocked()).toBe(false);
    });

    it("Must lock account after 3 failed attempts", () => {
        const account = new SavingsAccount(new Money(100000));
        const user = new User("John", "secret123", account);

        expect(() => user.authenticate("wrong1")).toThrow(InvalidCredentialsError);
        expect(() => user.authenticate("wrong2")).toThrow(InvalidCredentialsError);
        expect(() => user.authenticate("wrong3")).toThrow(InvalidCredentialsError);
        expect(user.isLocked()).toBe(true);
    });

    it("After lock, authentication must throw AccountLockedError", () => {
        const account = new SavingsAccount(new Money(100000));
        const user = new User("John", "secret123", account);

        expect(() => user.authenticate("wrong1")).toThrow(InvalidCredentialsError);
        expect(() => user.authenticate("wrong2")).toThrow(InvalidCredentialsError);
        expect(() => user.authenticate("wrong3")).toThrow(InvalidCredentialsError);

        expect(() => user.authenticate("secret123")).toThrow(AccountLockedError);
    });

    it("Successful authentication resets failed attempts", () => {
        const account = new SavingsAccount(new Money(100000));
        const user = new User("John", "secret123", account);

        expect(() => user.authenticate("wrong1")).toThrow(InvalidCredentialsError);
        expect(user.authenticate("secret123")).toBe(true);
        expect(() => user.authenticate("wrong1")).toThrow(InvalidCredentialsError);

        expect(user.isLocked()).toBe(false);
    });

    it("Cannot create user with empty name", () => {
        const account = new SavingsAccount(new Money(100000));

        expect(() => new User("", "secret123", account)).toThrow(UserNameRequiredError);
    });

    it("Cannot create user with empty password", () => {
        const account = new SavingsAccount(new Money(100000));

        expect(() => new User("John", "", account)).toThrow(UserPasswordRequiredError);
    });

    it("Cannot create user without an Account instance", () => {
        expect(() => new User("John", "secret123", "notAnAccount")).toThrow(InvalidAccountError);
    });

    it("Must create a client by default when role is not provided", () => {
        const account = new SavingsAccount(new Money(100000));
        const user = new User("John", "secret123", account);

        expect(user.getRole()).toBe(UserRole.CLIENTE);
    });

    it("Must be possible to create a user with GERENTE role", () => {
        const account = new SavingsAccount(new Money(1));
        const user = new User("gerente", "admin", account, UserRole.GERENTE);

        expect(user.getRole()).toBe(UserRole.GERENTE);
    });

    it("Must unlock the account after 24 hours", () => {
        vi.useFakeTimers();
        const account = new SavingsAccount(new Money(100000));
        const user = new User("John", "secret123", account);

        expect(() => user.authenticate("wrong1")).toThrow(InvalidCredentialsError);
        expect(() => user.authenticate("wrong2")).toThrow(InvalidCredentialsError);
        expect(() => user.authenticate("wrong3")).toThrow(InvalidCredentialsError);
        expect(user.isLocked()).toBe(true);

        expect(() => user.authenticate("secret123")).toThrow(AccountLockedError);

        vi.advanceTimersByTime(LOCK_DURATION_MS);

        expect(user.authenticate("secret123")).toBe(true);
        expect(user.isLocked()).toBe(false);
    });

    it("Failed attempts reset after automatic unlock", () => {
        vi.useFakeTimers();
        const account = new SavingsAccount(new Money(100000));
        const user = new User("John", "secret123", account);

        expect(() => user.authenticate("wrong1")).toThrow(InvalidCredentialsError);
        expect(() => user.authenticate("wrong2")).toThrow(InvalidCredentialsError);
        expect(() => user.authenticate("wrong3")).toThrow(InvalidCredentialsError);

        vi.advanceTimersByTime(LOCK_DURATION_MS);

        expect(user.authenticate("secret123")).toBe(true);
        expect(user.getFailedAttempts()).toBe(0);

        expect(() => user.authenticate("wrong1")).toThrow(InvalidCredentialsError);
        expect(user.isLocked()).toBe(false);
    });

    it("Must change the password and keep name, account and role", () => {
        const account = new SavingsAccount(new Money(100000));
        const user = new User("John", "secret123", account);

        user.changePassword("nueva123");

        expect(user.authenticate("nueva123")).toBe(true);
        expect(() => user.authenticate("secret123")).toThrow(InvalidCredentialsError);
        expect(user.getName()).toBe("John");
        expect(user.getAccount()).toBe(account);
        expect(user.getRole()).toBe(UserRole.CLIENTE);
    });

    it("Must reject an empty new password and keep the old one", () => {
        const user = new User("John", "secret123", new SavingsAccount(new Money(100000)));

        expect(() => user.changePassword("")).toThrow(UserPasswordRequiredError);
        expect(() => user.changePassword("   ")).toThrow(UserPasswordRequiredError);
        expect(user.authenticate("secret123")).toBe(true);
    });

    it("Must unlock a locked user and clear the failed attempts", () => {
        const user = new User("John", "secret123", new SavingsAccount(new Money(100000)));
        for (let i = 0; i < 3; i++) expect(() => user.authenticate("bad")).toThrow();
        expect(user.isLocked()).toBe(true);

        user.unlock();

        expect(user.isLocked()).toBe(false);
        expect(user.getFailedAttempts()).toBe(0);
        expect(user.authenticate("secret123")).toBe(true);
    });

    it("Must keep a user that is not locked unchanged when unlocking", () => {
        const user = new User("John", "secret123", new SavingsAccount(new Money(100000)));

        user.unlock();

        expect(user.isLocked()).toBe(false);
        expect(user.getFailedAttempts()).toBe(0);
    });

    it("Must keep the identity profile of a client", () => {
        const profile = new ClientProfile({
            fullName: "Ana Pérez",
            identificationType: "PASSPORT",
            identificationNumber: "ab123456",
            phone: "300 123 4567",
        });
        const user = new User("ana", "pw", new SavingsAccount(new Money(1000)), UserRole.CLIENTE, profile);

        expect(user.getProfile()).toBe(profile);
        expect(user.getProfile().getIdentification().getNumber()).toBe("AB123456");
    });

    it("Must work without a profile like the manager and older clients", () => {
        const user = new User("ana", "pw", new SavingsAccount(new Money(1000)));

        expect(user.getProfile()).toBeNull();
        expect(user.authenticate("pw")).toBe(true);
    });

    it("Must reject a profile that is not a ClientProfile", () => {
        for (const bad of [{}, "Ana", { fullName: "Ana" }, 5])
            expect(() => new User("ana", "pw", new SavingsAccount(new Money(1000)), UserRole.CLIENTE, bad)).toThrow(
                InvalidIdentificationError,
            );
    });

    describe("login status", () => {
        it("Must report 3 of 3 attempts for a user without failures", () => {
            const user = new User("John", "secret123", new SavingsAccount(new Money(1000)));

            expect(user.getLoginStatus()).toEqual({ maxAttempts: 3, remainingAttempts: 3, isLocked: false });
        });

        it("Must lose one remaining attempt per failure and show 0 and locked at the third", () => {
            const user = new User("John", "secret123", new SavingsAccount(new Money(1000)));

            expect(() => user.authenticate("bad")).toThrow();
            expect(user.getLoginStatus().remainingAttempts).toBe(2);
            expect(() => user.authenticate("bad")).toThrow();
            expect(user.getLoginStatus().remainingAttempts).toBe(1);
            expect(() => user.authenticate("bad")).toThrow();
            expect(user.getLoginStatus()).toEqual({ maxAttempts: 3, remainingAttempts: 0, isLocked: true });
        });

        it("Must restore the attempts after a successful login", () => {
            const user = new User("John", "secret123", new SavingsAccount(new Money(1000)));
            expect(() => user.authenticate("bad")).toThrow();
            expect(() => user.authenticate("bad")).toThrow();

            user.authenticate("secret123");

            expect(user.getLoginStatus().remainingAttempts).toBe(3);
        });

        it("Must keep reporting the lock until 24 hours have passed", () => {
            vi.useFakeTimers();
            const user = new User("John", "secret123", new SavingsAccount(new Money(1000)));
            for (let i = 0; i < 3; i++) expect(() => user.authenticate("bad")).toThrow();

            vi.advanceTimersByTime(LOCK_DURATION_MS - 1);

            expect(user.getLoginStatus()).toEqual({ maxAttempts: 3, remainingAttempts: 0, isLocked: true });
        });

        it("Must show 3 of 3 and not locked once the lock expired, without changing the user", () => {
            vi.useFakeTimers();
            const user = new User("John", "secret123", new SavingsAccount(new Money(1000)));
            for (let i = 0; i < 3; i++) expect(() => user.authenticate("bad")).toThrow();

            vi.advanceTimersByTime(LOCK_DURATION_MS);

            expect(user.getLoginStatus()).toEqual({ maxAttempts: 3, remainingAttempts: 3, isLocked: false });
            expect(user.isLocked()).toBe(true);
            expect(user.getFailedAttempts()).toBe(3);
        });

        it("Must not change the user when the status is read", () => {
            const user = new User("John", "secret123", new SavingsAccount(new Money(1000)));
            expect(() => user.authenticate("bad")).toThrow();

            user.getLoginStatus();
            user.getLoginStatus();

            expect(user.getFailedAttempts()).toBe(1);
            expect(user.getLoginStatus().remainingAttempts).toBe(2);
        });
    });
});
