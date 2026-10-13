import { DomainError } from "../../../shared/errors/DomainError.js";

export class CreditLimitExceededError extends DomainError {
    constructor(message = "The amount exceeds the available credit limit") {
        super(message);
    }

    errorCode() {
        return "CREDIT_LIMIT_EXCEEDED_ERROR";
    }
}
