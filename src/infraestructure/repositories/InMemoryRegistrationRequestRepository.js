import { RegistrationRequestRepository } from "../../application/ports/RegistrationRequestRepository.js";

export class InMemoryRegistrationRequestRepository extends RegistrationRequestRepository {
    #requests = new Map();

    findByName(name) {
        return this.#requests.get(name) || null;
    }

    findAll() {
        return [...this.#requests.values()].sort((a, b) => a.getCreatedAt() - b.getCreatedAt());
    }

    save(request) {
        this.#requests.set(request.getName(), request);
    }

    delete(name) {
        this.#requests.delete(name);
    }

    findByIdentification(identification) {
        return (
            [...this.#requests.values()].find((request) =>
                request.getProfile().getIdentification().equals(identification),
            ) || null
        );
    }
}
