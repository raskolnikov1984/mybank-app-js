import { DomainError } from "../../../shared/errors/DomainError.js";

export class InvalidAccountTypeError extends DomainError {
    constructor(message = "The account type is not supported") {
        super(message);
    }

    errorCode() {
        return "INVALID_ACCOUNT_TYPE_ERROR";
    }
}
