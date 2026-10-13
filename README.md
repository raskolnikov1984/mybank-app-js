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
- Passwords are stored in plain text, both in memory and in `localStorage` (academic project, no real authentication).
- Registering a name that already exists replaces that user.
