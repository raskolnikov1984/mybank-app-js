const MESSAGES = {
    ACCOUNT_NOT_ENOUGHT_FUNDS_ERROR: "Fondos insuficientes para realizar el retiro.",
    CREDIT_LIMIT_EXCEEDED_ERROR: "El monto supera el cupo disponible de la tarjeta.",
    ACCOUNT_INVALID_AMOUNT_ERROR: "El monto ingresado no es válido.",
    AMOUNT_INVALID_ERROR: "El monto ingresado no es válido.",
    INVALID_ACCOUNT_TYPE_ERROR: "El tipo de producto no es válido.",
    USER_NAME_REQUIRED_ERROR: "El nombre de usuario es obligatorio.",
    USER_PASSWORD_REQUIRED_ERROR: "La contraseña es obligatoria.",
    MONTHLY_STATEMENT_NOT_SUPPORTED_ERROR: "Tu producto no tiene estado mensual.",
    USER_ALREADY_EXISTS_ERROR: "Ya existe un usuario con ese nombre.",
    USER_HAS_OPEN_BALANCE_ERROR:
        "El producto debe estar en cero (sin saldo, deuda ni sobregiro) para eliminar al usuario.",
    DELETION_NOT_CONFIRMED_ERROR: "Debes confirmar la eliminación del usuario.",
    MANAGER_PROTECTED_ERROR: "El gerente no se puede administrar desde esta opción.",
    REGISTRATION_REQUEST_ALREADY_EXISTS_ERROR: "Ya existe una solicitud de registro pendiente con ese nombre.",
    REGISTRATION_REQUEST_NOT_FOUND_ERROR: "No se encontró la solicitud de registro.",
    SAME_ACCOUNT_TRANSFER_ERROR: "No puedes transferir a tu propia cuenta.",
    PAYMENT_EXCEEDS_DEBT_ERROR: "El pago supera la deuda actual de la tarjeta.",
    INVALID_INSTALLMENTS_ERROR: "El número de cuotas debe ser un entero entre 1 y 36.",
    INSTALLMENTS_NOT_SUPPORTED_ERROR: "Tu producto no permite compras a cuotas.",
    INVALID_ACCOUNT_ERROR: "La cuenta del usuario no es válida.",
};

// Domain errors that already carry a user-facing Spanish message.
const SPANISH_MESSAGE_CODES = new Set([
    "INVALID_CREDENTIALS_ERROR",
    "ACCOUNT_LOCKED_ERROR",
    "USER_NOT_FOUND_ERROR",
    "INVALID_IDENTIFICATION_ERROR",
    "FULL_NAME_INVALID_ERROR",
    "INVALID_PHONE_ERROR",
    "PASSWORD_MISMATCH_ERROR",
    "IDENTIFICATION_ALREADY_REGISTERED_ERROR",
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
