import { DomainError } from "../../../shared/errors/DomainError.js";

export class InstallmentsNotSupportedError extends DomainError {
    constructor(message = "This product does not support purchases in installments") {
        super(message);
    }

    errorCode() {
        return "INSTALLMENTS_NOT_SUPPORTED_ERROR";
    }
}
