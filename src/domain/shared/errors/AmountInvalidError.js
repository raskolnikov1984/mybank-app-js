import { DomainError } from "./DomainError.js";

export class AmountInvalidError extends DomainError {
    constructor(message = "The provided amount is invalid") {
        super(message);
    }

    errorCode() {
        return "AMOUNT_INVALID_ERROR";
    }
}
