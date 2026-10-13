import { DomainError } from "../../../shared/errors/DomainError.js";

export class InvalidPhoneError extends DomainError {
    constructor(message = "El celular debe tener 10 dígitos y empezar por 3") {
        super(message);
    }

    errorCode() {
        return "INVALID_PHONE_ERROR";
    }
}
