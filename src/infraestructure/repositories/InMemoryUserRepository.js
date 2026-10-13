import { UserRepository } from "../../application/ports/UserRepository.js";

export class InMemoryUserRepository extends UserRepository {
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

    delete(name) {
        this.#users.delete(name);
    }

    existsByIdentification(identification) {
        return [...this.#users.values()].some(
            (user) => user.getProfile()?.getIdentification().equals(identification) ?? false,
        );
    }
}
