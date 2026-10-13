import { UserNameRequiredError } from "../../user/errors/UserNameRequiredError.js";
import { UserPasswordRequiredError } from "../../user/errors/UserPasswordRequiredError.js";
import { InvalidAccountTypeError } from "../../account/errors/InvalidAccountTypeError.js";
import { AccountType } from "../../account/value-objects/AccountType.js";
import { ClientProfile } from "../../user/value-objects/ClientProfile.js";
import { InvalidIdentificationError } from "../../user/errors/InvalidIdentificationError.js";
import { AmountInvalidError } from "../../../shared/errors/AmountInvalidError.js";

// A visitor's petition to become a client. It holds data only: no user or product exists until it is approved.
export class RegistrationRequest {
    #name;
    #password;
    #accountType;
    #initialBalance;
    #profile;
    #createdAt;

    constructor({ name, password, accountType = AccountType.SAVINGS, initialBalance, profile, createdAt = new Date() }) {
        if (typeof name !== "string" || name.trim().length === 0)
            throw new UserNameRequiredError();

        if (typeof password !== "string" || password.trim().length === 0)
            throw new UserPasswordRequiredError();

        if (!(profile instanceof ClientProfile))
            throw new InvalidIdentificationError("Los datos de identidad del solicitante son obligatorios");

        if (!Object.values(AccountType).includes(accountType))
            throw new InvalidAccountTypeError(`The account type "${accountType}" is not supported`);

        const needsBalance = accountType !== AccountType.CREDIT_CARD;
        if (needsBalance && (typeof initialBalance !== "number" || !(initialBalance > 0)))
            throw new AmountInvalidError("Initial balance must be greater than zero");

        this.#name = name;
        this.#password = password;
        this.#accountType = accountType;
        this.#initialBalance = needsBalance ? initialBalance : null;
        this.#profile = profile;
        this.#createdAt = createdAt;
    }

    getName() {
        return this.#name;
    }

    getPassword() {
        return this.#password;
    }

    getAccountType() {
        return this.#accountType;
    }

    getInitialBalance() {
        return this.#initialBalance;
    }

    getProfile() {
        return this.#profile;
    }

    getCreatedAt() {
        return this.#createdAt;
    }

    toSnapshot() {
        return {
            name: this.#name,
            password: this.#password,
            accountType: this.#accountType,
            initialBalance: this.#initialBalance,
            profile: this.#profile.toSnapshot(),
            createdAt: this.#createdAt.toISOString(),
        };
    }

    static restore(snapshot) {
        return new RegistrationRequest({
            name: snapshot.name,
            password: snapshot.password,
            accountType: snapshot.accountType,
            initialBalance: snapshot.initialBalance ?? undefined,
            profile: snapshot.profile ? ClientProfile.restore(snapshot.profile) : undefined,
            createdAt: new Date(snapshot.createdAt),
        });
    }
}
