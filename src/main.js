import { InMemoryUserRepository } from "./infraestructure/repositories/InMemoryUserRepository.js";
import { InMemoryAccountRepository } from "./infraestructure/repositories/InMemoryAccountRepository.js";
import { RegisterUserUseCase } from "./application/use-cases/RegisterUserUseCase.js";
import { CreateManagerUseCase } from "./application/use-cases/CreateManagerUseCase.js";
import { LoginUseCase } from "./application/use-cases/LoginUseCase.js";
import { WithdrawUseCase } from "./application/use-cases/WithdrawUseCase.js";
import { DepositUseCase } from "./application/use-cases/DepositUseCase.js";
import { GetBalanceUseCase } from "./application/use-cases/GetBalanceUseCase.js";
import { GetMovementsUseCase } from "./application/use-cases/GetMovementsUseCase.js";
import { ConsolePrompt } from "./infraestructure/ui/ConsolePrompt.js";
import { AccountLockedError } from "./domain/aggregates/user/errors/AccountLockedError.js";
import { UserNotFoundError } from "./domain/aggregates/user/errors/UserNotFoundError.js";
import { UserRole } from "./domain/aggregates/user/value-objects/UserRole.js";

const MAX_LOGIN_ATTEMPTS = 3;

const userRepository = new InMemoryUserRepository();
const accountRepository = new InMemoryAccountRepository();

const registerUseCase = new RegisterUserUseCase(userRepository, accountRepository);
const createManagerUseCase = new CreateManagerUseCase(userRepository, accountRepository);
const loginUseCase = new LoginUseCase(userRepository);
const withdrawUseCase = new WithdrawUseCase(accountRepository);
const depositUseCase = new DepositUseCase(accountRepository);
const getBalanceUseCase = new GetBalanceUseCase(accountRepository);
const getMovementsUseCase = new GetMovementsUseCase(accountRepository);

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
    ui.show("  2. Cerrar Sesión");
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
    ui.show("  5. Cerrar Sesión");
    ui.show("---------------------------");
}

async function register() {
    ui.show("\n--- Registro de Nuevo Cliente ---");

    const name = await ui.ask("Nombre de usuario: ");
    const password = await ui.ask("Contraseña: ");
    const balanceStr = await ui.ask("Saldo inicial: ");
    const balance = parseFloat(balanceStr);

    if (isNaN(balance) || balance <= 0) {
        ui.showError("El saldo inicial debe ser un número mayor a 0.");
        return;
    }

    try {
        const result = registerUseCase.execute({ name, password, initialBalance: balance });
        ui.show(`\n✔ Registro exitoso. Bienvenido, ${result.name}.`);
    } catch (error) {
        ui.showError(error.message);
    }
}

async function login() {
    ui.show("\n--- Iniciar Sesión ---");

    let attempts = 0;
    while (attempts < MAX_LOGIN_ATTEMPTS) {
        attempts++;
        const name = await ui.ask("Nombre de usuario: ");
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
            if (error instanceof UserNotFoundError) {
                ui.showError(error.message);
                return;
            }
            if (error instanceof AccountLockedError) {
                ui.showError(error.message);
                return;
            }
            ui.showError(error.message);
            const remaining = MAX_LOGIN_ATTEMPTS - attempts;
            if (remaining > 0)
                ui.show(`Intentos restantes: ${remaining}`);
        }
    }

    ui.showError("Cuenta bloqueada por 24 horas, comunícate con tu banco");
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
        const { newBalance } = withdrawUseCase.execute({ accountId, amount });
        ui.show(`\n✔ Retiro exitoso. Nuevo saldo: $${newBalance.getAmount().toLocaleString("es-CO")}`);
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
        const { newBalance } = depositUseCase.execute({ accountId, amount });
        ui.show(`\n✔ Consignación exitosa. Nuevo saldo: $${newBalance.getAmount().toLocaleString("es-CO")}`);
    } catch (error) {
        ui.showError(error.message);
    }
}

async function showBalance(accountId) {
    try {
        const { balance } = getBalanceUseCase.execute(accountId);
        ui.show(`\n--- Consulta de Saldo ---`);
        ui.show(`Saldo actual: $${balance.getAmount().toLocaleString("es-CO")}`);
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
            const type = m.getType() === "DEPOSIT" ? "Consignación" : "Retiro";
            const amount = m.getAmount().getAmount().toLocaleString("es-CO");
            const date = m.getDate().toLocaleString("es-CO");
            ui.show(`  ${i + 1}. [${date}] ${type}: $${amount}`);
        });
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
