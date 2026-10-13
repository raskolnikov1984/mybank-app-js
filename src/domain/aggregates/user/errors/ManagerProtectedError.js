import { DomainError } from "../../../shared/errors/DomainError.js";

export class ManagerProtectedError extends DomainError {
    constructor(message = "The manager cannot be managed from user administration") {
        super(message);
    }

    errorCode() {
        return "MANAGER_PROTECTED_ERROR";
    }
}
