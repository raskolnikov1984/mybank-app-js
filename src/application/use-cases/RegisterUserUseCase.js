import { RegisterUserDTO } from "../dtos/RegisterUserDTO.js";
import { AccountFactory } from "../../domain/aggregates/account/factories/AccountFactory.js";
import { User } from "../../domain/aggregates/user/entities/User.js";
import { IdentificationAlreadyRegisteredError } from "../../domain/aggregates/user/errors/IdentificationAlreadyRegisteredError.js";
import { UserAlreadyExistsError } from "../../domain/aggregates/user/errors/UserAlreadyExistsError.js";
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

        if (this.#userRepository.exists(dto.getName()))
            throw new UserAlreadyExistsError("El usuario ya existe en el Banco Mi Plata");

        if (this.#userRepository.existsByIdentification(dto.getProfile().getIdentification()))
            throw new IdentificationAlreadyRegisteredError(
                "Ya existe un cliente con ese número de identificación",
            );

        const account = AccountFactory.create(dto.getAccountType(), dto.getInitialBalance());
        const client = new User(dto.getName(), dto.getPassword(), account, UserRole.CLIENTE, dto.getProfile());

        this.#userRepository.save(client);
        this.#accountRepository.save(client.getName(), account);

        return { id: client.getName(), name: client.getName() };
    }
}
