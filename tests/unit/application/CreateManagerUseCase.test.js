import { describe, expect, it, beforeEach } from "vitest";
import { CreateManagerUseCase } from "../../../src/application/use-cases/CreateManagerUseCase.js";
import { UserRepository } from "../../../src/application/ports/UserRepository.js";
import { AccountRepository } from "../../../src/application/ports/AccountRepository.js";
import { UserRole } from "../../../src/domain/aggregates/user/value-objects/UserRole.js";

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

    count() {
        return this.#users.size;
    }
}

class MockAccountRepository extends AccountRepository {
    #accounts = new Map();

    findById(id) {
        return this.#accounts.get(id) || null;
    }

    save(id, account) {
        this.#accounts.set(id, account);
    }

    count() {
        return this.#accounts.size;
    }
}

describe("CreateManagerUseCase", () => {
    let userRepository;
    let accountRepository;
    let useCase;

    beforeEach(() => {
        userRepository = new MockUserRepository();
        accountRepository = new MockAccountRepository();
        useCase = new CreateManagerUseCase(userRepository, accountRepository);
    });

    it("Must create the manager user 'gerente'", () => {
        useCase.execute();

        const manager = userRepository.findByName("gerente");

        expect(manager).not.toBeNull();
        expect(manager.getRole()).toBe(UserRole.GERENTE);
        expect(userRepository.count()).toBe(1);
        expect(accountRepository.count()).toBe(1);
    });

    it("Must not duplicate the manager when executed twice", () => {
        useCase.execute();
        useCase.execute();

        expect(userRepository.count()).toBe(1);
        expect(accountRepository.count()).toBe(1);
    });
});