# Design

## Context

Hoy `Account` implementa `withdrawFunds`/`depositFunds` como template method con `#balance`, `#creditUsed` y los hooks `creditLimit()`, `accountType()`, `typeName()`, `monthlyStatement()` y `describe()`. `SavingsAccount` (límite de crédito 0, 1 % en estado mensual) y `CheckingAccount` (límite fijo 500.000, comisión 10.000, interés de sobregiro 3 %) lo especializan. `GetBalanceUseCase` devuelve `summary`, `creditUsed` y `availableCredit`; la UI web (`app/cliente/page.js`) y la consola siempre muestran el estado mensual. Ver proposal.md para la motivación y los specs delta para los requisitos.

## Goals / Non-Goals

**Goals:**
- Que ahorros y corriente cumplan exactamente las cifras del enunciado (1,5 % al retirar; 120 % del saldo para corriente).
- Que el retiro de ahorros sea atómico: o se acredita el interés y se retira, o no cambia nada.
- Que la UI no ofrezca operaciones que el producto no soporta, sin usar `instanceof`.

**Non-Goals:**
- Cambiar la tarjeta de crédito (el enunciado recibido no la define).
- Migrar datos guardados: los snapshots actuales siguen siendo válidos.
- Cálculo de interés por tiempo transcurrido.

## Decisions

1. **Ahorros: interés dentro de `withdrawFunds`.** `SavingsAccount.withdrawFunds(amount)` valida primero el monto (tipo y positividad, igual que la base), calcula `interest = round(saldo × 0,015)`, verifica `saldo + interest ≥ amount` y recién entonces acredita el interés con `_credit(interest, INTEREST)` y delega en `super.withdrawFunds(amount)`. Así un rechazo no deja interés acreditado (spec "Invalid amount credits no interest"). La constante vive en la clase (`WITHDRAWAL_INTEREST_RATE = 0.015`).
   *Alternativa descartada*: acreditar y revertir en un `catch` — deja un estado intermedio y movimientos espurios si algo falla.
2. **Corriente: límite dinámico.** `creditLimit()` devuelve `round(saldo actual × 0,20)`. El modelo existente `getAvailableFunds = saldo + max(0, límite − creditUsed)` ya da 1.200.000 con saldo 1.000.000. Tras usar sobregiro el saldo es 0, el límite es 0 y no hay más crédito hasta que un depósito repague (spec "No more overdraft once in use"). Se mantiene la regla de la base "depósito repaga `creditUsed` primero". Se eliminan `MANAGEMENT_FEE`, `OVERDRAFT_INTEREST_RATE` y `monthlyStatement`.
   *Alternativa descartada*: fijar el límite al abrir la cuenta — no coincide con "sobre su saldo actual".
3. **Estado mensual opcional por tipo.** `Account` añade `supportsMonthlyStatement()` (false) y su `monthlyStatement()` por defecto lanza `MonthlyStatementNotSupportedError` (`errorCode()` `MONTHLY_STATEMENT_NOT_SUPPORTED_ERROR`, mensaje en inglés como el resto del dominio). `CreditCard` redefine ambos. `ApplyMonthlyStatementUseCase` no cambia: propaga el error y no guarda la cuenta si falla. Como `monthlyStatement()` deja de ser abstracto, el test "abstract hooks" se ajusta (`accountType`, `creditLimit` siguen lanzando `NOT_IMPLEMENTED_METHOD`).
   *Alternativa descartada*: retornar `null`/resultado vacío — esconde el error al llamador.
4. **La UI consulta una capacidad, no un tipo.** `GetBalanceUseCase` devuelve además `supportsMonthlyStatement`. `app/cliente/page.js` renderiza la tarjeta "Estado mensual" solo si es true; `src/main.js` conserva la opción 5 del menú pero, si el producto no la soporta, muestra "Su producto no tiene estado mensual." sin llamar al caso de uso. `errorMessages.js` traduce el nuevo código (por si se llega por otra vía).
5. **Limpieza de `FEE`.** Se elimina `MovementType.FEE` y sus etiquetas (`format.js`, `main.js`). Un snapshot antiguo con movimientos `FEE` sigue cargando (el tipo es un string); la UI cae al valor crudo `FEE` con `MOVEMENT_LABELS[type] ?? type`, por lo que no se rompe.
6. **Descripción de corriente.** `describe()` muestra saldo, sobregiro usado y el cupo de sobregiro actual (`creditLimit()`), no el máximo histórico.
7. **Redondeo.** `Math.round` a pesos enteros, igual que hoy.

## Risks / Trade-offs

- [Interés acreditado aunque se retire poco] → es la lectura literal del enunciado y de la decisión del usuario; queda registrado como supuesto en proposal.md.
- [Datos ya guardados con comisión/interés de la regla anterior] → los movimientos históricos se conservan; solo cambian reglas hacia adelante. Aceptable en proyecto académico.
- [Un sobregiro parcial bloquea nuevos retiros hasta depositar] → consecuencia de "20 % sobre el saldo actual"; cubierto por escenario.
- [El menú de consola conserva la opción 5 para todos] → se prefiere un mensaje claro a un menú que cambia por tipo; se puede cambiar luego sin tocar el dominio.
- [Cobertura de `main.js` es 0 %] → la verificación de consola es manual (recorrido con entrada simulada).

## Migration Plan

1. Dominio y errores con tests. 2. Casos de uso. 3. UI web y consola. 4. Docs y recorrido en navegador. Rollback: revertir el commit; no hay migración de datos.
