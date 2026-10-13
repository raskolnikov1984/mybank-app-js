import { AccountRepository } from "../../application/ports/AccountRepository.js";
import { AccountFactory } from "../../domain/aggregates/account/factories/AccountFactory.js";
import { JsonStorage } from "./JsonStorage.js";

export const ACCOUNTS_KEY = "mi-plata:v1:accounts";

export class LocalStorageAccountRepository extends AccountRepository {
    #store;
    #snapshots;
    #cache = new Map();

    constructor(storage = globalThis.localStorage, key = ACCOUNTS_KEY) {
        super();
        this.#store = new JsonStorage(storage, key);
        this.#snapshots = this.#store.read();
    }

    findById(id) {
        if (this.#cache.has(id))
            return this.#cache.get(id);

        const snapshot = this.#snapshots[id];
        if (!snapshot)
            return null;

        try {
            const account = AccountFactory.restore(snapshot);
            this.#cache.set(id, account);
            return account;
        } catch {
            return null;
        }
    }

    save(id, account) {
        this.#cache.set(id, account);
        this.#snapshots[id] = account.toSnapshot();
        this.#store.write(this.#snapshots);
    }

    delete(id) {
        this.#cache.delete(id);
        delete this.#snapshots[id];
        this.#store.write(this.#snapshots);
    }
}
