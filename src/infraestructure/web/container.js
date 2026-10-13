import { LocalStorageAccountRepository } from "../repositories/LocalStorageAccountRepository.js";
import { LocalStorageUserRepository } from "../repositories/LocalStorageUserRepository.js";
import { CreateManagerUseCase } from "../../application/use-cases/CreateManagerUseCase.js";
import { RegisterUserUseCase } from "../../application/use-cases/RegisterUserUseCase.js";
import { LoginUseCase } from "../../application/use-cases/LoginUseCase.js";
import { WithdrawUseCase } from "../../application/use-cases/WithdrawUseCase.js";
import { DepositUseCase } from "../../application/use-cases/DepositUseCase.js";
import { GetBalanceUseCase } from "../../application/use-cases/GetBalanceUseCase.js";
import { GetMovementsUseCase } from "../../application/use-cases/GetMovementsUseCase.js";
import { ApplyMonthlyStatementUseCase } from "../../application/use-cases/ApplyMonthlyStatementUseCase.js";

export const SESSION_KEY = "mi-plata:v1:session";

let container = null;

// Composition root of the browser app. Browser-only: call it from effects or handlers, never at module level.
export function getContainer() {
    if (container)
        return container;

    if (typeof window === "undefined")
        throw new Error("The container is only available in the browser");

    const accounts = new LocalStorageAccountRepository(window.localStorage);
    const users = new LocalStorageUserRepository(accounts, window.localStorage);

    new CreateManagerUseCase(users, accounts).execute();

    container = {
        register: new RegisterUserUseCase(users, accounts),
        login: new LoginUseCase(users),
        withdraw: new WithdrawUseCase(accounts),
        deposit: new DepositUseCase(accounts),
        getBalance: new GetBalanceUseCase(accounts),
        getMovements: new GetMovementsUseCase(accounts),
        applyMonthlyStatement: new ApplyMonthlyStatementUseCase(accounts),
    };

    return container;
}

export function getSession() {
    try {
        const raw = window.sessionStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function setSession(session) {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
    window.sessionStorage.removeItem(SESSION_KEY);
}
