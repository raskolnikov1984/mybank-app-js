import { describe, expect, it } from "vitest";
import { User } from "../../src/domain/aggregates/user/entities/User.js";
import { Account } from "../../src/domain/aggregates/account/entities/Account.js";
import { Money } from "../../src/domain/shared/value-objects/Money.js";
import { InvalidCredentialsError } from "../../src/domain/aggregates/user/errors/InvalidCredentialsError.js";
import { AccountLockedError } from "../../src/domain/aggregates/user/errors/AccountLockedError.js";
import { UserNameRequiredError } from "../../src/domain/aggregates/user/errors/UserNameRequiredError.js";
import { UserPasswordRequiredError } from "../../src/domain/aggregates/user/errors/UserPasswordRequiredError.js";
import { InvalidAccountError } from "../../src/domain/aggregates/user/errors/InvalidAccountError.js";

describe("User", () => {
    it("Must be possible to create a user with name, password and account", () => {
        const account = new Account(new Money(100000));
        const user = new User("John", "secret123", account);

        expect(user).toBeInstanceOf(User);
        expect(user.getName()).toBe("John");
        expect(user.getAccount()).toBeInstanceOf(Account);
    });

    it("Must be possible to authenticate with correct password", () => {
        const account = new Account(new Money(100000));
        const user = new User("John", "secret123", account);

        expect(user.authenticate("secret123")).toBe(true);
    });

    it("Must throw InvalidCredentialsError with wrong password", () => {
        const account = new Account(new Money(100000));
        const user = new User("John", "secret123", account);

        expect(() => user.authenticate("wrong")).toThrow(InvalidCredentialsError);
    });

    it("Must allow 2 failed attempts without locking", () => {
        const account = new Account(new Money(100000));
        const user = new User("John", "secret123", account);

        expect(() => user.authenticate("wrong1")).toThrow(InvalidCredentialsError);
        expect(() => user.authenticate("wrong2")).toThrow(InvalidCredentialsError);
        expect(user.isLocked()).toBe(false);
    });

    it("Must lock account after 3 failed attempts", () => {
        const account = new Account(new Money(100000));
        const user = new User("John", "secret123", account);

        expect(() => user.authenticate("wrong1")).toThrow(InvalidCredentialsError);
        expect(() => user.authenticate("wrong2")).toThrow(InvalidCredentialsError);
        expect(() => user.authenticate("wrong3")).toThrow(InvalidCredentialsError);
        expect(user.isLocked()).toBe(true);
    });

    it("After lock, authentication must throw AccountLockedError", () => {
        const account = new Account(new Money(100000));
        const user = new User("John", "secret123", account);

        expect(() => user.authenticate("wrong1")).toThrow(InvalidCredentialsError);
        expect(() => user.authenticate("wrong2")).toThrow(InvalidCredentialsError);
        expect(() => user.authenticate("wrong3")).toThrow(InvalidCredentialsError);

        expect(() => user.authenticate("secret123")).toThrow(AccountLockedError);
    });

    it("Successful authentication resets failed attempts", () => {
        const account = new Account(new Money(100000));
        const user = new User("John", "secret123", account);

        expect(() => user.authenticate("wrong1")).toThrow(InvalidCredentialsError);
        expect(user.authenticate("secret123")).toBe(true);
        expect(() => user.authenticate("wrong1")).toThrow(InvalidCredentialsError);

        expect(user.isLocked()).toBe(false);
    });

    it("Cannot create user with empty name", () => {
        const account = new Account(new Money(100000));

        expect(() => new User("", "secret123", account)).toThrow(UserNameRequiredError);
    });

    it("Cannot create user with empty password", () => {
        const account = new Account(new Money(100000));

        expect(() => new User("John", "", account)).toThrow(UserPasswordRequiredError);
    });

    it("Cannot create user without an Account instance", () => {
        expect(() => new User("John", "secret123", "notAnAccount")).toThrow(InvalidAccountError);
    });
});
