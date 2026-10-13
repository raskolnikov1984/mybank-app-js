import { RegistrationRequestNotFoundError } from "../../domain/aggregates/registration/errors/RegistrationRequestNotFoundError.js";

export class ApproveRegistrationRequestUseCase {
    #requestRepository;
    #registerUserUseCase;

    constructor(requestRepository, registerUserUseCase) {
        this.#requestRepository = requestRepository;
        this.#registerUserUseCase = registerUserUseCase;
    }

    execute({ name }) {
        const request = typeof name === "string" ? this.#requestRepository.findByName(name) : null;

        if (!request)
            throw new RegistrationRequestNotFoundError("No existe una solicitud de registro con ese nombre");

        // Registering applies the usual rules (unique name, valid data). If it fails the request stays pending.
        const profile = request.getProfile();
        const registered = this.#registerUserUseCase.execute({
            name: request.getName(),
            password: request.getPassword(),
            confirmPassword: request.getPassword(),
            fullName: profile.getFullName(),
            identificationType: profile.getIdentification().getType(),
            identificationNumber: profile.getIdentification().getNumber(),
            phone: profile.getPhone(),
            accountType: request.getAccountType(),
            initialBalance: request.getInitialBalance() ?? undefined,
        });

        this.#requestRepository.delete(request.getName());

        return registered;
    }
}
