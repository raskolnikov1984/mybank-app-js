import { DomainError } from "../../../shared/errors/DomainError.js";

export class InvalidIdentificationError extends DomainError {
    constructor(message = "El número de identificación no es válido") {
        super(message);
    }

    errorCode() {
        return "INVALID_IDENTIFICATION_ERROR";
    }
}
