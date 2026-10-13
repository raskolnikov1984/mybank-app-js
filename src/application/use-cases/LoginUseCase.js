import { LoginDTO } from "../dtos/LoginDTO.js";
import { InvalidCredentialsError } from "../../domain/aggregates/user/errors/InvalidCredentialsError.js";
import { AccountLockedError } from "../../domain/aggregates/user/errors/AccountLockedError.js";
import { MAX_LOGIN_ATTEMPTS } from "../../domain/aggregates/user/entities/User.js";
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
            this.#userRepository.save(user);
            if (user.isLocked())
                throw new AccountLockedError(
                    "Cuenta bloqueada por 24 horas, comunícate con tu banco",
                );
            const { remainingAttempts } = user.getLoginStatus();
            throw new InvalidCredentialsError(
                `Credenciales inválidas. Intento ${user.getFailedAttempts()} de ${MAX_LOGIN_ATTEMPTS}. Intentos restantes: ${remainingAttempts}`,
            );
        }

        this.#userRepository.save(user);

        return { user };
    }
}
