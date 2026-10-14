# Proposal

## Why

Hoy una tarjeta con deuda de 300.000 acepta una consignación de 450.000: la deuda queda en 0 y los 150.000 sobrantes pasan a un saldo a favor que la tarjeta no muestra, es decir, dinero sin registrar. Además, retirar con la tarjeta es un avance de efectivo que no cobra ni registra interés, a diferencia de la cuenta de ahorros y de las compras a cuotas.

## What Changes

- **Los pagos a la tarjeta no pueden superar la deuda:** una consignación (o transferencia recibida) mayor a la deuda actual se rechaza con un mensaje claro y no cambia nada. Con deuda 0 cualquier pago se rechaza.
- **Los retiros con la tarjeta cobran 2 % de interés:** el interés se suma a la deuda junto con el monto y queda registrado como un movimiento aparte. Retirar 300.000 deja la deuda en 306.000 con un movimiento de interés de 6.000 y otro de retiro de 300.000.
- **El monto más el interés debe caber en el cupo disponible;** si no cabe, el retiro se rechaza sin cobrar interés. Lo mismo aplica cuando el dinero sale de la tarjeta por una transferencia.
- **Un saldo a favor que ya exista** (por pagos de más anteriores) deja de estar oculto: la tarjeta lo muestra junto a la deuda y el cupo.
- La transferencia a una tarjeta valida el pago antes de mover dinero, de modo que un rechazo no deja cambios en el origen.
- **BREAKING:** retirar con la tarjeta ya no es gratis; y un pago superior a la deuda, que antes se aceptaba, ahora se rechaza.

## Capabilities

### New Capabilities
Ninguna.

### Modified Capabilities
- `account-types`: nuevas reglas de pagos de la tarjeta y de interés por retiro, y ajuste de "Credit card limit".
- `account-transfers`: la transferencia desde una tarjeta cobra el interés de retiro y la transferencia a una tarjeta no puede superar su deuda.
- `web-client`: aviso y movimiento del interés de retiro, y mensaje de pago superior a la deuda.
- `landing-page`: la tarjeta anuncia el 2 % de interés en retiros.

## Impact

- Dominio: `CreditCard` (retiro con interés, validación de pagos, descripción con saldo a favor), `Account` (validación previa de depósitos) y un error nuevo `PaymentExceedsDebtError`.
- Aplicación: `TransferUseCase` valida el depósito del destinatario antes de retirar del origen.
- Web: mensaje en español del error nuevo, aviso del 2 % en la vista del cliente y texto de la tarjeta en `app/content/bank.js`.
- Persistencia: sin cambios de formato; los saldos a favor ya guardados se conservan.
- Tests existentes que suponen retiros de tarjeta sin interés o pagos mayores a la deuda deben actualizarse (`CreditCard`, `AccountPolymorphism`, `TransferUseCases`, `bankContent`, entre otros).
- Documentación: README y `docs/UML-Diagram.mmd`.
- Fuera de alcance: la consola (`src/main.js`) no cambia más allá de mostrar el mensaje del error nuevo.
