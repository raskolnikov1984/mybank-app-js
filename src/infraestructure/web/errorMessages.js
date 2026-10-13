const MESSAGES = {
    ACCOUNT_NOT_ENOUGHT_FUNDS_ERROR: "Fondos insuficientes para realizar el retiro.",
    CREDIT_LIMIT_EXCEEDED_ERROR: "El monto supera el cupo disponible de la tarjeta.",
    ACCOUNT_INVALID_AMOUNT_ERROR: "El monto ingresado no es válido.",
    AMOUNT_INVALID_ERROR: "El monto ingresado no es válido.",
    INVALID_ACCOUNT_TYPE_ERROR: "El tipo de producto no es válido.",
    USER_NAME_REQUIRED_ERROR: "El nombre de usuario es obligatorio.",
    USER_PASSWORD_REQUIRED_ERROR: "La contraseña es obligatoria.",
    MONTHLY_STATEMENT_NOT_SUPPORTED_ERROR: "Tu producto no tiene estado mensual.",
    INVALID_ACCOUNT_ERROR: "La cuenta del usuario no es válida.",
};

// Domain errors that already carry a user-facing Spanish message.
const SPANISH_MESSAGE_CODES = new Set([
    "INVALID_CREDENTIALS_ERROR",
    "ACCOUNT_LOCKED_ERROR",
    "USER_NOT_FOUND_ERROR",
]);

export function toMessage(error) {
    const code = typeof error?.errorCode === "function" ? error.errorCode() : null;

    if (error?.message === "Account not found")
        return "No se encontró la cuenta.";
    if (code && SPANISH_MESSAGE_CODES.has(code) && error.message)
        return error.message;
    if (code && MESSAGES[code])
        return MESSAGES[code];

    return error?.message || "Ocurrió un error inesperado.";
}
