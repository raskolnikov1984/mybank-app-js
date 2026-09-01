import { DepositDTO } from "../dtos/DepositDTO.js";
import { Money } from "../../domain/shared/value-objects/Money.js";
import { AccountInvalidAmountError } from "../../domain/aggregates/account/errors/AccountInvalidAmountError.js";

export class DepositUseCase {
    #accountRepository;

    constructor(accountRepository) {
        this.#accountRepository = accountRepository;
    }

    execute(input) {
        const dto = new DepositDTO(input);
        const account = this.#accountRepository.findById(dto.getAccountId());

        if (!account)
            throw new AccountInvalidAmountError("Account not found");

        account.depositFunds(new Money(dto.getAmount()));
        this.#accountRepository.save(dto.getAccountId(), account);

        return { newBalance: account.getBalance() };
    }
}
