import { DomainError } from "../../../shared/errors/DomainError.js";

export class UserAlreadyExistsError extends DomainError {
    constructor(message = "The user already exists") {
        super(message);
    }

    errorCode() {
        return "USER_ALREADY_EXISTS_ERROR";
    }
}
