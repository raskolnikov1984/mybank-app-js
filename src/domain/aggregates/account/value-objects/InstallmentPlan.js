import { Money } from "../../../shared/value-objects/Money.js";
import { InvalidInstallmentsError } from "../errors/InvalidInstallmentsError.js";

export const MIN_INSTALLMENTS = 1;
export const MAX_INSTALLMENTS = 36;

// Monthly rate by term: up to 2 installments no interest, 3-6 moderate, 7 or more high.
function monthlyRate(installments) {
    if (installments <= 2) return 0;
    if (installments <= 6) return 0.019;
    return 0.023;
}

export class InstallmentPlan {
    static quote(capital, installments) {
        if (!Number.isInteger(installments) || installments < MIN_INSTALLMENTS || installments > MAX_INSTALLMENTS)
            throw new InvalidInstallmentsError(
                `The number of installments must be a whole number from ${MIN_INSTALLMENTS} to ${MAX_INSTALLMENTS}`,
            );

        const rate = monthlyRate(installments);
        const principal = capital.getAmount();
        const currency = capital.getCurrency();
        const payment = rate === 0
            ? principal / installments
            : (principal * rate) / (1 - Math.pow(1 + rate, -installments));
        const monthlyPayment = Math.round(payment);
        const totalToPay = rate === 0 ? principal : monthlyPayment * installments;

        return {
            installments,
            rate,
            monthlyPayment: new Money(monthlyPayment, currency),
            totalToPay: new Money(totalToPay, currency),
            interest: new Money(Math.max(totalToPay - principal, 0), currency),
        };
    }
}
