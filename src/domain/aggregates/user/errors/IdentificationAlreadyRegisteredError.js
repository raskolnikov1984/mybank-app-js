import { DomainError } from "../../../shared/errors/DomainError.js";

export class IdentificationAlreadyRegisteredError extends DomainError {
    constructor(message = "Ya existe un cliente o una solicitud con esa identificación") {
        super(message);
    }

    errorCode() {
        return "IDENTIFICATION_ALREADY_REGISTERED_ERROR";
    }
}
