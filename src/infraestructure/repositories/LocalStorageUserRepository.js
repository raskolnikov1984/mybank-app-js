import { UserRepository } from "../../application/ports/UserRepository.js";
import { User } from "../../domain/aggregates/user/entities/User.js";
import { JsonStorage } from "./JsonStorage.js";

export const USERS_KEY = "mi-plata:v1:users";

export class LocalStorageUserRepository extends UserRepository {
    #accountRepository;
    #store;
    #snapshots;
    #cache = new Map();

    constructor(accountRepository, storage = globalThis.localStorage, key = USERS_KEY) {
        super();
        this.#accountRepository = accountRepository;
        this.#store = new JsonStorage(storage, key);
        this.#snapshots = this.#store.read();
    }

    findByName(name) {
        if (this.#cache.has(name))
            return this.#cache.get(name);

        const snapshot = this.#snapshots[name];
        if (!snapshot)
            return null;

        const account = this.#accountRepository.findById(name);
        if (!account)
            return null;

        try {
            const user = User.restore(snapshot, account);
            this.#cache.set(name, user);
            return user;
        } catch {
            return null;
        }
    }

    save(user) {
        this.#cache.set(user.getName(), user);
        this.#snapshots[user.getName()] = user.toSnapshot();
        this.#store.write(this.#snapshots);
    }

    exists(name) {
        return this.#cache.has(name) || name in this.#snapshots;
    }
}
