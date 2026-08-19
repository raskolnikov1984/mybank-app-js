import { DomainError } from "../../../shared/errors/DomainError";

export class InvalidAccountError extends DomainError {
    constructor(message = "Invalid account type") {
        super(message);
    }

    errorCode() {
        return "INVALID_ACCOUNT_ERROR";
    }
}
