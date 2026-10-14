# Design

## Context

Cada cliente tiene un `User` con un único producto (`Account`) y las cuentas se guardan por nombre de usuario (`accountId` = nombre). `WithdrawUseCase` y `DepositUseCase` ya aplican las reglas por producto (interés de retiro en ahorros, sobregiro en corriente, cupo en tarjeta, abono a deuda al consignar). Los movimientos solo conocen `WITHDRAW`, `DEPOSIT` e `INTEREST`. Ver proposal.md para la motivación.

## Goals / Non-Goals

**Goals:**
- Reutilizar las reglas de retiro y consignación de cada producto, sin duplicarlas.
- Que una transferencia sea atómica: o cambian ambas cuentas o ninguna.
- Distinguir transferencias en el historial sin cambiar el formato de persistencia.

**Non-Goals:**
- Comisiones o límites diarios de transferencia.
- Transferencias a cuentas externas o programadas.
- Soporte en la consola (`src/main.js`); esta entrega es solo web.
- Confirmación en dos pasos o notificaciones al destinatario.

## Decisions

1. **Reutilizar `withdrawFunds`/`depositFunds` con un tipo de movimiento opcional.** `Account.withdrawFunds(amount, type = WITHDRAW)` y `depositFunds(amount, type = DEPOSIT)`; `SavingsAccount.withdrawFunds` reenvía el tipo. Alternativa descartada: métodos `transferOut/transferIn` por producto, que duplicarían las reglas por tipo de cuenta. Consecuencia: en ahorros una transferencia enviada también cobra el interés de retiro del 1,5 %, igual que un retiro (supuesto, ver Open Questions).
2. **Tipos nuevos `TRANSFER_OUT` y `TRANSFER_IN` en `MovementType`.** Los snapshots guardan el tipo como texto, así que los datos existentes siguen cargando y no hace falta migrar.
3. **`TransferUseCase` con `TransferDTO`** (`fromAccountId`, `toAccountId`, `amount`), que recibe `UserRepository` y `AccountRepository`. Orden: validar DTO → rechazar si origen = destino → buscar destinatario (inexistente → `Account not found`, gerente → rechazo) → `withdrawFunds` en origen → `depositFunds` en destino → guardar ambas. Toda validación ocurre antes de mutar, y `depositFunds` no puede fallar con un monto ya validado, por lo que no hay estado intermedio persistido.
4. **Error nuevo `SameAccountTransferError`** (código `SAME_ACCOUNT_TRANSFER_ERROR`) con mensaje en español en `errorMessages.js`. Destinatario inexistente reutiliza el patrón `Account not found`; el gerente se rechaza con el mismo error de cuenta no encontrada para no revelar su existencia como destino.
5. **`ListTransferRecipientsUseCase({ name })`** filtra `findAll()` a clientes distintos del solicitante, ordenados por nombre, y devuelve solo `name`, `fullName` y `typeName`/`type`. No incluye saldos. Se mantiene separado de `ListUsersUseCase` (que es de administración y expone estado de bloqueo).
6. **UI:** nueva sección "Transferir" en `cliente/page.js` con un `CollapsibleSection` y un desplegable (`<select>`) con las cuentas disponibles más el campo de monto; al enviar llama al caso de uso y refresca saldo y movimientos con el mismo flujo `run` de las otras operaciones. `MOVEMENT_LABELS` suma "Transferencia enviada" y "Transferencia recibida".

## Risks / Trade-offs

- [Interés de retiro cobrado en transferencias desde ahorros] → Documentado en el spec; si el negocio prefiere exentarlas, se cambia solo en la decisión 1 con un parámetro adicional.
- [Dos escrituras en `localStorage` no son transaccionales] → Se guarda primero el origen y luego el destino tras validar todo; el único fallo posible es de almacenamiento del navegador, que ya afecta al resto de operaciones.
- [Dos pestañas con la misma sesión pueden operar sobre datos desactualizados] → Igual que el resto de operaciones; fuera de alcance.

## Open Questions

- ¿Las transferencias desde ahorros deben cobrar el interés de retiro? Se asume que sí para mantener una sola regla de retiro por producto.
