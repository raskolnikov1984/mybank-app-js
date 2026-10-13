import { AccountInvalidAmountError } from "../../domain/aggregates/account/errors/AccountInvalidAmountError.js";

export class GetBalanceUseCase {
    #accountRepository;

    constructor(accountRepository) {
        this.#accountRepository = accountRepository;
    }

    execute(accountId) {
        const account = this.#accountRepository.findById(accountId);

        if (!account)
            throw new AccountInvalidAmountError("Account not found");

        return {
            balance: account.getBalance(),
            type: account.accountType(),
            typeName: account.typeName(),
            creditUsed: account.getCreditUsed(),
            availableCredit: account.getAvailableCredit(),
            summary: account.describe(),
            supportsMonthlyStatement: account.supportsMonthlyStatement(),
        };
    }
}
