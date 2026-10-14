import { DomainError } from "../../../shared/errors/DomainError.js";

export class SameAccountTransferError extends DomainError {
    constructor(message = "The origin and destination accounts must be different") {
        super(message);
    }

    errorCode() {
        return "SAME_ACCOUNT_TRANSFER_ERROR";
    }
}
