# Tasks

## 1. Dominio: pagos limitados a la deuda

- [x] 1.1 Crear `PaymentExceedsDebtError` (`PAYMENT_EXCEEDS_DEBT_ERROR`) y agregar `Account.assertCanDeposit` usado por `depositFunds`, extendido en `CreditCard` para rechazar pagos mayores a la deuda; verificar con tests unitarios de los escenarios del spec: 450000 con deuda 300000 rechazado sin cambios, 300000 exactos a 0, 100000 parcial, y cualquier pago con deuda 0 rechazado; y con un test del código y mensaje del error
- [x] 1.2 Actualizar los tests existentes que consignan más que la deuda en tarjetas y verificar con `npm test` que los casos de ahorros y corriente no cambian

## 2. Dominio: interés en los retiros de la tarjeta

- [x] 2.1 Sobrescribir `CreditCard.withdrawFunds` con el 2 % de interés (validar primero, registrar interés y luego el retiro o la transferencia enviada) y mostrar el saldo a favor heredado en `describe()`; verificar con tests unitarios: retiro de 300000 deja deuda 306000, cupo 1694000 y movimientos INTEREST 6000 y WITHDRAW 300000; 1980000 rechazado sin interés ni cambios; 1960784 aceptado con deuda 2000000; retiro y pago de 306000 deja deuda 0; la descripción muestra un saldo a favor de 150000 cuando existe
- [x] 2.2 Actualizar los tests existentes de la tarjeta que esperan retiros sin interés (`CreditCard`, `AccountPolymorphism`, `Snapshots`, `ApplyMonthlyStatementUseCase` y similares) y verificar con `npm test` que pasan

## 3. Aplicación: transferencias consistentes

- [x] 3.1 Hacer que `TransferUseCase` valide el depósito del destinatario antes de retirar del origen; verificar con tests de aplicación: transferir 450000 a una tarjeta con deuda 300000 se rechaza sin cambiar ninguna cuenta (también con repositorios en memoria que devuelven el mismo objeto), y transferir desde una tarjeta deja la deuda en 306000 con el interés registrado
- [x] 3.2 Verificar con un test de repositorios `localStorage` que el movimiento de interés del retiro y el rechazo del pago de más sobreviven a una recarga

## 4. Web y textos

- [ ] 4.1 Agregar el mensaje en español del error nuevo en `errorMessages.js` con su test, el aviso del 2 % en la vista de la tarjeta de `cliente/page.js` y la condición en `app/content/bank.js` con su test `bankContent`; verificar con `npm test`, `npm run build` y, ejecutando `npm run dev` con un cliente de tarjeta, que el retiro de 300000 muestra deuda 306000 e interés 6000 y que consignar 450000 con deuda 300000 muestra el mensaje sin cambiar nada

## 5. Documentación

- [x] 5.1 Actualizar README (reglas de la tarjeta) y `docs/UML-Diagram.mmd` con el error y `assertCanDeposit`; verificar que el diagrama renderiza con mermaid-cli
