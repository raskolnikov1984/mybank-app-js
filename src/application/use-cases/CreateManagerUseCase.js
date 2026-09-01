import { UserRole } from "../../domain/aggregates/user/value-objects/UserRole.js";
import { Money } from "../../domain/shared/value-objects/Money.js";
import { Account } from "../../domain/aggregates/account/entities/Account.js";
import { User } from "../../domain/aggregates/user/entities/User.js";

const MANAGER_NAME = "gerente";
const MANAGER_PASSWORD = "admin";

export class CreateManagerUseCase {
    #userRepository;
    #accountRepository;

    constructor(userRepository, accountRepository) {
        this.#userRepository = userRepository;
        this.#accountRepository = accountRepository;
    }

    execute() {
        if (this.#userRepository.exists(MANAGER_NAME))
            return;

        const account = new Account(new Money(1));
        const manager = new User(MANAGER_NAME, MANAGER_PASSWORD, account, UserRole.GERENTE);

        this.#userRepository.save(manager);
        this.#accountRepository.save(manager.getName(), account);
    }
}