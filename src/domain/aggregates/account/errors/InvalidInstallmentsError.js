import { DomainError } from "../../../shared/errors/DomainError.js";

export class InvalidInstallmentsError extends DomainError {
    constructor(message = "The number of installments is not valid") {
        super(message);
    }

    errorCode() {
        return "INVALID_INSTALLMENTS_ERROR";
    }
}
