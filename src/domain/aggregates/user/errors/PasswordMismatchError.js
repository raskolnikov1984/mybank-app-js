import { DomainError } from "../../../shared/errors/DomainError.js";

export class PasswordMismatchError extends DomainError {
    constructor(message = "La contraseña y su confirmación no coinciden") {
        super(message);
    }

    errorCode() {
        return "PASSWORD_MISMATCH_ERROR";
    }
}
