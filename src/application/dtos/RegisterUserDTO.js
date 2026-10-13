import { UserNameRequiredError } from "../../domain/aggregates/user/errors/UserNameRequiredError.js";
import { UserPasswordRequiredError } from "../../domain/aggregates/user/errors/UserPasswordRequiredError.js";
import { AmountInvalidError } from "../../domain/shared/errors/AmountInvalidError.js";
import { InvalidAccountTypeError } from "../../domain/aggregates/account/errors/InvalidAccountTypeError.js";
import { AccountType } from "../../domain/aggregates/account/value-objects/AccountType.js";

export class RegisterUserDTO {
    #name;
    #password;
    #initialBalance;
    #accountType;

    constructor({ name, password, initialBalance, accountType = AccountType.SAVINGS }) {
        if (!name || name.trim().length === 0)
            throw new UserNameRequiredError();
        if (!password || password.trim().length === 0)
            throw new UserPasswordRequiredError();
        if (!Object.values(AccountType).includes(accountType))
            throw new InvalidAccountTypeError(
                `The account type "${accountType}" is not supported`,
            );
        if (
            accountType !== AccountType.CREDIT_CARD &&
            (typeof initialBalance !== "number" || initialBalance <= 0)
        )
            throw new AmountInvalidError("Initial balance must be greater than zero");

        this.#name = name;
        this.#password = password;
        this.#initialBalance = initialBalance;
        this.#accountType = accountType;
    }

    getName() {
        return this.#name;
    }

    getPassword() {
        return this.#password;
    }

    getInitialBalance() {
        return this.#initialBalance;
    }

    getAccountType() {
        return this.#accountType;
    }
}
