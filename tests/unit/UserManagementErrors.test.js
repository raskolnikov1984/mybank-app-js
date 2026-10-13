import { describe, expect, it } from "vitest";
import { UserAlreadyExistsError } from "../../src/domain/aggregates/user/errors/UserAlreadyExistsError.js";
import { UserHasOpenBalanceError } from "../../src/domain/aggregates/user/errors/UserHasOpenBalanceError.js";
import { DeletionNotConfirmedError } from "../../src/domain/aggregates/user/errors/DeletionNotConfirmedError.js";
import { ManagerProtectedError } from "../../src/domain/aggregates/user/errors/ManagerProtectedError.js";
import { DomainError } from "../../src/domain/shared/errors/DomainError.js";

describe.each([
    [UserAlreadyExistsError, "UserAlreadyExistsError", "USER_ALREADY_EXISTS_ERROR"],
    [UserHasOpenBalanceError, "UserHasOpenBalanceError", "USER_HAS_OPEN_BALANCE_ERROR"],
    [DeletionNotConfirmedError, "DeletionNotConfirmedError", "DELETION_NOT_CONFIRMED_ERROR"],
    [ManagerProtectedError, "ManagerProtectedError", "MANAGER_PROTECTED_ERROR"],
])("%s", (ErrorClass, name, code) => {
    it("Must be a DomainError with its name and error code", () => {
        const error = new ErrorClass();

        expect(error).toBeInstanceOf(DomainError);
        expect(error.name).toBe(name);
        expect(error.errorCode()).toBe(code);
        expect(error.message.length).toBeGreaterThan(0);
    });

    it("Must allow a custom message", () => {
        expect(new ErrorClass("custom").message).toBe("custom");
    });
});
