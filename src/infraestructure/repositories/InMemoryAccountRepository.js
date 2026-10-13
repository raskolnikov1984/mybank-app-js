import { AccountRepository } from "../../application/ports/AccountRepository.js";

export class InMemoryAccountRepository extends AccountRepository {
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
