import { RegistrationRequestNotFoundError } from "../../domain/aggregates/registration/errors/RegistrationRequestNotFoundError.js";

export class RejectRegistrationRequestUseCase {
    #requestRepository;

    constructor(requestRepository) {
        this.#requestRepository = requestRepository;
    }

    execute({ name }) {
        const request = typeof name === "string" ? this.#requestRepository.findByName(name) : null;

        if (!request)
            throw new RegistrationRequestNotFoundError("No existe una solicitud de registro con ese nombre");

        this.#requestRepository.delete(request.getName());

        return { name: request.getName() };
    }
}
