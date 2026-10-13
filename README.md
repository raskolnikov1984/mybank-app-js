# mybank-app-js
Create an app for bank management applying concept of software engenieer like Clean Architecture, Clean Code, TDD  using tht JavaScript language.

## Domain: product hierarchy

`Account` is an abstract base class; every product the bank offers extends it.

| Enunciado (Mi Plata) | Class | File |
| --- | --- | --- |
| Cuenta (base) | `Account` (abstract) | `src/domain/aggregates/account/entities/Account.js` |
| CuentaAhorros | `SavingsAccount` | `src/domain/aggregates/account/entities/SavingsAccount.js` |
| CuentaCorriente | `CheckingAccount` | `src/domain/aggregates/account/entities/CheckingAccount.js` |
| TarjetaCredito | `CreditCard` | `src/domain/aggregates/account/entities/CreditCard.js` |
| Cliente | `User` with role `CLIENTE` | `src/domain/aggregates/user/entities/User.js` |

Products are created through `AccountFactory.create(type, initialBalance)` with a type from `AccountType` (`SAVINGS`, `CHECKING`, `CREDIT_CARD`). The class diagram is in `docs/UML-Diagram.mmd`.

## OOP pillars

| Pillar | Where it shows | Evidence |
| --- | --- | --- |
| Abstraction | `Account` models what every product has in common (balance, credit in use, movements, withdraw/deposit) and cannot be instantiated; `AccountFactory` hides which class is built. | `Account.js` (`new.target` guard, abstract hooks `accountType()`, `creditLimit()`, `describe()`), `AccountFactory.js` |
| Encapsulation | State lives in `#private` fields and changes only through `withdrawFunds`, `depositFunds` and, for products that have one, `monthlyStatement`; `getMovements()` returns a copy; persistence goes through `toSnapshot()`/`restore`. | `Account.js`, `CreditCard.js` (`#limit`), `User.js` (`#password`, `#failedAttempts`, ...), `Money.js` |
| Inheritance | `SavingsAccount`, `CheckingAccount` and `CreditCard` extend `Account` and reuse its withdraw/deposit algorithm. | `SavingsAccount.js`, `CheckingAccount.js`, `CreditCard.js` |
| Polymorphism | The same call behaves differently per type: `withdrawFunds` (credits 1.5% interest first / overdraft up to 20% of the balance / credit limit), `monthlyStatement()` (not supported / not supported / 2% interest on debt) and `describe()`. Callers never use `instanceof`. | `tests/unit/AccountPolymorphism.test.js`, `ApplyMonthlyStatementUseCase.js` |

## Products

| Product | Withdraw rule | Monthly statement |
| --- | --- | --- |
| `SavingsAccount` | Credits 1.5% of the balance as interest right before each withdrawal; the amount cannot exceed balance + interest (a rejected withdrawal credits nothing) | None |
| `CheckingAccount` | Up to 120% of the current balance (20% overdraft); no interest, no fees. Once the overdraft is in use no more is granted until deposits repay it | None |
| `CreditCard` | Up to the credit limit (2.000.000); the balance is the debt | +2% of the debt |

## User administration (CRUD)

The manager (`gerente`) administers clients from the web (`/gerente`, section "Clientes") and from the console (manager menu options 2 to 5). Administration only covers users with the client role; the manager never appears in the list and cannot be changed or deleted from here.

| Operation | Rule |
| --- | --- |
| Add | Register a client with a product type. The user name must be unique: a duplicate is rejected and never replaces the existing user |
| List | Name, product, status (active/locked) and position (balance, debt or overdraft) |
| Edit | Change the password (cannot be empty) and unlock a locked client. The name, product type and balance are not editable |
| Delete | Needs an explicit confirmation (web: confirmation step; console: type `SI`) and the product must be at zero: balance 0, no debt and no overdraft. Deleting removes the user, the product and its movements; the name can then be reused |

Use cases: `RegisterUserUseCase`, `ListUsersUseCase`, `ChangeUserPasswordUseCase`, `UnlockUserUseCase`, `DeleteUserUseCase` (in `src/application/use-cases/`).

## Client data and login attempts

Every client registered from the web (`/registro`), by the manager (`/gerente`) or from the console must provide:

| Data | Rule |
| --- | --- |
| Identification type and number | Cédula: 6 to 10 digits. Passport: 6 to 12 letters or digits, stored in uppercase. Unique among clients and pending requests (the same number with another type is a different identification) |
| Full name | 3 to 80 characters: letters (accents and ñ allowed), spaces, apostrophes, hyphens and periods |
| Mobile phone | Colombian mobile: 10 digits starting with 3 (spaces are accepted and removed) |
| User name | Unique in the system |
| Password and confirmation | Both must match; the confirmation is never stored |

Clients stored before these data existed (and the manager) keep working and are shown with "—" in the lists. Pending requests saved before this change have no identity data and are ignored when loaded (the applicant can submit them again).

**Login attempts.** After 3 failed attempts the account is blocked for 24 hours. The login form (web and console) always shows the counter "Intentos restantes: N de 3": it starts at 3 de 3, follows the typed user name when it exists, drops after every failure and reaches 0 de 3 when the account is blocked. A name that does not exist keeps showing 3 de 3, so the counter reveals nothing extra. The manager can unlock a client from the clients list.

## Web app: routes and registration requests

| Route | Access | What it is |
| --- | --- | --- |
| `/` | Public | Institutional landing page: menu, presentation, products, how to start and corporate footer |
| `/login` | Public | Login form (manager goes to `/gerente`, clients to `/cliente`) |
| `/registro` | Public | Registration **request** form (name, password, product and initial balance when it applies) |
| `/cliente` | Clients | Deposit, withdraw, balance, movements and monthly statement (credit card) |
| `/gerente` | Manager | Registration requests, client registration and client administration |

Registering from `/registro` does not create a user: it stores a pending request with the identity data of the applicant. The manager reviews it in `/gerente` ("Solicitudes de registro") and either **approves** it (the client is created with the usual registration rules and can log in with the requested password) or **rejects** it (the request is discarded and the name is free again). A request is rejected when its name already belongs to a user or to another pending request, and an approval fails, keeping the request pending, if the name was taken in the meantime. The applicant is not notified: the login says "No tiene una cuenta abierta" until the request is approved. Requests exist only in the web app; the console keeps direct registration by the manager.

All the texts of the public pages (mission, products, corporate data, social links) are in `app/content/bank.js`. The corporate data, contact details and social links are **fictional placeholders**: replace them with the real ones there.

## Running

```bash
npm install
npm test             # unit tests (vitest)
npm start            # console app
npm run dev          # web app (Next.js) at http://localhost:3000
npm run build && npm run start:web   # production build of the web app
```

Default manager: `gerente` / `admin`. In the web app all data is stored in the browser (`localStorage`), so it persists across reloads but is local to each browser. The console app keeps its data in memory.

### Limitations
- A pending registration request keeps its password in plain text in `localStorage`, like users; it is never shown to the manager.
- Passwords are stored in plain text, both in memory and in `localStorage` (academic project, no real authentication).
- A savings account only reaches zero (needed to delete its user) when the client withdraws balance + the 1.5% withdrawal interest.
- A client deleted while logged in is not logged out; their next operation fails with "No se encontró la cuenta.".
