import { DomainError } from "../../../shared/errors/DomainError";

export class InvalidCredentialsError extends DomainError {
    constructor(message = "Invalid credentials") {
        super(message);
    }

    errorCode() {
        return "INVALID_CREDENTIALS_ERROR";
    }
}
