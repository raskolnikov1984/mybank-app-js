import { RegistrationRequestRepository } from "../../application/ports/RegistrationRequestRepository.js";
import { RegistrationRequest } from "../../domain/aggregates/registration/entities/RegistrationRequest.js";
import { JsonStorage } from "./JsonStorage.js";

export const REGISTRATION_REQUESTS_KEY = "mi-plata:v1:registration-requests";

export class LocalStorageRegistrationRequestRepository extends RegistrationRequestRepository {
    #store;
    #snapshots;

    constructor(storage = globalThis.localStorage, key = REGISTRATION_REQUESTS_KEY) {
        super();
        this.#store = new JsonStorage(storage, key);
        this.#snapshots = this.#store.read();
    }

    findByName(name) {
        return this.#restore(this.#snapshots[name]);
    }

    findAll() {
        return Object.values(this.#snapshots)
            .map((snapshot) => this.#restore(snapshot))
            .filter((request) => request !== null)
            .sort((a, b) => a.getCreatedAt() - b.getCreatedAt());
    }

    findByIdentification(identification) {
        return this.findAll().find((request) => request.getProfile().getIdentification().equals(identification)) || null;
    }

    save(request) {
        this.#snapshots[request.getName()] = request.toSnapshot();
        this.#store.write(this.#snapshots);
    }

    delete(name) {
        delete this.#snapshots[name];
        this.#store.write(this.#snapshots);
    }

    #restore(snapshot) {
        if (!snapshot)
            return null;

        try {
            return RegistrationRequest.restore(snapshot);
        } catch {
            return null;
        }
    }
}
