import { PurchaseDTO } from "../dtos/PurchaseDTO.js";
import { Money } from "../../domain/shared/value-objects/Money.js";
import { AccountInvalidAmountError } from "../../domain/aggregates/account/errors/AccountInvalidAmountError.js";

export class PurchaseUseCase {
    #accountRepository;

    constructor(accountRepository) {
        this.#accountRepository = accountRepository;
    }

    execute(input) {
        const dto = new PurchaseDTO(input);
        const account = this.#accountRepository.findById(dto.getAccountId());

        if (!account)
            throw new AccountInvalidAmountError("Account not found");

        const amount = new Money(dto.getAmount());
        const plan = account.purchaseInInstallments(amount, dto.getInstallments());
        this.#accountRepository.save(dto.getAccountId(), account);

        return {
            purchase: {
                amount,
                installments: plan.installments,
                rate: plan.rate,
                monthlyPayment: plan.monthlyPayment,
                totalToPay: plan.totalToPay,
                interest: plan.interest,
            },
            debt: account.getCreditUsed(),
            availableCredit: account.getAvailableCredit(),
        };
    }
}
