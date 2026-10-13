import { InMemoryUserRepository } from "./infraestructure/repositories/InMemoryUserRepository.js";
import { InMemoryAccountRepository } from "./infraestructure/repositories/InMemoryAccountRepository.js";
import { RegisterUserUseCase } from "./application/use-cases/RegisterUserUseCase.js";
import { CreateManagerUseCase } from "./application/use-cases/CreateManagerUseCase.js";
import { GetLoginStatusUseCase } from "./application/use-cases/GetLoginStatusUseCase.js";
import { MAX_LOGIN_ATTEMPTS } from "./domain/aggregates/user/entities/User.js";
import { IdentificationType } from "./domain/aggregates/user/value-objects/IdentificationType.js";
import { LoginUseCase } from "./application/use-cases/LoginUseCase.js";
import { WithdrawUseCase } from "./application/use-cases/WithdrawUseCase.js";
import { DepositUseCase } from "./application/use-cases/DepositUseCase.js";
import { GetBalanceUseCase } from "./application/use-cases/GetBalanceUseCase.js";
import { ApplyMonthlyStatementUseCase } from "./application/use-cases/ApplyMonthlyStatementUseCase.js";
import { ListUsersUseCase } from "./application/use-cases/ListUsersUseCase.js";
import { ChangeUserPasswordUseCase } from "./application/use-cases/ChangeUserPasswordUseCase.js";
import { UnlockUserUseCase } from "./application/use-cases/UnlockUserUseCase.js";
import { DeleteUserUseCase } from "./application/use-cases/DeleteUserUseCase.js";
import { AccountType } from "./domain/aggregates/account/value-objects/AccountType.js";
import { GetMovementsUseCase } from "./application/use-cases/GetMovementsUseCase.js";
import { ConsolePrompt } from "./infraestructure/ui/ConsolePrompt.js";
import { AccountLockedError } from "./domain/aggregates/user/errors/AccountLockedError.js";
import { UserNotFoundError } from "./domain/aggregates/user/errors/UserNotFoundError.js";
import { UserRole } from "./domain/aggregates/user/value-objects/UserRole.js";


const userRepository = new InMemoryUserRepository();
const accountRepository = new InMemoryAccountRepository();

const registerUseCase = new RegisterUserUseCase(userRepository, accountRepository);
const createManagerUseCase = new CreateManagerUseCase(userRepository, accountRepository);
const loginUseCase = new LoginUseCase(userRepository);
const getLoginStatusUseCase = new GetLoginStatusUseCase(userRepository);
const withdrawUseCase = new WithdrawUseCase(accountRepository);
const depositUseCase = new DepositUseCase(accountRepository);
const getBalanceUseCase = new GetBalanceUseCase(accountRepository);
const getMovementsUseCase = new GetMovementsUseCase(accountRepository);
const applyMonthlyStatementUseCase = new ApplyMonthlyStatementUseCase(accountRepository);
const listUsersUseCase = new ListUsersUseCase(userRepository);
const changePasswordUseCase = new ChangeUserPasswordUseCase(userRepository);
const unlockUserUseCase = new UnlockUserUseCase(userRepository);
const deleteUserUseCase = new DeleteUserUseCase(userRepository, accountRepository);

const ui = new ConsolePrompt();

function showMainMenu() {
    ui.show("\n===========================");
    ui.show("   Banco Mi Plata");
    ui.show("===========================");
    ui.show("  1. Iniciar Sesión");
    ui.show("  2. Salir");
    ui.show("===========================");
}

function showManagerMenu() {
    ui.show("\n---------------------------");
    ui.show("   Menú de Gestión");
    ui.show("---------------------------");
    ui.show("  1. Registrar Cliente");
    ui.show("  2. Listar Clientes");
    ui.show("  3. Cambiar Contraseña");
    ui.show("  4. Desbloquear Cliente");
    ui.show("  5. Eliminar Cliente");
    ui.show("  6. Cerrar Sesión");
    ui.show("---------------------------");
}

function showTransactionMenu() {
    ui.show("\n---------------------------");
    ui.show("   Menú de Transacciones");
    ui.show("---------------------------");
    ui.show("  1. Retirar Dinero");
    ui.show("  2. Consignar Dinero");
    ui.show("  3. Consultar Saldo");
    ui.show("  4. Consultar Movimientos");
    ui.show("  5. Estado Mensual");
    ui.show("  6. Cerrar Sesión");
    ui.show("---------------------------");
}

const ACCOUNT_TYPE_OPTIONS = {
    "1": AccountType.SAVINGS,
    "2": AccountType.CHECKING,
    "3": AccountType.CREDIT_CARD,
};

const MOVEMENT_LABELS = {
    DEPOSIT: "Consignación",
    WITHDRAW: "Retiro",
    INTEREST: "Intereses",
};

function formatMoney(money) {
    return `$${money.getAmount().toLocaleString("es-CO")}`;
}

const IDENTIFICATION_OPTIONS = {
    "1": IdentificationType.CEDULA,
    "2": IdentificationType.PASSPORT,
};

const IDENTIFICATION_LABELS = {
    [IdentificationType.CEDULA]: "Cédula",
    [IdentificationType.PASSPORT]: "Pasaporte",
};

async function register() {
    ui.show("\n--- Registro de Nuevo Cliente ---");

    ui.show("Tipo de identificación: 1. Cédula  2. Pasaporte");
    const identificationType = IDENTIFICATION_OPTIONS[await ui.ask("Seleccione el tipo de identificación: ")];

    if (!identificationType) {
        ui.showError("Tipo de identificación no válido.");
        return;
    }

    const identificationNumber = await ui.ask("Número de identificación: ");
    const fullName = await ui.ask("Nombre completo: ");
    const phone = await ui.ask("Celular: ");
    const name = await ui.ask("Nombre de usuario: ");
    const password = await ui.ask("Contraseña: ");
    const confirmPassword = await ui.ask("Confirmar contraseña: ");
    ui.show("Tipo de producto: 1. Cuenta de Ahorros  2. Cuenta Corriente  3. Tarjeta de Crédito");
    const accountType = ACCOUNT_TYPE_OPTIONS[await ui.ask("Seleccione el tipo: ")];

    if (!accountType) {
        ui.showError("Tipo de producto no válido.");
        return;
    }

    let balance;
    if (accountType !== AccountType.CREDIT_CARD) {
        const balanceStr = await ui.ask("Saldo inicial: ");
        balance = parseFloat(balanceStr);

        if (isNaN(balance) || balance <= 0) {
            ui.showError("El saldo inicial debe ser un número mayor a 0.");
            return;
        }
    }

    try {
        const result = registerUseCase.execute({
            name,
            password,
            confirmPassword,
            initialBalance: balance,
            accountType,
            identificationType,
            identificationNumber,
            fullName,
            phone,
        });
        ui.show(`\n✔ Registro exitoso. Bienvenido, ${result.name}.`);
    } catch (error) {
        ui.showError(error.message);
    }
}

function listClients() {
    const { users } = listUsersUseCase.execute();

    ui.show("\n--- Clientes ---");

    if (users.length === 0) {
        ui.show("No hay clientes registrados.");
        return;
    }

    users.forEach((user, i) => {
        const status = user.isLocked ? "Bloqueado" : "Activo";
        const identity = user.fullName
            ? `${user.fullName} - ${IDENTIFICATION_LABELS[user.identificationType]} ${user.identification} - Cel. ${user.phone}`
            : "sin datos de identidad";
        ui.show(`  ${i + 1}. ${user.name} [${status}] ${identity}`);
        ui.show(`     ${user.summary}`);
    });
}

async function changePassword() {
    ui.show("\n--- Cambiar Contraseña ---");

    const name = await ui.ask("Usuario: ");
    const newPassword = await ui.ask("Nueva contraseña: ");

    try {
        changePasswordUseCase.execute({ name, newPassword });
        ui.show(`\n✔ Contraseña de ${name} actualizada.`);
    } catch (error) {
        ui.showError(error.message);
    }
}

async function unlockClient() {
    ui.show("\n--- Desbloquear Cliente ---");

    const name = await ui.ask("Usuario: ");

    try {
        unlockUserUseCase.execute({ name });
        ui.show(`\n✔ Usuario ${name} desbloqueado.`);
    } catch (error) {
        ui.showError(error.message);
    }
}

async function deleteClient() {
    ui.show("\n--- Eliminar Cliente ---");

    const name = await ui.ask("Usuario a eliminar: ");
    const answer = await ui.ask(`¿Eliminar al usuario ${name}? No se puede deshacer. Escriba SI para confirmar: `);

    if (answer.trim() !== "SI") {
        ui.show("\nEliminación cancelada.");
        return;
    }

    try {
        deleteUserUseCase.execute({ name, confirmed: true });
        ui.show(`\n✔ Usuario ${name} eliminado.`);
    } catch (error) {
        ui.showError(error.message);
    }
}

function showAttempts(name) {
    const status = getLoginStatusUseCase.execute({ name });
    const remaining = status.exists ? status.remainingAttempts : MAX_LOGIN_ATTEMPTS;
    const max = status.exists ? status.maxAttempts : MAX_LOGIN_ATTEMPTS;

    ui.show(`Intentos restantes: ${remaining} de ${max}`);

    return status;
}

async function login() {
    ui.show("\n--- Iniciar Sesión ---");

    while (true) {
        const name = await ui.ask("Nombre de usuario: ");
        showAttempts(name);
        const password = await ui.ask("Contraseña: ");

        try {
            const { user } = loginUseCase.execute({ name, password });
            ui.show(`\n✔ Bienvenido, ${user.getName()}.`);
            if (user.getRole() === UserRole.GERENTE)
                await managerLoop();
            else
                await transactionLoop(user);
            return;
        } catch (error) {
            ui.showError(error.message);

            if (error instanceof UserNotFoundError || error instanceof AccountLockedError)
                return;

            showAttempts(name);
        }
    }
}

async function managerLoop() {
    let running = true;

    while (running) {
        showManagerMenu();
        const option = await ui.ask("Seleccione una opción: ");

        switch (option) {
            case "1":
                await register();
                break;
            case "2":
                listClients();
                break;
            case "3":
                await changePassword();
                break;
            case "4":
                await unlockClient();
                break;
            case "5":
                await deleteClient();
                break;
            case "6":
                ui.show("\nSesión cerrada correctamente.");
                running = false;
                break;
            default:
                ui.showError("Opción no válida. Intente de nuevo.");
        }
    }
}

async function transactionLoop(user) {
    const accountId = user.getName();
    let running = true;

    while (running) {
        showTransactionMenu();
        const option = await ui.ask("Seleccione una opción: ");

        switch (option) {
            case "1":
                await withdraw(accountId);
                break;
            case "2":
                await deposit(accountId);
                break;
            case "3":
                await showBalance(accountId);
                break;
            case "4":
                await showMovements(accountId);
                break;
            case "5":
                await showMonthlyStatement(accountId);
                break;
            case "6":
                ui.show("\nSesión cerrada correctamente.");
                running = false;
                break;
            default:
                ui.showError("Opción no válida. Intente de nuevo.");
        }
    }
}

async function withdraw(accountId) {
    ui.show("\n--- Retirar Dinero ---");
    const amountStr = await ui.ask("Monto a retirar: $");
    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount <= 0) {
        ui.showError("El monto debe ser un número mayor a 0.");
        return;
    }

    try {
        withdrawUseCase.execute({ accountId, amount });
        ui.show(`\n✔ Retiro exitoso. ${getBalanceUseCase.execute(accountId).summary}`);
    } catch (error) {
        ui.showError(error.message);
    }
}

async function deposit(accountId) {
    ui.show("\n--- Consignar Dinero ---");
    const amountStr = await ui.ask("Monto a consignar: $");
    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount <= 0) {
        ui.showError("El monto debe ser un número mayor a 0.");
        return;
    }

    try {
        depositUseCase.execute({ accountId, amount });
        ui.show(`\n✔ Consignación exitosa. ${getBalanceUseCase.execute(accountId).summary}`);
    } catch (error) {
        ui.showError(error.message);
    }
}

async function showBalance(accountId) {
    try {
        const { summary } = getBalanceUseCase.execute(accountId);
        ui.show(`\n--- Consulta de Saldo ---`);
        ui.show(summary);
    } catch (error) {
        ui.showError(error.message);
    }
}

async function showMovements(accountId) {
    try {
        const { movements } = getMovementsUseCase.execute(accountId);

        ui.show("\n--- Historial de Movimientos ---");

        if (movements.length === 0) {
            ui.show("No hay movimientos registrados.");
            return;
        }

        movements.forEach((m, i) => {
            const type = MOVEMENT_LABELS[m.getType()] ?? m.getType();
            const amount = m.getAmount().getAmount().toLocaleString("es-CO");
            const date = m.getDate().toLocaleString("es-CO");
            ui.show(`  ${i + 1}. [${date}] ${type}: $${amount}`);
        });
    } catch (error) {
        ui.showError(error.message);
    }
}

async function showMonthlyStatement(accountId) {
    try {
        if (!getBalanceUseCase.execute(accountId).supportsMonthlyStatement) {
            ui.show("\nSu producto no tiene estado mensual.");
            return;
        }

        const { statement } = applyMonthlyStatementUseCase.execute(accountId);

        ui.show("\n--- Estado Mensual ---");
        ui.show(`Producto: ${statement.typeName}`);
        ui.show(`Intereses: ${formatMoney(statement.interest)}`);
        ui.show(getBalanceUseCase.execute(accountId).summary);
    } catch (error) {
        ui.showError(error.message);
    }
}

async function main() {
    ui.show("\n=======================================");
    ui.show("   Bienvenido al Banco Mi Plata");
    ui.show("=======================================");

    createManagerUseCase.execute();

    let running = true;

    while (running) {
        showMainMenu();
        const option = await ui.ask("Seleccione una opción: ");

        switch (option) {
            case "1":
                await login();
                break;
            case "2":
                ui.show("\n¡Gracias por usar el Banco Mi Plata! Hasta pronto.");
                running = false;
                break;
            default:
                ui.showError("Opción no válida. Intente de nuevo.");
        }
    }

    ui.close();
}

main().catch((error) => {
    console.error("Error inesperado:", error.message);
    ui.close();
    process.exit(1);
});
