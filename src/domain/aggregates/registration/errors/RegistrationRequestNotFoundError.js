import { DomainError } from "../../../shared/errors/DomainError.js";

export class RegistrationRequestNotFoundError extends DomainError {
    constructor(message = "The registration request was not found") {
        super(message);
    }

    errorCode() {
        return "REGISTRATION_REQUEST_NOT_FOUND_ERROR";
    }
}
