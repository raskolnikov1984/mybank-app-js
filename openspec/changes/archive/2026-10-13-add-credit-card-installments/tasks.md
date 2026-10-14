# Tasks

## 1. Dominio: cálculo de cuotas y errores

- [x] 1.1 Crear `InstallmentPlan.quote` con la tabla de tasas, la validación del plazo (entero 1–36) y la fórmula de la cuota con redondeo; verificar con tests unitarios de los escenarios del spec: 177924/1067544 a 6 cuotas, 96310/1155720 a 12, 207648/622944 a 3, 500000/1000000 a 2 cuotas, total exacto 100001 a 2 cuotas, bordes de tasa en 2, 3, 6, 7 y 36 cuotas, y plazos 0, -1, 2,5 y 37 rechazados
- [x] 1.2 Crear `InvalidInstallmentsError` e `InstallmentsNotSupportedError`; verificar con tests unitarios de nombre, código y mensaje, como los demás errores de dominio

## 2. Dominio: movimientos con cuotas y tarjeta

- [x] 2.1 Agregar `MovementType.INSTALLMENT_PURCHASE` y datos opcionales de cuotas a `Movement`, y extender `toSnapshot`/`restoreState` con campos opcionales; verificar con tests de que los movimientos sin cuotas siguen igual, los de cuotas se restauran con cuotas, cuota y total, y un snapshot antiguo sin esos campos carga
- [x] 2.2 Agregar `supportsInstallments()` y `purchaseInInstallments()` a `Account` (rechazo por defecto) e implementarlo en `CreditCard`; quitar el estado mensual de la tarjeta (`supportsMonthlyStatement` false, sin 2 %); verificar con tests de: deuda 1067544 y cupo 932456 tras comprar 1000000 a 6 cuotas, rechazo por cupo cuando el total supera el límite sin cambiar la deuda, compra de 2000000 a 2 cuotas aceptada, consignación que reduce la deuda, y rechazo en ahorros y corriente sin cambios
- [x] 2.3 Actualizar los tests existentes que asumen el 2 % mensual (`CreditCard`, `AccountPolymorphism`, `SavingsAccount`, `CheckingAccount` y similares) y verificar con `npm test` que pasan

## 3. Aplicación

- [x] 3.1 Crear `PurchaseDTO` y `PurchaseUseCase` (devuelve compra, deuda y cupo disponible) y `QuoteInstallmentsUseCase`; verificar con tests de aplicación: compra exitosa con resultado completo, cliente inexistente, producto sin cuotas, monto y plazo inválidos, rechazo por cupo y que la cotización no modifica ninguna cuenta
- [x] 3.2 Exponer `supportsInstallments` en `GetBalanceUseCase`, actualizar `ApplyMonthlyStatementUseCase` y sus tests para que la tarjeta también se rechace; verificar con tests de los escenarios "Credit card client" y "Same call, different outcome" del spec de `monthly-statement`

## 4. Infraestructura web y persistencia

- [x] 4.1 Registrar `purchase` y `quoteInstallments` en `getContainer()`, agregar la etiqueta de la compra a cuotas en `format.js` y los mensajes de los dos errores nuevos en `errorMessages.js`; verificar con los tests de `format` y `errorMessages` ampliados
- [x] 4.2 Verificar con un test de repositorios `localStorage` que, tras una compra a cuotas y una recarga, el movimiento conserva cuotas, cuota mensual, total, monto y fecha

## 5. Interfaz

- [ ] 5.1 Agregar a `app/(panel)/cliente/page.js` la sección "Compra a cuotas" solo para tarjetas, con vista previa de tasa, cuota y total, y la columna "Cuota mensual" en los movimientos; verificar ejecutando `npm run dev` con un cliente de tarjeta: la vista previa coincide con el spec, la compra actualiza deuda y cupo, el historial muestra la cuota, y ahorros y corriente no ven el formulario
- [x] 5.2 Actualizar los textos de la tarjeta en `app/content/bank.js` con las tasas por plazo y el test `bankContent`; verificar con `npm test` y que la landing muestra las tres condiciones de tasa
- [x] 5.3 Ejecutar `npm test` y `npm run build` y verificar que pasan sin errores

## 6. Documentación

- [x] 6.1 Actualizar README (reglas de la tarjeta, operaciones del cliente) y `docs/UML-Diagram.mmd` con `InstallmentPlan`, los casos de uso, errores y datos de `Movement`; verificar que el diagrama renderiza con mermaid-cli
