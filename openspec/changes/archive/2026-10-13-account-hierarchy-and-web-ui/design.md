# Design

## Context

Estado actual (ver proposal.md): arquitectura hexagonal/DDD en ESM. `Account` tiene `#balance` (`Money`, nunca negativo) y `#movements`; `User` guarda su `Account` y estado de bloqueo en campos `#`. Los repositorios son clases base con `findByName/save/exists` y `findById/save(id, account)`, con implementaciones in-memory. Los use cases son síncronos. `Account` se instancia directamente en `RegisterUserUseCase`, `CreateManagerUseCase` y en `tests/unit/account.test.js`, `user.test.js` y tests de use cases. `Money` no admite montos negativos. Solo `ConsolePrompt` usa `node:*`.

## Goals / Non-Goals

**Goals:**
- Que cada pilar de la POO tenga un lugar claro y señalable en el código.
- Reutilizar dominio, casos de uso, DTOs y puertos tal cual desde Next.js (alias `@/*` → `src/*`).
- Mantener la consola funcionando.

**Non-Goals:**
- Backend, base de datos o autenticación real; las contraseñas siguen en texto plano como hoy (proyecto académico).
- Transferencias entre cuentas, múltiples productos por cliente, multi-moneda.
- Migrar a TypeScript o renombrar la carpeta `infraestructure`.

## Decisions

1. **Una sola mecánica de "crédito en uso" en la base.** Como `Money` no puede ser negativo, el sobregiro y la deuda de tarjeta no se modelan con saldo negativo. `Account` guarda `#balance` y `#creditUsed` (ambos `Money`) y define el algoritmo de `withdrawFunds` como *template method*: valida el monto, calcula `disponible = balance + creditLimit() - creditUsed`, rechaza si no alcanza, consume primero el saldo y luego crédito. `depositFunds` abona primero a `creditUsed` y el resto al saldo. Las subclases solo redefinen el hook polimórfico `creditLimit()` (0 en ahorros, límite de sobregiro en corriente, cupo en tarjeta) y el error que lanzan (`CreditLimitExceededError` para tarjeta, `AccountNotEnoughtFundsError` para el resto vía hook `insufficientFundsError()`).
   *Alternativa descartada*: permitir `Money` negativo — rompe un invariante y tests existentes; *o* sobrescribir `withdrawFunds` completo en cada subclase — duplica validaciones y los `#` de la base no son accesibles.
2. **Abstracción con `new.target`.** `Account` lanza error si `new.target === Account` y si una subclase no implementa los hooks abstractos (`accountType()`, `creditLimit()`, `monthlyStatement()`). Se mantiene `getBalance()`/`getMovements()`; se añaden `getCreditUsed()`, `getAvailableFunds()`. `getMovements()` devuelve una copia para cumplir el requisito de encapsulamiento.
3. **Constructor de la base con saldo mínimo configurable.** `Account` sigue exigiendo saldo inicial > 0 (tests existentes); `CreditCard` inicia en `Money(0)` por lo que la base recibe `{ allowZeroInitialBalance }` como segundo argumento que solo la tarjeta activa.
4. **Reglas numéricas como constantes por clase** (ajustables): ahorros 1 % mensual; corriente sobregiro 500 000, comisión 10 000, interés de sobregiro 3 %; tarjeta cupo 2 000 000, interés 2 % sobre deuda. Moneda COP por defecto. Los intereses se redondean con `Math.round`.
5. **`monthlyStatement()` devuelve un objeto plano** `{ type, interest, fee, balance, creditUsed }` y registra `Movement`s (se amplía `MovementType` con `INTEREST` y `FEE`). `ApplyMonthlyStatementUseCase` busca la cuenta por id y delega sin `instanceof`.
6. **`AccountFactory`** (dominio): `AccountFactory.create(type, initialBalance)` con `AccountType` congelado (`SAVINGS`, `CHECKING`, `CREDIT_CARD`). `RegisterUserDTO` agrega `accountType` (por defecto `SAVINGS`) y relaja `initialBalance` solo para tarjeta. `CreateManagerUseCase` usa `SavingsAccount` (saldo 1, como hoy).
7. **Persistencia: snapshots explícitos, sin romper `#`.** `Account` expone `toSnapshot()` (`type`, balance, creditUsed, movimientos) y `AccountFactory.restore(snapshot)` reconstruye la subclase; `User` expone `toSnapshot()`/`User.restore(snapshot)` incluyendo intentos fallidos y bloqueo. Los repos `LocalStorage*` serializan solo esos snapshots en JSON (claves `mi-plata:users`, `mi-plata:accounts`). Se guardan por el id/nombre ya usado en los puertos. Los `Movement` se serializan con tipo, monto y fecha.
   Los repos mantienen un caché de instancias para que `User.getAccount()` y `AccountRepository.findById()` devuelvan el mismo objeto tras recargar. `LoginUseCase` guarda al usuario tras cada intento de autenticación (éxito o fallo) para que los intentos fallidos y el bloqueo persistan. `Account.restoreState` es un hook solo de restauración usado por `AccountFactory.restore`.
   *Alternativa descartada*: serializar con `JSON.stringify` directo — los campos `#` no se serializan.
8. **Next.js: App Router en la raíz, todo Client Component.** `app/layout.js`, `app/page.js` (login), `app/cliente/page.js`, `app/gerente/page.js`. `src/infraestructure/web/container.js` crea una sola vez repos y use cases (singleton perezoso, solo en cliente), siembra el gerente y expone helpers de sesión (`sessionStorage`, clave `mi-plata:session`). Un componente `AuthGuard` redirige según rol. Se usa `useEffect` para tocar `localStorage` y así evitar errores de hidratación.
   *Alternativa descartada*: Server Actions + repos en memoria — el usuario eligió localStorage.
9. **Alias y tooling.** `jsconfig.json` con `@/*`; las importaciones relativas con extensión `.js` del dominio siguen funcionando con Next. `vitest.config.js` excluye `.next/` y `app/` de la búsqueda de tests. Scripts: `dev`, `build`, `start:web` (`next start`); `start` sigue siendo la consola.
10. **Mensajes de error en la UI.** Se mapean por `errorCode()` de `DomainError` a texto en español en un único módulo (`src/infraestructure/web/errorMessages.js`); códigos desconocidos caen al `message` del error.
11. **Documentación de pilares.** `README.md` incluye una tabla pilar → archivo/clase (abstracción: `Account`, `AccountFactory`; encapsulamiento: campos `#`; herencia: `SavingsAccount/CheckingAccount/CreditCard extends Account`; polimorfismo: `creditLimit()`, `monthlyStatement()`, `describe()`), y equivalencias con los nombres del enunciado.

## Risks / Trade-offs

- [Tests existentes usan `new Account(...)`] → migrarlos a `SavingsAccount` conservando los mismos casos; la regla "saldo inicial positivo" se mantiene.
- [`localStorage` solo existe en el navegador; Next renderiza en servidor] → todo acceso en `useEffect`/handlers, nunca a nivel de módulo; el container se crea de forma perezosa.
- [Contraseñas en texto plano en `localStorage`] → aceptado por alcance académico; se documenta en el README como limitación.
- [Snapshots de `User` exponen estado de bloqueo] → métodos `toSnapshot/restore` documentados como único punto de persistencia; el resto sigue encapsulado.
- [Cambiar el esquema guardado deja datos viejos incompatibles] → clave versionada (`mi-plata:v1:*`); si el parseo falla se ignora y se siembra de nuevo.
- [Redondeo de intereses puede dar diferencias de pesos] → `Math.round` y constantes documentadas; los specs usan montos exactos.

## Migration Plan

1. Refactor de `Account` + subclases + tests (con la consola aún usando `SavingsAccount`).
2. Fábrica, DTO, use cases y consola.
3. Snapshots + repos LocalStorage.
4. Aplicación Next.js.
5. Docs/UML. Rollback: revertir el change en git; no hay datos persistentes de producción.
