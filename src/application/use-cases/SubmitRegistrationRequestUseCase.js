import { RegistrationRequest } from "../../domain/aggregates/registration/entities/RegistrationRequest.js";
import { ClientProfile } from "../../domain/aggregates/user/value-objects/ClientProfile.js";
import { PasswordMismatchError } from "../../domain/aggregates/user/errors/PasswordMismatchError.js";
import { IdentificationAlreadyRegisteredError } from "../../domain/aggregates/user/errors/IdentificationAlreadyRegisteredError.js";
import { RegistrationRequestAlreadyExistsError } from "../../domain/aggregates/registration/errors/RegistrationRequestAlreadyExistsError.js";
import { UserAlreadyExistsError } from "../../domain/aggregates/user/errors/UserAlreadyExistsError.js";

export class SubmitRegistrationRequestUseCase {
    #userRepository;
    #requestRepository;

    constructor(userRepository, requestRepository) {
        this.#userRepository = userRepository;
        this.#requestRepository = requestRepository;
    }

    // Stores a pending request. It never creates a user or a product.
    execute({ confirmPassword, fullName, identificationType, identificationNumber, phone, ...input }) {
        if (confirmPassword !== input.password)
            throw new PasswordMismatchError();

        const profile = new ClientProfile({ fullName, identificationType, identificationNumber, phone });
        const request = new RegistrationRequest({ ...input, profile });
        const identification = profile.getIdentification();

        if (this.#userRepository.exists(request.getName()))
            throw new UserAlreadyExistsError("El usuario ya existe en el Banco Mi Plata");

        if (this.#requestRepository.findByName(request.getName()))
            throw new RegistrationRequestAlreadyExistsError(
                "Ya existe una solicitud de registro pendiente con ese nombre",
            );

        if (
            this.#userRepository.existsByIdentification(identification) ||
            this.#requestRepository.findByIdentification(identification)
        )
            throw new IdentificationAlreadyRegisteredError(
                "Ya existe un cliente o una solicitud con ese número de identificación",
            );

        this.#requestRepository.save(request);

        return { name: request.getName() };
    }
}
