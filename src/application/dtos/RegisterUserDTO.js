import { UserNameRequiredError } from "../../domain/aggregates/user/errors/UserNameRequiredError.js";
import { UserPasswordRequiredError } from "../../domain/aggregates/user/errors/UserPasswordRequiredError.js";
import { AmountInvalidError } from "../../domain/shared/errors/AmountInvalidError.js";

export class RegisterUserDTO {
    #name;
    #password;
    #initialBalance;

    constructor({ name, password, initialBalance }) {
        if (!name || name.trim().length === 0)
            throw new UserNameRequiredError();
        if (!password || password.trim().length === 0)
            throw new UserPasswordRequiredError();
        if (typeof initialBalance !== "number" || initialBalance <= 0)
            throw new AmountInvalidError("Initial balance must be greater than zero");

        this.#name = name;
        this.#password = password;
        this.#initialBalance = initialBalance;
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
}
