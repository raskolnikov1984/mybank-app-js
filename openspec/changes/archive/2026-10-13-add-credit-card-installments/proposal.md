# Proposal

## Why

La tarjeta de crédito de Mi Plata solo permite "retirar" hasta el cupo y cobra un 2 % mensual plano sobre la deuda, sin que el cliente sepa cuánto pagará por una compra. Un medio de pago que financia compras a cuotas debe mostrar, en cada transacción, el plazo elegido, el interés aplicado y la cuota mensual resultante.

## What Changes

- Nueva operación de **compra a cuotas** con la tarjeta de crédito: el cliente indica el valor de la compra y el número de cuotas.
- **Tasa de interés mensual según el plazo:** hasta 2 cuotas 0 % (sin interés), de 3 a 6 cuotas 1,9 %, de 7 cuotas en adelante 2,3 %.
- **Cuota mensual** con la fórmula de referencia: `(capital × tasa) / (1 − (1 + tasa)^(−n))`; sin interés, capital / n.
- **Deuda y cupo:** la compra suma a la deuda el capital más todos los intereses del plazo (cuota × n) y ese total consume el cupo disponible; la compra se rechaza si el total supera el cupo.
- **Cada transacción muestra su cuota mensual:** el resultado de la compra y el historial de movimientos incluyen número de cuotas, cuota mensual y total a pagar.
- **BREAKING:** se elimina el estado mensual de la tarjeta (2 % sobre la deuda), porque el interés ya va en las cuotas y mantenerlo cobraría dos veces. Ningún producto soporta ya estado mensual.
- La landing page deja de anunciar el 2 % mensual y describe la financiación a cuotas con sus tasas.

## Capabilities

### New Capabilities
- `credit-card-installments`: compra a cuotas con la tarjeta, tasas por plazo, cálculo de la cuota mensual, efecto en deuda y cupo, y visibilidad de la cuota en cada transacción.

### Modified Capabilities
- `monthly-statement`: se retira el interés mensual de la tarjeta y la operación pasa a rechazarse para todos los productos.
- `account-types`: "Product description by type" ya no indica que la tarjeta soporte estado mensual.
- `web-client`: "Client operations" suma la compra a cuotas con su cuota mensual visible y deja de ofrecer el estado mensual.
- `landing-page`: "Institutional presentation" describe la tarjeta con financiación a cuotas en lugar del 2 % mensual.

## Impact

- Dominio: `CreditCard` (compra a cuotas, cálculo de cuota, ya no soporta estado mensual), `Movement` con datos opcionales de cuotas, nuevo tipo de movimiento de compra a cuotas, nuevos errores de plazo inválido y de producto sin compras a cuotas.
- Aplicación: nuevo `PurchaseUseCase` con DTO; `GetBalanceUseCase` y `GetMovementsUseCase` exponen los datos de cuotas.
- Persistencia: los snapshots de movimientos ganan campos opcionales; los datos guardados siguen cargando sin migración.
- UI web: formulario de compra con cuotas y vista previa de la cuota en `app/(panel)/cliente/page.js`; se quita la sección de estado mensual; textos de la tarjeta en `app/content/bank.js`.
- Tests existentes que asumen el 2 % mensual (`CreditCard`, `ApplyMonthlyStatementUseCase`, `AccountPolymorphism`, `bankContent`) deben actualizarse.
- Documentación: README y `docs/UML-Diagram.mmd`.
- Fuera de alcance: la consola (`src/main.js`) no incorpora compras a cuotas.
