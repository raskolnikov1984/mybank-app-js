import { UserRepository } from "../../../src/application/ports/UserRepository.js";
import { RegistrationRequestRepository } from "../../../src/application/ports/RegistrationRequestRepository.js";
import { AccountRepository } from "../../../src/application/ports/AccountRepository.js";

export class MockUserRepository extends UserRepository {
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

    findAll() {
        return [...this.#users.values()];
    }

    existsByIdentification(identification) {
        return [...this.#users.values()].some(
            (user) => user.getProfile()?.getIdentification().equals(identification) ?? false,
        );
    }

    delete(name) {
        this.#users.delete(name);
    }
}

export class MockAccountRepository extends AccountRepository {
    #accounts = new Map();

    findById(id) {
        return this.#accounts.get(id) || null;
    }

    save(id, account) {
        this.#accounts.set(id, account);
    }

    delete(id) {
        this.#accounts.delete(id);
    }
}

export class MockRegistrationRequestRepository extends RegistrationRequestRepository {
    #requests = new Map();

    findByName(name) {
        return this.#requests.get(name) || null;
    }

    findAll() {
        return [...this.#requests.values()].sort((a, b) => a.getCreatedAt() - b.getCreatedAt());
    }

    findByIdentification(identification) {
        return (
            [...this.#requests.values()].find((request) =>
                request.getProfile().getIdentification().equals(identification),
            ) || null
        );
    }

    save(request) {
        this.#requests.set(request.getName(), request);
    }

    delete(name) {
        this.#requests.delete(name);
    }
}
