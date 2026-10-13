import { UserNotFoundError } from "../../domain/aggregates/user/errors/UserNotFoundError.js";
import { ManagerProtectedError } from "../../domain/aggregates/user/errors/ManagerProtectedError.js";
import { UserRole } from "../../domain/aggregates/user/value-objects/UserRole.js";

// Shared lookup for administration use cases: only existing clients can be managed.
export function findManagedClient(userRepository, name) {
    const user = typeof name === "string" ? userRepository.findByName(name) : null;

    if (!user)
        throw new UserNotFoundError("No existe un usuario con ese nombre");

    if (user.getRole() !== UserRole.CLIENTE)
        throw new ManagerProtectedError("El gerente no se puede administrar desde esta opción");

    return user;
}
