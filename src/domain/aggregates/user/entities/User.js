import { InvalidCredentialsError } from "../errors/InvalidCredentialsError.js";
import { AccountLockedError } from "../errors/AccountLockedError.js";
import { UserNameRequiredError } from "../errors/UserNameRequiredError.js";
import { UserPasswordRequiredError } from "../errors/UserPasswordRequiredError.js";
import { InvalidAccountError } from "../errors/InvalidAccountError.js";
import { Account } from "../../account/entities/Account.js";

const MAX_FAILED_ATTEMPTS = 3;

export class User {
    #name;
    #password;
    #account;
    #failedAttempts;
    #isLocked;

    constructor(name, password, account) {
        if (!name || name.trim().length === 0)
            throw new UserNameRequiredError();

        if (!password || password.trim().length === 0)
            throw new UserPasswordRequiredError();

        if (!(account instanceof Account))
            throw new InvalidAccountError();

        this.#name = name;
        this.#password = password;
        this.#account = account;
        this.#failedAttempts = 0;
        this.#isLocked = false;
    }

    authenticate(password) {
        if (this.#isLocked)
            throw new AccountLockedError();

        if (password !== this.#password) {
            this.#failedAttempts++;
            if (this.#failedAttempts >= MAX_FAILED_ATTEMPTS)
                this.#isLocked = true;
            throw new InvalidCredentialsError();
        }

        this.#failedAttempts = 0;
        return true;
    }

    getName() {
        return this.#name;
    }

    getAccount() {
        return this.#account;
    }

    isLocked() {
        return this.#isLocked;
    }
}
