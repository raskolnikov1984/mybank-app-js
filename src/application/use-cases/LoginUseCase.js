import { LoginDTO } from "../dtos/LoginDTO.js";
import { InvalidCredentialsError } from "../../domain/aggregates/user/errors/InvalidCredentialsError.js";
import { AccountLockedError } from "../../domain/aggregates/user/errors/AccountLockedError.js";
import { UserNotFoundError } from "../../domain/aggregates/user/errors/UserNotFoundError.js";

export class LoginUseCase {
    #userRepository;

    constructor(userRepository) {
        this.#userRepository = userRepository;
    }

    execute(input) {
        const dto = new LoginDTO(input);
        const user = this.#userRepository.findByName(dto.getName());

        if (!user)
            throw new UserNotFoundError("No tiene una cuenta abierta en el Banco Mi Plata");

        try {
            user.authenticate(dto.getPassword());
        } catch (error) {
            if (user.isLocked())
                throw new AccountLockedError(
                    "Cuenta bloqueada por 24 horas, comunícate con tu banco",
                );
            throw new InvalidCredentialsError(
                `Credenciales inválidas. Intento ${user.getFailedAttempts()} de 3`,
            );
        }

        return { user };
    }
}
