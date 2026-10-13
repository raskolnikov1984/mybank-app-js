# Tasks

## 1. Ahorros: interés al retirar

- [x] 1.1 Sobrescribir `withdrawFunds` en `SavingsAccount` (validar monto, interés 1,5 % redondeado, verificar saldo + interés antes de mutar, acreditar `INTEREST` y retirar) y quitar su `monthlyStatement`; verificar con `tests/unit/SavingsAccount.test.js` cubriendo los escenarios del spec (100000 retira 40000 → 61500 con movimientos INTEREST, WITHDRAW; retira 101500 → saldo 0; retira 101501 → error sin cambios ni movimientos; monto 0 → error sin interés)
- [x] 1.2 Actualizar `tests/unit/account.test.js` (comportamiento compartido vía `SavingsAccount`) y `tests/unit/Snapshots.test.js` a las nuevas cifras de retiro; verificar con `npm test` sin fallos en esos archivos

## 2. Corriente: sobregiro del 20 % sin intereses

- [x] 2.1 Cambiar `CheckingAccount.creditLimit()` a 20 % del saldo actual, eliminar comisión, interés de sobregiro y `monthlyStatement`, y ajustar `describe()`; verificar con `tests/unit/CheckingAccount.test.js` (1000000 retira 1200000 → saldo 0 y sobregiro 200000; retira 1200001 → error; retira 400000 → sin sobregiro; sobregiro 1100000 + retiro de 1 → error; depósito repaga primero)
- [x] 2.2 Eliminar `MovementType.FEE` de `Movement.js` y sus etiquetas en `src/infraestructure/web/format.js` y `src/main.js`; verificar con `grep -rn "FEE" src app tests` sin resultados y `npm test` en verde

## 3. Estado mensual opcional

- [x] 3.1 Crear `MonthlyStatementNotSupportedError` (extiende `DomainError`, con `errorCode()`), añadir `supportsMonthlyStatement()` a `Account` (false) con `monthlyStatement()` que lanza ese error y sobrescribirlo en `CreditCard` (true); verificar con tests del error (estilo `CreditLimitExceededError.test.js`), `tests/unit/CreditCard.test.js` y `AccountPolymorphism.test.js` (misma llamada: tarjeta responde, ahorros y corriente lanzan el error)
- [x] 3.2 Devolver `supportsMonthlyStatement` en `GetBalanceUseCase` y traducir el nuevo código en `errorMessages.js`; verificar con tests de `GetBalanceUseCase` (nuevo, en `tests/unit/application/`) y `errorMessages.test.js`
- [x] 3.3 Actualizar `tests/unit/application/ApplyMonthlyStatementUseCase.test.js` para los escenarios del spec (tarjeta con deuda 500000 → interés 10000; ahorros y corriente rechazados sin cambios); verificar con `npm test`

## 4. Web y consola

- [x] 4.1 Mostrar la tarjeta "Estado mensual" en `app/cliente/page.js` solo si `supportsMonthlyStatement`; verificar en navegador (`npm run dev`) con un cliente de cada tipo: ahorros y corriente sin la tarjeta, tarjeta de crédito con ella
- [x] 4.2 Ajustar `src/main.js` para mostrar "Su producto no tiene estado mensual." sin ejecutar el caso de uso cuando no aplica; verificar ejecutando `npm start` con un cliente de ahorros (retiro de 40000 sobre 100000 muestra saldo 61500; opción 5 muestra el aviso) y con una tarjeta (opción 5 aplica interés)
- [x] 4.3 Repetir el recorrido de navegador del change anterior con las reglas nuevas (movimientos INTEREST y WITHDRAW en ahorros, 1.200.000 en corriente, persistencia tras recargar) en `npm run dev` y `npm run build && npm run start:web`; verificar sin errores de hidratación en consola

## 5. Documentación e integración final

- [x] 5.1 Actualizar la tabla "Products" y los pilares (polimorfismo) de `README.md` y las clases de `docs/UML-Diagram.mmd` (`supportsMonthlyStatement`, sin comisión); verificar que el diagrama Mermaid renderiza y que el README coincide con las cifras del spec
- [x] 5.2 Pasada final: `npm test` en verde, `openspec validate account-business-rules` y revisión de que no quedan referencias a 500000, 10000 de comisión o 1 % de estado mensual (`grep -rn "500000\|MANAGEMENT_FEE\|0.01" src app README.md`)
