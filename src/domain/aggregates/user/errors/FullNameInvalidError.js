import { DomainError } from "../../../shared/errors/DomainError.js";

export class FullNameInvalidError extends DomainError {
    constructor(message = "El nombre completo no es válido") {
        super(message);
    }

    errorCode() {
        return "FULL_NAME_INVALID_ERROR";
    }
}
