import { DomainError } from "../../../shared/errors/DomainError.js";

export class DeletionNotConfirmedError extends DomainError {
    constructor(message = "The deletion was not confirmed") {
        super(message);
    }

    errorCode() {
        return "DELETION_NOT_CONFIRMED_ERROR";
    }
}
