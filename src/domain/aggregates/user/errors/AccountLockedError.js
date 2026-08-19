import { DomainError } from "../../../shared/errors/DomainError";

export class AccountLockedError extends DomainError {
    constructor(message = "Account locked for 24 hours") {
        super(message);
    }

    errorCode() {
        return "ACCOUNT_LOCKED_ERROR";
    }
}
