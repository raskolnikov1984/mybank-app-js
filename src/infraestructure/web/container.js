import { LocalStorageAccountRepository } from "../repositories/LocalStorageAccountRepository.js";
import { LocalStorageRegistrationRequestRepository } from "../repositories/LocalStorageRegistrationRequestRepository.js";
import { LocalStorageUserRepository } from "../repositories/LocalStorageUserRepository.js";
import { CreateManagerUseCase } from "../../application/use-cases/CreateManagerUseCase.js";
import { RegisterUserUseCase } from "../../application/use-cases/RegisterUserUseCase.js";
import { LoginUseCase } from "../../application/use-cases/LoginUseCase.js";
import { WithdrawUseCase } from "../../application/use-cases/WithdrawUseCase.js";
import { DepositUseCase } from "../../application/use-cases/DepositUseCase.js";
import { GetBalanceUseCase } from "../../application/use-cases/GetBalanceUseCase.js";
import { GetMovementsUseCase } from "../../application/use-cases/GetMovementsUseCase.js";
import { SubmitRegistrationRequestUseCase } from "../../application/use-cases/SubmitRegistrationRequestUseCase.js";
import { ListRegistrationRequestsUseCase } from "../../application/use-cases/ListRegistrationRequestsUseCase.js";
import { ApproveRegistrationRequestUseCase } from "../../application/use-cases/ApproveRegistrationRequestUseCase.js";
import { RejectRegistrationRequestUseCase } from "../../application/use-cases/RejectRegistrationRequestUseCase.js";
import { GetLoginStatusUseCase } from "../../application/use-cases/GetLoginStatusUseCase.js";
import { ListUsersUseCase } from "../../application/use-cases/ListUsersUseCase.js";
import { ChangeUserPasswordUseCase } from "../../application/use-cases/ChangeUserPasswordUseCase.js";
import { UnlockUserUseCase } from "../../application/use-cases/UnlockUserUseCase.js";
import { DeleteUserUseCase } from "../../application/use-cases/DeleteUserUseCase.js";
import { TransferUseCase } from "../../application/use-cases/TransferUseCase.js";
import { ListTransferRecipientsUseCase } from "../../application/use-cases/ListTransferRecipientsUseCase.js";
import { PurchaseUseCase } from "../../application/use-cases/PurchaseUseCase.js";
import { QuoteInstallmentsUseCase } from "../../application/use-cases/QuoteInstallmentsUseCase.js";
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
    const requests = new LocalStorageRegistrationRequestRepository(window.localStorage);
    const registerUser = new RegisterUserUseCase(users, accounts);

    new CreateManagerUseCase(users, accounts).execute();

    container = {
        register: registerUser,
        login: new LoginUseCase(users),
        getLoginStatus: new GetLoginStatusUseCase(users),
        withdraw: new WithdrawUseCase(accounts),
        deposit: new DepositUseCase(accounts),
        getBalance: new GetBalanceUseCase(accounts),
        getMovements: new GetMovementsUseCase(accounts),
        purchase: new PurchaseUseCase(accounts),
        quoteInstallments: new QuoteInstallmentsUseCase(),
        transfer: new TransferUseCase(users, accounts),
        listTransferRecipients: new ListTransferRecipientsUseCase(users),
        applyMonthlyStatement: new ApplyMonthlyStatementUseCase(accounts),
        listUsers: new ListUsersUseCase(users),
        changePassword: new ChangeUserPasswordUseCase(users),
        unlockUser: new UnlockUserUseCase(users),
        deleteUser: new DeleteUserUseCase(users, accounts),
        submitRegistrationRequest: new SubmitRegistrationRequestUseCase(users, requests),
        listRegistrationRequests: new ListRegistrationRequestsUseCase(requests),
        approveRegistrationRequest: new ApproveRegistrationRequestUseCase(requests, registerUser),
        rejectRegistrationRequest: new RejectRegistrationRequestUseCase(requests),
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
