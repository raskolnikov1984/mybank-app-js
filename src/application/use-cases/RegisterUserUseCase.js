import { RegisterUserDTO } from "../dtos/RegisterUserDTO.js";
import { Money } from "../../domain/shared/value-objects/Money.js";
import { Account } from "../../domain/aggregates/account/entities/Account.js";
import { User } from "../../domain/aggregates/user/entities/User.js";
import { UserRole } from "../../domain/aggregates/user/value-objects/UserRole.js";

export class RegisterUserUseCase {
    #userRepository;
    #accountRepository;

    constructor(userRepository, accountRepository) {
        this.#userRepository = userRepository;
        this.#accountRepository = accountRepository;
    }

    execute(input) {
        const dto = new RegisterUserDTO(input);
        const account = new Account(new Money(dto.getInitialBalance()));
        const client = new User(dto.getName(), dto.getPassword(), account, UserRole.CLIENTE);

        this.#userRepository.save(client);
        this.#accountRepository.save(client.getName(), account);

        return { id: client.getName(), name: client.getName() };
    }
}
