import { DomainError } from "../../../shared/errors/DomainError.js";

export class MonthlyStatementNotSupportedError extends DomainError {
    constructor(message = "This product does not have a monthly statement") {
        super(message);
    }

    errorCode() {
        return "MONTHLY_STATEMENT_NOT_SUPPORTED_ERROR";
    }
}
