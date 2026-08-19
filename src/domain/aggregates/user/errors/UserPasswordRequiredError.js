import { DomainError } from "../../../shared/errors/DomainError";

export class UserPasswordRequiredError extends DomainError {
    constructor(message = "Password is required") {
        super(message);
    }

    errorCode() {
        return "USER_PASSWORD_REQUIRED_ERROR";
    }
}
