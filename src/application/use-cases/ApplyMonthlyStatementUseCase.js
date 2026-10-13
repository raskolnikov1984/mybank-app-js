import { AccountInvalidAmountError } from "../../domain/aggregates/account/errors/AccountInvalidAmountError.js";

export class ApplyMonthlyStatementUseCase {
    #accountRepository;

    constructor(accountRepository) {
        this.#accountRepository = accountRepository;
    }

    execute(accountId) {
        const account = this.#accountRepository.findById(accountId);

        if (!account)
            throw new AccountInvalidAmountError("Account not found");

        const statement = account.monthlyStatement();
        this.#accountRepository.save(accountId, account);

        return { statement };
    }
}
