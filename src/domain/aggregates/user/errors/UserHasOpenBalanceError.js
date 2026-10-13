import { DomainError } from "../../../shared/errors/DomainError.js";

export class UserHasOpenBalanceError extends DomainError {
    constructor(message = "The user product must be at zero before deleting the user") {
        super(message);
    }

    errorCode() {
        return "USER_HAS_OPEN_BALANCE_ERROR";
    }
}
