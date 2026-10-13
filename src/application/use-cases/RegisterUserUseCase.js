import { RegisterUserDTO } from "../dtos/RegisterUserDTO.js";
import { AccountFactory } from "../../domain/aggregates/account/factories/AccountFactory.js";
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
        const account = AccountFactory.create(dto.getAccountType(), dto.getInitialBalance());
        const client = new User(dto.getName(), dto.getPassword(), account, UserRole.CLIENTE);

        this.#userRepository.save(client);
        this.#accountRepository.save(client.getName(), account);

        return { id: client.getName(), name: client.getName() };
    }
}
