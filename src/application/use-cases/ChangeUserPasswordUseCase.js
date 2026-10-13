import { findManagedClient } from "./findManagedClient.js";
import { UserPasswordRequiredError } from "../../domain/aggregates/user/errors/UserPasswordRequiredError.js";

export class ChangeUserPasswordUseCase {
    #userRepository;

    constructor(userRepository) {
        this.#userRepository = userRepository;
    }

    execute({ name, newPassword }) {
        const user = findManagedClient(this.#userRepository, name);

        if (typeof newPassword !== "string" || newPassword.trim().length === 0)
            throw new UserPasswordRequiredError("La nueva contraseña es obligatoria");

        user.changePassword(newPassword);
        this.#userRepository.save(user);

        return { name: user.getName() };
    }
}
