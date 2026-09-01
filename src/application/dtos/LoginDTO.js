import { UserNameRequiredError } from "../../domain/aggregates/user/errors/UserNameRequiredError.js";
import { UserPasswordRequiredError } from "../../domain/aggregates/user/errors/UserPasswordRequiredError.js";

export class LoginDTO {
    #name;
    #password;

    constructor({ name, password }) {
        if (!name || name.trim().length === 0)
            throw new UserNameRequiredError();
        if (!password || password.trim().length === 0)
            throw new UserPasswordRequiredError();

        this.#name = name;
        this.#password = password;
    }

    getName() {
        return this.#name;
    }

    getPassword() {
        return this.#password;
    }
}
