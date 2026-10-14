# Design

## Context

`CreditCard` hereda `withdrawFunds`/`depositFunds` de `Account`: retirar usa primero el saldo y el resto lo carga a `creditUsed`; consignar paga primero `creditUsed` y manda el sobrante a `#balance`. Como la tarjeta nace con saldo 0, ese saldo solo puede crecer por pagos de más, y `describe()` no lo muestra. `SavingsAccount` ya resuelve "interés antes del retiro" validando todo primero y registrando el interés como movimiento propio. `TransferUseCase` retira del origen y luego consigna al destino sin validar antes el depósito. Ver proposal.md para el motivo y las decisiones de negocio (rechazar el excedente, 2 % sobre el monto retirado).

## Goals / Non-Goals

**Goals:**
- Que ningún dinero quede sin registrar en la tarjeta: el pago nunca supera la deuda.
- Registrar el interés de retiro como un movimiento propio, igual que ahorros.
- Mantener atómicas las transferencias aunque el destinatario rechace el pago.

**Non-Goals:**
- Devolver o migrar saldos a favor existentes: se conservan y se muestran.
- Interés distinto por tipo de retiro o por plazo; es una sola tasa fija.
- Cambiar las compras a cuotas, que ya traen su interés.

## Decisions

1. **Rechazar en lugar de aplicar parcialmente.** `CreditCard.depositFunds` lanza `PaymentExceedsDebtError` (`PAYMENT_EXCEEDS_DEBT_ERROR`) cuando el monto supera la deuda, incluida deuda 0. Alternativas descartadas: abonar solo la deuda (el cliente no sabría qué pasó con el resto) y mostrar el saldo a favor (reintroduce el dinero ocioso en una tarjeta).
2. **Validación previa del depósito.** `Account` gana `assertCanDeposit(amount)` (la validación de monto positivo actual) que `depositFunds` llama primero; `CreditCard` lo extiende con la regla de la deuda. `TransferUseCase` lo invoca sobre el destinatario antes de retirar del origen, así un pago rechazado no deja el origen modificado ni siquiera en repositorios que devuelven el mismo objeto.
3. **Interés de retiro dentro de `CreditCard.withdrawFunds`.** Valida el monto, calcula `Math.round(monto × 0,02)`, comprueba que monto + interés quepan en el dinero disponible y, solo entonces, registra el interés con `_charge(..., INTEREST)` y llama a `super.withdrawFunds`. Mismo orden que ahorros: movimiento de interés primero y luego el retiro (o la transferencia enviada). La constante vive junto a la del cupo en `CreditCard`. Al pasar por `withdrawFunds`, las transferencias desde la tarjeta cobran el interés sin código extra.
4. **Saldo a favor heredado visible.** `CreditCard.describe()` añade `| Saldo a favor: $X` solo cuando el saldo es positivo. `hasOpenPosition()` ya lo cuenta para impedir eliminar al usuario con dinero pendiente. No se toca el dato guardado.
5. **UI.** Mensaje en español de `PAYMENT_EXCEEDS_DEBT_ERROR` en `errorMessages.js` ("El pago supera la deuda actual de la tarjeta."), un texto de ayuda en la vista de tarjeta ("Los retiros con la tarjeta cobran 2 % de interés") y, en `bank.js`, la condición de la tarjeta con el interés de retiro. El interés ya aparece como movimiento "Intereses" sin cambios en la tabla.

## Risks / Trade-offs

- [Un cliente con deuda 0 ya no puede consignar a su tarjeta] → Es lo pedido: no hay nada que pagar; el mensaje lo explica.
- [Saldos a favor ya guardados siguen siendo gastables en retiros y compras] → Se muestran para que no estén ocultos; no se migran ni se reembolsan.
- [Retirar con la tarjeta pasa a costar 2 %, un cambio de comportamiento] → Está marcado como BREAKING; las compras a cuotas siguen siendo la vía con tasa escalonada.
- [El interés se cobra aunque parte del retiro salga de un saldo a favor heredado] → Caso residual de datos antiguos; se acepta.

## Open Questions

Ninguna.
