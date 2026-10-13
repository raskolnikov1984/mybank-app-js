# Proposal

## Why

La sección 3 del enunciado del docente define reglas precisas para los productos: la cuenta de ahorros genera 1,5 % mensual calculado y aplicado al retirar, y la cuenta corriente no genera intereses y permite un sobregiro del 20 % sobre el saldo actual. La implementación vigente (specs `account-types`, `monthly-statement`) usa otras reglas: 1 % en un estado mensual, sobregiro fijo de 500.000, comisión de 10.000 e interés de sobregiro del 3 %.

## What Changes

- **Ahorros:** cada retiro acredita primero un interés de 1,5 % del saldo actual (movimiento `INTEREST`) y luego descuenta el monto; el retiro no puede superar saldo + interés. Si el retiro se rechaza no se acredita interés.
- **Corriente:** el límite de sobregiro pasa de 500.000 fijos a 20 % del saldo actual (saldo 1.000.000 → se puede retirar hasta 1.200.000). Se eliminan la comisión de manejo y el interés de sobregiro; no hay intereses ni comisiones.
- **Estado mensual:** ahorros y corriente dejan de tenerlo; solo la tarjeta de crédito lo conserva (2 %, sin cambios). Pedirlo para otro producto se rechaza con un nuevo error `MonthlyStatementNotSupportedError`.
- **UI:** web y consola muestran el estado mensual solo si el producto lo soporta (`supportsMonthlyStatement` en el resultado de consultar saldo).
- Se elimina el tipo de movimiento `FEE`, que deja de usarse.
- **BREAKING:** los saldos y reglas resultantes de retirar en ahorros/corriente cambian; el estado mensual de ahorros y corriente se elimina.
- Sin cambios en tarjeta de crédito (el enunciado recibido no define sus reglas).

## Capabilities

### New Capabilities
<!-- Ninguna: solo cambian capacidades existentes. -->

### Modified Capabilities
- `account-types`: reglas de retiro de ahorros (interés al retirar), sobregiro de corriente (20 % del saldo actual) y descripción por tipo.
- `monthly-statement`: se retiran los requisitos de ahorros y corriente; el caso de uso rechaza productos sin estado mensual.
- `web-client`: la operación de estado mensual solo aparece para productos que la soportan.

## Impact

- Código: `src/domain/aggregates/account/entities/{Account,SavingsAccount,CheckingAccount,CreditCard,Movement}.js`, nuevo `MonthlyStatementNotSupportedError`, `src/application/use-cases/GetBalanceUseCase.js`, `src/infraestructure/web/errorMessages.js`, `app/cliente/page.js`, `src/main.js`.
- Tests unitarios de ahorros, corriente, polimorfismo, casos de uso y mensajes de error; `README.md` y `docs/UML-Diagram.mmd`.
- Persistencia: sin cambio de esquema; los snapshots guardados en `localStorage` siguen cargando (las comisiones pasadas permanecen como movimientos históricos).
- Supuesto: el interés se acredita en cada retiro aceptado, aunque el monto sea menor que el saldo, y se redondea con `Math.round` a pesos enteros.
