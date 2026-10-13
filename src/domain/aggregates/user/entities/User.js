import { InvalidCredentialsError } from "../errors/InvalidCredentialsError.js";
import { AccountLockedError } from "../errors/AccountLockedError.js";
import { UserNameRequiredError } from "../errors/UserNameRequiredError.js";
import { UserPasswordRequiredError } from "../errors/UserPasswordRequiredError.js";
import { InvalidAccountError } from "../errors/InvalidAccountError.js";
import { Account } from "../../account/entities/Account.js";
import { UserRole } from "../value-objects/UserRole.js";
import { ClientProfile } from "../value-objects/ClientProfile.js";
import { InvalidIdentificationError } from "../errors/InvalidIdentificationError.js";

export const MAX_LOGIN_ATTEMPTS = 3;
const LOCK_DURATION_MS = 24 * 60 * 60 * 1000;

export class User {
    #name;
    #password;
    #account;
    #role;
    #failedAttempts;
    #isLocked;
    #lockedAt;
    #profile;

    constructor(name, password, account, role = UserRole.CLIENTE, profile = null) {
        if (!name || name.trim().length === 0)
            throw new UserNameRequiredError();

        if (!password || password.trim().length === 0)
            throw new UserPasswordRequiredError();

        if (!(account instanceof Account))
            throw new InvalidAccountError();

        if (profile !== null && !(profile instanceof ClientProfile))
            throw new InvalidIdentificationError("Los datos de identidad del cliente no son válidos");

        this.#name = name;
        this.#password = password;
        this.#account = account;
        this.#role = role;
        this.#failedAttempts = 0;
        this.#isLocked = false;
        this.#lockedAt = null;
        this.#profile = profile;
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
            if (this.#failedAttempts >= MAX_LOGIN_ATTEMPTS) {
                this.#isLocked = true;
                this.#lockedAt = Date.now();
            }
            throw new InvalidCredentialsError();
        }

        this.#failedAttempts = 0;
        return true;
    }

    // Read-only view of the login counter. A lock older than 24 hours no longer counts.
    getLoginStatus() {
        const lockActive = this.#isLocked && Date.now() - this.#lockedAt < LOCK_DURATION_MS;

        if (lockActive)
            return { maxAttempts: MAX_LOGIN_ATTEMPTS, remainingAttempts: 0, isLocked: true };

        const failed = this.#isLocked ? 0 : this.#failedAttempts;

        return {
            maxAttempts: MAX_LOGIN_ATTEMPTS,
            remainingAttempts: Math.max(0, MAX_LOGIN_ATTEMPTS - failed),
            isLocked: false,
        };
    }

    changePassword(newPassword) {
        if (!newPassword || newPassword.trim().length === 0)
            throw new UserPasswordRequiredError();

        this.#password = newPassword;
    }

    unlock() {
        this.#isLocked = false;
        this.#failedAttempts = 0;
        this.#lockedAt = null;
    }

    toSnapshot() {
        return {
            name: this.#name,
            password: this.#password,
            role: this.#role,
            failedAttempts: this.#failedAttempts,
            isLocked: this.#isLocked,
            lockedAt: this.#lockedAt,
            profile: this.#profile ? this.#profile.toSnapshot() : null,
        };
    }

    static restore(snapshot, account) {
        const profile = snapshot.profile ? ClientProfile.restore(snapshot.profile) : null;
        const user = new User(snapshot.name, snapshot.password, account, snapshot.role, profile);
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

    getProfile() {
        return this.#profile;
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
