import { InvalidCredentialsError } from "../errors/InvalidCredentialsError.js";
import { AccountLockedError } from "../errors/AccountLockedError.js";
import { UserNameRequiredError } from "../errors/UserNameRequiredError.js";
import { UserPasswordRequiredError } from "../errors/UserPasswordRequiredError.js";
import { InvalidAccountError } from "../errors/InvalidAccountError.js";
import { Account } from "../../account/entities/Account.js";
import { UserRole } from "../value-objects/UserRole.js";

const MAX_FAILED_ATTEMPTS = 3;
const LOCK_DURATION_MS = 24 * 60 * 60 * 1000;

export class User {
    #name;
    #password;
    #account;
    #role;
    #failedAttempts;
    #isLocked;
    #lockedAt;

    constructor(name, password, account, role = UserRole.CLIENTE) {
        if (!name || name.trim().length === 0)
            throw new UserNameRequiredError();

        if (!password || password.trim().length === 0)
            throw new UserPasswordRequiredError();

        if (!(account instanceof Account))
            throw new InvalidAccountError();

        this.#name = name;
        this.#password = password;
        this.#account = account;
        this.#role = role;
        this.#failedAttempts = 0;
        this.#isLocked = false;
        this.#lockedAt = null;
    }

    authenticate(password) {
        if (this.#isLocked) {
            if (Date.now() - this.#lockedAt >= LOCK_DURATION_MS) {
                this.#isLocked = false;
                this.#failedAttempts = 0;
                this.#lockedAt = null;
            } else {
                throw new AccountLockedError();
            }
        }

        if (password !== this.#password) {
            this.#failedAttempts++;
            if (this.#failedAttempts >= MAX_FAILED_ATTEMPTS) {
                this.#isLocked = true;
                this.#lockedAt = Date.now();
            }
            throw new InvalidCredentialsError();
        }

        this.#failedAttempts = 0;
        return true;
    }

    toSnapshot() {
        return {
            name: this.#name,
            password: this.#password,
            role: this.#role,
            failedAttempts: this.#failedAttempts,
            isLocked: this.#isLocked,
            lockedAt: this.#lockedAt,
        };
    }

    static restore(snapshot, account) {
        const user = new User(snapshot.name, snapshot.password, account, snapshot.role);
        user.#failedAttempts = snapshot.failedAttempts;
        user.#isLocked = snapshot.isLocked;
        user.#lockedAt = snapshot.lockedAt;
        return user;
    }

    getName() {
        return this.#name;
    }

    getAccount() {
        return this.#account;
    }

    getRole() {
        return this.#role;
    }

    isLocked() {
        return this.#isLocked;
    }

    getFailedAttempts() {
        return this.#failedAttempts;
    }
}
