import { DomainError } from "../../../shared/errors/DomainError.js";

export class UserNotFoundError extends DomainError {
    constructor(message = "User doesn't have an open account") {
        super(message);
    }

    errorCode() {
        return "USER_NOT_FOUND_ERROR";
    }
}