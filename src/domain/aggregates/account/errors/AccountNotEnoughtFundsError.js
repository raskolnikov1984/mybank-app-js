import { DomainError } from "../../../shared/errors/DomainError.js";

export class AccountNotEnoughtFundsError extends DomainError {
    constructor(
        message = "The account balance is less than the amount to withdraw",
    ) {
        super(message);
    }

    errorCode() {
        return "ACCOUNT_NOT_ENOUGHT_FUNDS_ERROR";
    }
}
