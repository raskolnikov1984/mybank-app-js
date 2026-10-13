export class JsonStorage {
    #storage;
    #key;

    constructor(storage, key) {
        this.#storage = storage;
        this.#key = key;
    }

    read() {
        try {
            const raw = this.#storage.getItem(this.#key);
            const parsed = raw ? JSON.parse(raw) : {};
            return parsed && typeof parsed === "object" ? parsed : {};
        } catch {
            return {};
        }
    }

    write(data) {
        this.#storage.setItem(this.#key, JSON.stringify(data));
    }
}
