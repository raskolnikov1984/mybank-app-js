import { TransferDTO } from "../dtos/TransferDTO.js";
import { Money } from "../../domain/shared/value-objects/Money.js";
import { MovementType } from "../../domain/aggregates/account/entities/Movement.js";
import { AccountInvalidAmountError } from "../../domain/aggregates/account/errors/AccountInvalidAmountError.js";
import { SameAccountTransferError } from "../../domain/aggregates/account/errors/SameAccountTransferError.js";
import { UserRole } from "../../domain/aggregates/user/value-objects/UserRole.js";

export class TransferUseCase {
    #userRepository;
    #accountRepository;

    constructor(userRepository, accountRepository) {
        this.#userRepository = userRepository;
        this.#accountRepository = accountRepository;
    }

    // Everything is validated before any account changes, so a rejected transfer leaves both untouched.
    execute(input) {
        const dto = new TransferDTO(input);

        if (dto.getFromAccountId() === dto.getToAccountId())
            throw new SameAccountTransferError("No puedes transferir a tu propia cuenta");

        const origin = this.#accountRepository.findById(dto.getFromAccountId());
        const recipient = this.#userRepository.findByName(dto.getToAccountId());
        const destination = this.#accountRepository.findById(dto.getToAccountId());

        if (!origin || !recipient || recipient.getRole() !== UserRole.CLIENTE || !destination)
            throw new AccountInvalidAmountError("Account not found");

        const amount = new Money(dto.getAmount());
        destination.assertCanDeposit(amount);
        origin.withdrawFunds(amount, MovementType.TRANSFER_OUT);
        destination.depositFunds(amount, MovementType.TRANSFER_IN);

        this.#accountRepository.save(dto.getFromAccountId(), origin);
        this.#accountRepository.save(dto.getToAccountId(), destination);

        return { newBalance: origin.getBalance() };
    }
}
