import { DomainError } from "../../../shared/errors/DomainError";

export class AccountInvalidAmountError extends DomainError {
    constructor(message = "The provided amount type is invalid") {
        super(message);
    }

    errorCode() {
        return "ACCOUNT_INVALID_AMOUNT_ERROR";
    }
}
