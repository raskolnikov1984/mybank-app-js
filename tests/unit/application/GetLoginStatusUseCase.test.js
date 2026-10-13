import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import { GetLoginStatusUseCase } from "../../../src/application/use-cases/GetLoginStatusUseCase.js";
import { LoginUseCase } from "../../../src/application/use-cases/LoginUseCase.js";
import { User } from "../../../src/domain/aggregates/user/entities/User.js";
import { SavingsAccount } from "../../../src/domain/aggregates/account/entities/SavingsAccount.js";
import { Money } from "../../../src/domain/shared/value-objects/Money.js";
import { MockUserRepository } from "./mockRepositories.js";

const DAY = 24 * 60 * 60 * 1000;

describe("GetLoginStatusUseCase", () => {
    let users;
    let status;
    let login;

    beforeEach(() => {
        users = new MockUserRepository();
        users.save(new User("ana", "pw", new SavingsAccount(new Money(1000))));
        status = new GetLoginStatusUseCase(users);
        login = new LoginUseCase(users);
    });

    afterEach(() => vi.useRealTimers());

    const fail = () => expect(() => login.execute({ name: "ana", password: "bad" })).toThrow();

    it("Must report no attempt data for unknown or empty names", () => {
        for (const input of [{ name: "nobody" }, { name: "" }, { name: "   " }, {}, undefined, { name: null }])
            expect(status.execute(input)).toEqual({ exists: false });
    });

    it("Must report 3 of 3 for an existing user without failures", () => {
        expect(status.execute({ name: "ana" })).toEqual({ exists: true, maxAttempts: 3, remainingAttempts: 3, isLocked: false });
    });

    it("Must follow the failures and the lockout", () => {
        fail();
        expect(status.execute({ name: "ana" }).remainingAttempts).toBe(2);
        fail();
        expect(status.execute({ name: "ana" }).remainingAttempts).toBe(1);
        fail();
        expect(status.execute({ name: "ana" })).toEqual({ exists: true, maxAttempts: 3, remainingAttempts: 0, isLocked: true });
    });

    it("Must restore 3 of 3 after a successful login", () => {
        fail();
        fail();

        login.execute({ name: "ana", password: "pw" });

        expect(status.execute({ name: "ana" }).remainingAttempts).toBe(3);
    });

    it("Must show 3 of 3 once the 24 hour lock expired without saving anything", () => {
        vi.useFakeTimers();
        fail();
        fail();
        fail();
        vi.advanceTimersByTime(DAY);

        expect(status.execute({ name: "ana" })).toEqual({ exists: true, maxAttempts: 3, remainingAttempts: 3, isLocked: false });
        expect(users.findByName("ana").isLocked()).toBe(true);
    });

    it("Must never change the stored user", () => {
        fail();
        const before = JSON.stringify(users.findByName("ana").toSnapshot());

        status.execute({ name: "ana" });
        status.execute({ name: "ana" });

        expect(JSON.stringify(users.findByName("ana").toSnapshot())).toBe(before);
    });
});
