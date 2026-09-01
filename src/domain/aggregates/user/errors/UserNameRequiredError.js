import { DomainError } from "../../../shared/errors/DomainError.js";

export class UserNameRequiredError extends DomainError {
    constructor(message = "User name is required") {
        super(message);
    }

    errorCode() {
        return "USER_NAME_REQUIRED_ERROR";
    }
}
