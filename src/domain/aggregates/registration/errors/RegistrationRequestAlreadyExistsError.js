import { DomainError } from "../../../shared/errors/DomainError.js";

export class RegistrationRequestAlreadyExistsError extends DomainError {
    constructor(message = "The registration request already exists") {
        super(message);
    }

    errorCode() {
        return "REGISTRATION_REQUEST_ALREADY_EXISTS_ERROR";
    }
}
