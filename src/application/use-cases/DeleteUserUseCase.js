import { findManagedClient } from "./findManagedClient.js";
import { DeletionNotConfirmedError } from "../../domain/aggregates/user/errors/DeletionNotConfirmedError.js";
import { UserHasOpenBalanceError } from "../../domain/aggregates/user/errors/UserHasOpenBalanceError.js";

export class DeleteUserUseCase {
    #userRepository;
    #accountRepository;

    constructor(userRepository, accountRepository) {
        this.#userRepository = userRepository;
        this.#accountRepository = accountRepository;
    }

    execute({ name, confirmed }) {
        if (confirmed !== true)
            throw new DeletionNotConfirmedError("Debe confirmar la eliminación del usuario");

        const user = findManagedClient(this.#userRepository, name);

        if (user.getAccount().hasOpenPosition())
            throw new UserHasOpenBalanceError(
                "El producto debe estar en cero (sin saldo, deuda ni sobregiro) para eliminar al usuario",
            );

        this.#accountRepository.delete(user.getName());
        this.#userRepository.delete(user.getName());

        return { name: user.getName() };
    }
}
