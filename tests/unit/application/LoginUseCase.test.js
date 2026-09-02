import { describe, expect, it, beforeEach } from "vitest";
import { LoginUseCase } from "../../../src/application/use-cases/LoginUseCase.js";
import { UserRepository } from "../../../src/application/ports/UserRepository.js";
import { User } from "../../../src/domain/aggregates/user/entities/User.js";
import { Account } from "../../../src/domain/aggregates/account/entities/Account.js";
import { Money } from "../../../src/domain/shared/value-objects/Money.js";
import { InvalidCredentialsError } from "../../../src/domain/aggregates/user/errors/InvalidCredentialsError.js";
import { AccountLockedError } from "../../../src/domain/aggregates/user/errors/AccountLockedError.js";
import { UserNotFoundError } from "../../../src/domain/aggregates/user/errors/UserNotFoundError.js";

class MockUserRepository extends UserRepository {
    #users = new Map();

    findByName(name) {
        return this.#users.get(name) || null;
    }

    save(user) {
        this.#users.set(user.getName(), user);
    }

    exists(name) {
        return this.#users.has(name);
    }
}

describe("LoginUseCase", () => {
    let userRepository;
    let useCase;

    beforeEach(() => {
        userRepository = new MockUserRepository();
        useCase = new LoginUseCase(userRepository);
        userRepository.save(new User("John", "secret123", new Account(new Money(100000))));
    });

    it("Must login successfully with valid credentials", () => {
        const { user } = useCase.execute({ name: "John", password: "secret123" });

        expect(user.getName()).toBe("John");
    });

    it("Must throw UserNotFoundError when the user does not exist", () => {
        expect(() =>
            useCase.execute({ name: "Ghost", password: "secret123" }),
        ).toThrow(UserNotFoundError);
    });

    it("Must throw InvalidCredentialsError with wrong password", () => {
        expect(() =>
            useCase.execute({ name: "John", password: "wrong" }),
        ).toThrow(InvalidCredentialsError);
    });

    it("Must throw AccountLockedError after 3 failed attempts", () => {
        expect(() => useCase.execute({ name: "John", password: "wrong1" })).toThrow(
            InvalidCredentialsError,
        );
        expect(() => useCase.execute({ name: "John", password: "wrong2" })).toThrow(
            InvalidCredentialsError,
        );

        expect(() => useCase.execute({ name: "John", password: "wrong3" })).toThrow(
            AccountLockedError,
        );
    });
});