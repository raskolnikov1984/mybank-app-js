import { DomainError } from "../../../shared/errors/DomainError.js";

export class PaymentExceedsDebtError extends DomainError {
    constructor(message = "The payment exceeds the current debt of the card") {
        super(message);
    }

    errorCode() {
        return "PAYMENT_EXCEEDS_DEBT_ERROR";
    }
}
