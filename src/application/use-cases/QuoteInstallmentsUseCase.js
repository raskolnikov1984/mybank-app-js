import { Money } from "../../domain/shared/value-objects/Money.js";
import { InstallmentPlan } from "../../domain/aggregates/account/value-objects/InstallmentPlan.js";
import { AmountInvalidError } from "../../domain/shared/errors/AmountInvalidError.js";

// Previews the rate, monthly payment and total of a purchase without touching any account.
export class QuoteInstallmentsUseCase {
    execute({ amount, installments }) {
        if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0)
            throw new AmountInvalidError("Amount must be greater than zero");

        return InstallmentPlan.quote(new Money(amount), installments);
    }
}
